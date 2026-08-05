import type { AdminPatientResponse, AppointmentResponse } from '@shared/types'
import { StatusBadge } from '@shared/components/Badge'
import AdminPrescriptionView from './AdminPrescriptionView'
import Skeleton from '@shared/components/Skeleton'
import styles from './PatientDetail.module.css'

interface PatientDetailProps {
  patient: AdminPatientResponse
  appointments: AppointmentResponse[]
  loading: boolean
  onEditAppointment?: (appt: AppointmentResponse) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default function PatientDetail({ patient, appointments, loading, onEditAppointment }: PatientDetailProps) {
  const sorted = [...appointments].sort((a, b) => b.requested_date.localeCompare(a.requested_date))

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {patient.name.trim().split(/\s+/).filter(Boolean).length > 1
            ? (patient.name.trim().split(/\s+/)[0].charAt(0) + patient.name.trim().split(/\s+/).slice(-1)[0].charAt(0)).toUpperCase()
            : patient.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.headerInfo}>
          <h2 className={styles.name}>{patient.name}</h2>
          <span className={styles.email}>{patient.email}</span>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Phone</span>
          <span className={styles.infoValue}>{patient.phone || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>DOB</span>
          <span className={styles.infoValue}>{patient.dob || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Last Visit</span>
          <span className={styles.infoValue}>{patient.last_visit_date ? formatDate(patient.last_visit_date) : '—'}</span>
        </div>
      </div>

      <div className={styles.statsRow}>
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

      <div className={styles.timelineSection}>
        <h3 className={styles.timelineTitle}>Appointments</h3>

        {loading && (
          <div className={styles.timeline}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.timelineCard}>
                <Skeleton width="40%" height="0.875rem" />
                <div style={{ marginTop: '8px' }}>
                  <Skeleton width="70%" height="0.75rem" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className={styles.empty}>No appointments yet</div>
        )}

        {!loading && sorted.length > 0 && (
          <div className={styles.timeline}>
            {sorted.map((a) => (
              <div key={a.id} className={styles.timelineCard}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <div className={styles.dot} />
                    <div className={styles.cardLine} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardDate}>{formatDate(a.requested_date)}</span>
                      <StatusBadge status={a.status} />
                      {a.status === 'completed' && onEditAppointment && (
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => onEditAppointment(a)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <h4 className={styles.cardService}>
                      {a.service_name || a.service_description || 'General Consultation'}
                    </h4>
                    {a.time_slot_start && (
                      <span className={styles.cardTime}>
                        {formatTime(a.time_slot_start)} – {formatTime(a.time_slot_end)}
                      </span>
                    )}
                    {a.notes && <p className={styles.cardNotes}>{a.notes}</p>}
                    {a.rejection_reason && <p className={styles.cardReason}>Reason: {a.rejection_reason}</p>}

                    {a.prescriptions && a.prescriptions.length > 0 && (
                      <div className={styles.cardPrescription}>
                        <AdminPrescriptionView prescriptions={a.prescriptions} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
