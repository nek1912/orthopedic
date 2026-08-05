import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, ApiError } from '@shared/api/client'
import { useAuth } from '@shared/context/AuthContext'
import type { PatientResponse } from '@shared/types'
import Navbar from '@shared/components/Navbar'
import Button from '@shared/components/Button'
import AppointmentCard from '@patient/components/AppointmentCard'
import EmptyState from '@shared/components/EmptyState'
import Skeleton from '@shared/components/Skeleton'
import { useEffect } from 'react'
import type { AppointmentResponse } from '@shared/types'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { patient, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: patient?.name || '',
    phone: patient?.phone || '',
    dob: patient?.dob || '',
  })

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [loadingAppts, setLoadingAppts] = useState(true)

  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true)
    try {
      const data = await apiRequest<{ appointments: AppointmentResponse[] }>('/api/v1/appointments')
      setAppointments(data.appointments)
    } catch {
      // silent
    } finally {
      setLoadingAppts(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await apiRequest<PatientResponse>('/api/v1/auth/profile', {
        method: 'PATCH',
        body: {
          name: form.name || undefined,
          phone: form.phone || undefined,
          dob: form.dob || undefined,
        },
      })
      localStorage.setItem('patient', JSON.stringify(updated))
      window.location.reload()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || 'Failed to update profile')
      } else {
        setError('Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!patient) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <EmptyState
              heading="Please log in"
              subtext="You need to be logged in to view your profile."
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
            <h1 className={styles.title}>My Profile</h1>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Name</label>
                {editing ? (
                  <input
                    type="text"
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                ) : (
                  <span className={styles.value}>{patient.name}</span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <span className={styles.value}>{patient.email}</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    className={styles.input}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Not set"
                  />
                ) : (
                  <span className={styles.value}>{patient.phone || 'Not set'}</span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    className={styles.input}
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                ) : (
                  <span className={styles.value}>{patient.dob || 'Not set'}</span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Member since</label>
                <span className={styles.value}>
                  {new Date(patient.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              {editing ? (
                <>
                  <Button variant="secondary" size="small" onClick={() => { setEditing(false); setForm({ name: patient.name, phone: patient.phone || '', dob: patient.dob || '' }) }}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="small" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Appointments</h2>
              <Button variant="primary" size="small" onClick={() => navigate('/book')}>
                + New
              </Button>
            </div>

            {loadingAppts && (
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

            {!loadingAppts && appointments.length === 0 && (
              <EmptyState
                heading="No appointments yet"
                subtext="Book your first appointment to get started."
                variant="appointments"
                action={<Button variant="primary" size="default" onClick={() => navigate('/book')}>Book Appointment</Button>}
              />
            )}

            {!loadingAppts && appointments.length > 0 && (
              <div className={styles.list}>
                {appointments.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} onUpdate={fetchAppointments} />
                ))}
              </div>
            )}
          </div>

          <div className={styles.logoutSection}>
            <Button variant="secondary" size="default" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
