import { useState, useEffect, type FormEvent } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AppointmentResponse, PrescriptionResponse } from '@shared/types'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import styles from './EditAppointmentModal.module.css'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface EditAppointmentModalProps {
  open: boolean
  onClose: () => void
  appointment: AppointmentResponse
  onSaved: () => void
}

export default function EditAppointmentModal({ open, onClose, appointment, onSaved }: EditAppointmentModalProps) {
  const { toast } = useToast()
  const [notes, setNotes] = useState(appointment.notes || '')
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [rxNotes, setRxNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setNotes(appointment.notes || '')
    setLoading(true)
    apiRequest<PrescriptionResponse[]>(`/api/v1/admin/prescriptions/${appointment.id}`)
      .then((rx) => {
        setPrescriptions(rx)
        if (rx.length > 0) {
          const latest = rx[0]
          setDiagnosis(latest.diagnosis || '')
          const medList = Array.isArray(latest.medicines?.medicines)
            ? latest.medicines.medicines
            : Array.isArray(latest.medicines)
            ? latest.medicines
            : []
          setMedicines(medList.length > 0 ? medList : [{ name: '', dosage: '', frequency: '', duration: '' }])
          setRxNotes(latest.notes || '')
        } else {
          setDiagnosis('')
          setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }])
          setRxNotes('')
        }
      })
      .catch(() => {
        setPrescriptions([])
        setDiagnosis('')
        setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }])
        setRxNotes('')
      })
      .finally(() => setLoading(false))
  }, [open, appointment])

  function addMedicine() {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  function removeMedicine(i: number) {
    setMedicines(medicines.filter((_, idx) => idx !== i))
  }

  function updateMedicine(i: number, field: keyof Medicine, value: string) {
    const updated = [...medicines]
    updated[i] = { ...updated[i], [field]: value }
    setMedicines(updated)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiRequest(`/api/v1/admin/appointments/${appointment.id}/notes`, {
        method: 'PATCH',
        body: { notes: notes || null },
      })

      const hasContent = diagnosis || medicines.some(m => m.name.trim()) || rxNotes
      if (hasContent) {
        const body = {
          diagnosis,
          medicines: { medicines: medicines.filter(m => m.name.trim()) },
          notes: rxNotes || null,
        }
        if (prescriptions.length > 0) {
          await apiRequest(`/api/v1/admin/prescriptions/${prescriptions[0].id}`, {
            method: 'PATCH',
            body,
          })
        } else {
          await apiRequest('/api/v1/admin/prescriptions', {
            method: 'POST',
            body: { appointment_id: appointment.id, ...body },
          })
        }
      }

      toast('Appointment updated', 'success')
      onSaved()
      onClose()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Appointment" maxWidth="wide">
      {loading ? (
        <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : (
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Patient Notes</label>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add notes about this appointment..."
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <label className={styles.label}>Diagnosis</label>
            <textarea
              className={styles.textarea}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={2}
              placeholder="Enter diagnosis..."
            />
          </div>

          <div className={styles.field}>
            <div className={styles.medHeader}>
              <label className={styles.label}>Medicines</label>
              <button type="button" className={styles.addBtn} onClick={addMedicine}>+ Add</button>
            </div>
            {medicines.map((med, i) => (
              <div key={i} className={styles.medRow}>
                <input className={styles.medInput} placeholder="Name" value={med.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} />
                <input className={styles.medInput} placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} />
                <input className={styles.medInput} placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)} />
                <input className={styles.medInput} placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} />
                {medicines.length > 1 && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeMedicine(i)}>&times;</button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Doctor Notes / Advice</label>
            <textarea
              className={styles.textarea}
              value={rxNotes}
              onChange={(e) => setRxNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes or advice..."
            />
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" size="small" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="small" type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
