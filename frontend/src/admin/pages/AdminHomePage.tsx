import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import type { AppointmentStats } from '@shared/types'
import StatCard from '@admin/components/StatCard'
import AppointmentRow from '@admin/components/AppointmentRow'
import ActivityLog from '@admin/components/ActivityLog'
import EmptyState from '@shared/components/EmptyState'
import { CalendarIcon, ClockIcon, ChartIcon } from '@shared/components/Icons'
import styles from './AdminHomePage.module.css'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatNextAvailableDay(value: string | null): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<AppointmentStats>('/api/v1/admin/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <div>
          <h1 className={styles.greetingTitle}>{getGreeting()} Dr. Patel</h1>
          <p className={styles.greetingDate}>{formatDate()}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Today's Queue" value={stats?.today_count ?? 0} icon={<CalendarIcon />} />
        <StatCard label="Pending Requests" value={stats?.pending_count ?? 0} icon={<ClockIcon />} variant="accent" />
        <StatCard label="Completion Rate" value={`${stats?.completion_rate ?? 0}%`} icon={<ChartIcon />} variant="success" />
        <StatCard label="Next Available Day" value={formatNextAvailableDay(stats?.next_available_day ?? null)} icon={<CalendarIcon />} variant="default" />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Schedule</h2>
          <span className={styles.badge}>{stats?.today_appointments.length ?? 0} appointments</span>
        </div>
        {stats?.today_appointments.length ? (
          <div className={styles.list}>
            {stats.today_appointments.map((appt) => (
              <AppointmentRow key={appt.id} appointment={appt} />
            ))}
          </div>
        ) : (
          <EmptyState heading="No appointments today" variant="appointments" />
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
        </div>
        <ActivityLog />
      </div>
    </div>
  )
}
