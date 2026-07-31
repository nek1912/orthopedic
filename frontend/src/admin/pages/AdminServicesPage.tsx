import { useEffect, useState, useCallback } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { ServiceResponse } from '@shared/types'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminServicesPage.module.css'

interface ServiceForm {
  name: string
  description: string
  duration_minutes: number
  default_fee: number
  preparation_notes: string
  requires_followup: boolean
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  duration_minutes: 30,
  default_fee: 0,
  preparation_notes: '',
  requires_followup: false,
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceResponse | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<ServiceResponse[]>('/api/v1/admin/services')
      setServices(data)
    } catch {
      toast('Failed to load services', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchServices() }, [fetchServices])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (service: ServiceResponse) => {
    setEditing(service)
    setForm({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      default_fee: service.default_fee,
      preparation_notes: service.preparation_notes || '',
      requires_followup: service.requires_followup,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (editing) {
        await apiRequest(`/api/v1/admin/services/${editing.id}`, { method: 'PATCH', body: form })
      } else {
        await apiRequest('/api/v1/admin/services', { method: 'POST', body: form })
      }
      toast(editing ? 'Service updated' : 'Service created', 'success')
      setModalOpen(false)
      fetchServices()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to save service', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (service: ServiceResponse) => {
    try {
      await apiRequest(`/api/v1/admin/services/${service.id}/active`, {
        method: 'PATCH',
        body: { active: !service.is_active },
      })
      toast(service.is_active ? 'Service deactivated' : 'Service activated', 'success')
      fetchServices()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to update service', 'error')
    }
  }

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Services</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>Add Service</button>
      </div>
      {services.length ? (
        <div className={styles.grid}>
          {services.map((service) => (
            <div key={service.id} className={`${styles.card} ${!service.is_active ? styles.inactive : ''}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{service.name}</h3>
                <span className={`${styles.badge} ${service.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={styles.cardMeta}>
                <span>{service.duration_minutes} mins</span>
                {service.default_fee > 0 && <span>₹{service.default_fee}</span>}
              </div>
              {service.description && <p className={styles.cardDesc}>{service.description}</p>}
              <div className={styles.cardActions}>
                <button type="button" className={styles.editBtn} onClick={() => openEdit(service)}>Edit</button>
                <button type="button" className={styles.toggleBtn} onClick={() => handleToggleActive(service)}>
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState heading="No services yet" subtext="Add your first service to get started." variant="default" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <div className={styles.modal}>
          <div className={styles.field}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Duration (mins)</label>
              <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </div>
            <div className={styles.field}>
              <label>Default Fee (₹)</label>
              <input type="number" value={form.default_fee} onChange={(e) => setForm({ ...form, default_fee: Number(e.target.value) })} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Preparation Notes</label>
            <textarea value={form.preparation_notes} onChange={(e) => setForm({ ...form, preparation_notes: e.target.value })} />
          </div>
          <div className={styles.checkbox}>
            <input type="checkbox" checked={form.requires_followup} onChange={(e) => setForm({ ...form, requires_followup: e.target.checked })} />
            <label>Requires Follow-up</label>
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" size="small" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="small" loading={submitting} onClick={handleSubmit}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
