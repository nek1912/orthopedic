import { useEffect, useState, useCallback } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AppointmentResponse } from '@shared/types'
import Modal from '@shared/components/Modal'
import PrescriptionForm from '@admin/components/PrescriptionForm'
import AppointmentRow from '@admin/components/AppointmentRow'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminTodayPage.module.css'

function localDateISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function AdminTodayPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [completeModal, setCompleteModal] = useState<AppointmentResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchToday = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<{ appointments: AppointmentResponse[] }>(`/api/v1/admin/appointments?status=accepted&date=${localDateISO(new Date())}`)
      setAppointments(data.appointments)
    } catch {
      toast('Failed to load today', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchToday() }, [fetchToday])

  async function handleArrive(appt: AppointmentResponse) {
    try {
      await apiRequest(`/api/v1/admin/appointments/${appt.id}/arrive`, { method: 'PATCH' })
      toast(`${appt.patient_name} has arrived`, 'success')
      fetchToday()
    } catch {
      toast('Failed to mark arrival', 'error')
    }
  }

  async function handleCancel(appt: AppointmentResponse) {
    try {
      await apiRequest(`/api/v1/admin/appointments/${appt.id}/cancel`, { method: 'PATCH' })
      toast(`${appt.patient_name}'s appointment cancelled`, 'success')
      fetchToday()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to cancel appointment', 'error')
    }
  }

  async function handleComplete(data: { appointment_id: string; diagnosis: string; medicines: Record<string, unknown>; notes: string }) {
    setSubmitting(true)
    try {
      await apiRequest('/api/v1/admin/prescriptions', { method: 'POST', body: data })
      await apiRequest(`/api/v1/admin/appointments/${data.appointment_id}/complete`, { method: 'PATCH' })
      toast('Appointment completed', 'success')
      setCompleteModal(null)
      fetchToday()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to complete', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Today's Queue</h1>

      {loading && (
        <div className={styles.list}>
          {[1, 2].map((i) => (
            <Skeleton key={i} height="4rem" borderRadius="var(--radius-md)" />
          ))}
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <EmptyState heading="No appointments today" subtext="Schedule is clear." />
      )}

      {!loading && appointments.length > 0 && (
        <div className={styles.list}>
          {appointments.map((a) => (
            <AppointmentRow
              key={a.id}
              appointment={a}
              showActions={true}
              onArrive={() => handleArrive(a)}
              onComplete={() => setCompleteModal(a)}
              onCancel={() => handleCancel(a)}
            />
          ))}
        </div>
      )}

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Appointment" maxWidth="wide">
        {completeModal && (
          <PrescriptionForm
            appointmentId={completeModal.id}
            onSubmit={handleComplete}
            onCancel={() => setCompleteModal(null)}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  )
}
