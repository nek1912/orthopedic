import { useState } from 'react'
import type { AppointmentResponse } from '@shared/types'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import { StatusBadge } from '@shared/components/Badge'
import Button from '@shared/components/Button'
import Card from '@shared/components/Card'
import Modal from '@shared/components/Modal'
import styles from './AppointmentCard.module.css'

interface AppointmentCardProps {
  appointment: AppointmentResponse
  onUpdate: () => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { toast } = useToast()

  async function handleCancel() {
    setCancelling(true)
    try {
      await apiRequest(`/api/v1/appointments/${appointment.id}/cancel`, { method: 'PATCH' })
      toast('Appointment cancelled', 'success')
      setShowCancel(false)
      onUpdate()
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.detail, 'error')
      } else {
        toast('Failed to cancel', 'error')
      }
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <Card variant="static" className={styles.card}>
        <div className={styles.top}>
          <span className={styles.date}>{formatDate(appointment.requested_date)}</span>
          <StatusBadge status={appointment.status} />
        </div>
        <h3 className={styles.service}>
          {appointment.service_name || appointment.service_description || 'Appointment'}
        </h3>
        <div className={styles.details}>
          {appointment.time_slot_start && (
            <p className={styles.detail}>
              Time: {formatTime(appointment.time_slot_start)} - {formatTime(appointment.time_slot_end)}
            </p>
          )}
          {appointment.rejection_reason && (
            <p className={styles.detail}>Reason: {appointment.rejection_reason}</p>
          )}
          {appointment.suggested_date && (
            <p className={styles.detail}>Suggested: {formatDate(appointment.suggested_date)}</p>
          )}
          <p className={styles.meta}>Requested: {formatDate(appointment.created_at?.split('T')[0])}</p>
        </div>
        {appointment.status === 'pending' && (
          <div className={styles.actions}>
            <Button variant="ghost" size="small" onClick={() => setShowCancel(true)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>

      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Cancel Appointment">
        <div className={styles.modalBody}>
          <p>Are you sure you want to cancel this appointment?</p>
          <div className={styles.modalActions}>
            <Button variant="ghost" size="small" onClick={() => setShowCancel(false)}>
              Keep
            </Button>
            <Button variant="primary" size="small" loading={cancelling} onClick={handleCancel}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
