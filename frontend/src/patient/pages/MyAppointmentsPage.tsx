import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, ApiError } from '@shared/api/client'
import type { AppointmentResponse } from '@shared/types'
import Navbar from '@shared/components/Navbar'
import Button from '@shared/components/Button'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import AppointmentCard from '@patient/components/AppointmentCard'
import styles from './MyAppointmentsPage.module.css'

export default function MyAppointmentsPage() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState(false)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    setAuthError(false)
    try {
      const data = await apiRequest<{ appointments: AppointmentResponse[] }>('/api/v1/appointments')
      setAppointments(data.appointments)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthError(true)
      } else {
        setError('Could not load appointments. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  if (authError) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <EmptyState
              heading="Please log in"
              subtext="You need to be logged in to view your appointments."
              variant="appointments"
              action={
                <Button variant="primary" size="default" onClick={() => navigate('/login')}>
                  Log In
                </Button>
              }
            />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Appointments</h1>
            <Button variant="primary" size="small" onClick={() => navigate('/book')}>
              + New
            </Button>
          </div>

          {loading && (
            <div className={styles.list}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <Skeleton width="60%" height="1.2rem" />
                  <Skeleton width="100%" height="0.8rem" />
                  <Skeleton width="40%" height="0.8rem" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <Button variant="secondary" size="small" onClick={fetchAppointments}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <EmptyState
              heading="No appointments yet"
              subtext="Book your first appointment to get started."
              variant="appointments"
              action={<Button variant="primary" size="default" onClick={() => navigate('/book')}>Book Appointment</Button>}
            />
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className={styles.list}>
              {appointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} onUpdate={fetchAppointments} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
