import type { AppointmentResponse } from '@shared/types'
import { StatusBadge } from '@shared/components/Badge'
import { ClockIcon } from '@shared/components/Icons'
import styles from './AppointmentRow.module.css'

interface AppointmentRowProps {
  appointment: AppointmentResponse
  onAccept?: () => void
  onReject?: () => void
  onArrive?: () => void
  onComplete?: () => void
  onCancel?: () => void
  showActions?: boolean
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() || '?'
}

export default function AppointmentRow({ appointment, onAccept, onReject, onArrive, onComplete, onCancel, showActions = true }: AppointmentRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.avatar}>
        <span className={styles.avatarText}>{getInitial(appointment.patient_name)}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.top}>
          <span className={styles.patient}>{appointment.patient_name}</span>
          <StatusBadge status={appointment.status} />
        </div>
        <div className={styles.meta}>
          {appointment.time_slot_start && (
            <span>{appointment.time_slot_start.slice(0, 5)}</span>
          )}
          {appointment.time_slot_start && <span className={styles.sep}>&middot;</span>}
          <span>{formatDate(appointment.requested_date)}</span>
          <span className={styles.sep}>&middot;</span>
          <span>{appointment.service_name || appointment.service_description || 'General'}</span>
          <span className={styles.sep}>&middot;</span>
          <span className={styles.time}>
            <ClockIcon className={styles.timeIcon} />
            {timeAgo(appointment.created_at)}
          </span>
        </div>
      </div>
      {showActions && appointment.status === 'pending' && (
        <div className={styles.actions}>
          {onAccept && (
            <button className={styles.accept} onClick={onAccept} title="Accept">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </button>
          )}
          {onReject && (
            <button className={styles.reject} onClick={onReject} title="Reject">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      )}
      {showActions && appointment.status === 'accepted' && (
        <div className={styles.actions}>
          {onArrive && (
            <button className={styles.arrive} onClick={onArrive}>Arrived</button>
          )}
          {onComplete && (
            <button className={styles.complete} onClick={onComplete}>Complete</button>
          )}
          {onCancel && (
            <button className={styles.cancel} onClick={onCancel}>Cancel</button>
          )}
        </div>
      )}
    </div>
  )
}
