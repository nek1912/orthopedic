import type { AdminPatientResponse, AppointmentResponse } from '@shared/types'
import { StatusBadge } from '@shared/components/Badge'
import styles from './PatientRow.module.css'

interface PatientRowProps {
  patient: AdminPatientResponse
  appointments?: AppointmentResponse[]
  expanded: boolean
  onToggle: () => void
}

function formatMonthYear(value: string): string {
  return new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function PatientRow({ patient, appointments = [], expanded, onToggle }: PatientRowProps) {
  const sortedAppointments = [...appointments].sort((a, b) => b.requested_date.localeCompare(a.requested_date))

  return (
    <article className={styles.card}>
      <button className={styles.header} onClick={onToggle} type="button">
        <div className={styles.avatar}>
          {(() => {
            const parts = patient.name.trim().split(/\s+/).filter(Boolean)
            if (parts.length === 0) return '?'
            if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
          })()}
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{patient.name}</span>
          <span className={styles.email}>{patient.email}</span>
        </div>
        <span className={styles.chevron} aria-hidden="true">{expanded ? '▾' : '▸'}</span>
      </button>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{patient.total_visits}</span>
          <span className={styles.statLabel}>Visits</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{patient.pending_count}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{patient.completed_count}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{patient.prescription_count}</span>
          <span className={styles.statLabel}>Prescriptions</span>
        </div>
      </div>

      <div className={styles.lastVisit}>
        <span className={styles.lastVisitLabel}>Last visit</span>
        <span className={styles.lastVisitValue}>
          {patient.last_visit_date ? formatMonthYear(patient.last_visit_date) : 'No visits yet'}
        </span>
      </div>

      {expanded && (
        <div className={styles.detail}>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{patient.phone || 'Not provided'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>DOB</span>
              <span className={styles.detailValue}>{patient.dob || 'Not provided'}</span>
            </div>
          </div>

          {sortedAppointments.length > 0 && (
            <div className={styles.timeline}>
              <p className={styles.timelineTitle}>Medical Timeline</p>
              {sortedAppointments.map((a) => (
                <div key={a.id} className={styles.timelineRow}>
                  <span className={styles.dot} />
                  <span className={styles.timelineDate}>{formatMonthYear(a.requested_date)}</span>
                  <span className={styles.timelineService}>{a.service_name || a.service_description || 'General'}</span>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
