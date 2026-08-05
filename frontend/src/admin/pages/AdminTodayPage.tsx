import { useEffect, useState, useCallback } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AppointmentResponse, AppointmentStats } from '@shared/types'
import Modal from '@shared/components/Modal'
import PrescriptionForm from '@admin/components/PrescriptionForm'
import AppointmentRow from '@admin/components/AppointmentRow'
import StatCard from '@admin/components/StatCard'
import ActivityLog from '@admin/components/ActivityLog'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import { CalendarIcon, ClockIcon, ChartIcon } from '@shared/components/Icons'
import Button from '@shared/components/Button'
import styles from './AdminTodayPage.module.css'

function localDateISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatNextAvailableDay(value: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AdminTodayPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)
  const [completeModal, setCompleteModal] = useState<AppointmentResponse | null>(null)
  const [cancelModal, setCancelModal] = useState<AppointmentResponse | null>(null)
  const [cancelReason, setCancelReason] = useState('')
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

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    apiRequest<AppointmentStats>('/api/v1/admin/stats')
      .then(setStats)
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false))
  }, [])

  useEffect(() => { fetchToday(); fetchStats() }, [fetchToday, fetchStats])

  function handleCancel(appt: AppointmentResponse) {
    setCancelModal(appt)
  }

  async function handleCancelConfirm() {
    if (!cancelModal || submitting) return
    setSubmitting(true)
    try {
      await apiRequest(`/api/v1/admin/appointments/${cancelModal.id}/cancel`, { 
        method: 'PATCH',
        body: { reason: cancelReason || null }
      })
      toast(`${cancelModal.patient_name}'s appointment cancelled`, 'success')
      setCancelModal(null)
      setCancelReason('')
      fetchToday()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to cancel appointment', 'error')
    } finally {
      setSubmitting(false)
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
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>{getGreeting()}, Doctor</h1>
        <p className={styles.greetingDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {statsLoading && (
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="4rem" borderRadius="var(--radius-md)" />
          ))}
        </div>
      )}

      {statsError && (
        <p className={styles.errorText}>Unable to load stats</p>
      )}

      {!statsLoading && !statsError && (
        <div className={styles.statsGrid}>
          <StatCard label="Today's Queue" value={stats?.today_count ?? 0} icon={<CalendarIcon />} variant="accent" />
          <StatCard label="Pending Requests" value={stats?.pending_count ?? 0} icon={<ClockIcon />} variant="warning" />
          <StatCard label="Completion Rate" value={`${Math.round(stats?.completion_rate ?? 0)}%`} icon={<ChartIcon />} />
          <StatCard label="Next Available Day" value={formatNextAvailableDay(stats?.next_available_day ?? null)} icon={<CalendarIcon />} variant="default" />
        </div>
      )}

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
              onComplete={() => setCompleteModal(a)}
              onCancel={() => handleCancel(a)}
            />
          ))}
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
        </div>
        <ActivityLog />
      </div>

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
      <Modal open={!!cancelModal} onClose={() => { setCancelModal(null); setCancelReason('') }} title="Cancel Appointment">
        <div className={styles.rejectModal}>
          <textarea
            className={styles.rejectTextarea}
            placeholder="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className={styles.rejectActions}>
            <Button variant="ghost" size="small" onClick={() => { setCancelModal(null); setCancelReason('') }}>Keep</Button>
            <Button variant="primary" size="small" loading={submitting} onClick={handleCancelConfirm}>Cancel Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
