import { useEffect, useState, useRef, useCallback } from 'react'
import { apiRequest } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AdminPatientResponse, PatientResponse, AppointmentResponse } from '@shared/types'
import PatientRow from '@admin/components/PatientRow'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminPatientsPage.module.css'

interface PatientDetail {
  patient: PatientResponse
  appointments: AppointmentResponse[]
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<AdminPatientResponse[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, AppointmentResponse[]>>({})
  const { toast } = useToast()

  const fetchPatients = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const path = q ? `/api/v1/admin/patients?search=${encodeURIComponent(q)}` : '/api/v1/admin/patients'
      const data = await apiRequest<AdminPatientResponse[]>(path)
      setPatients(data)
    } catch {
      toast('Failed to load patients', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)

  function handleSearch(val: string) {
    setSearch(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchPatients(val || undefined), 300)
  }

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
  }, [])

  async function toggleExpand(patientId: string) {
    if (expandedId === patientId) {
      setExpandedId(null)
      return
    }
    setExpandedId(patientId)

    if (!details[patientId]) {
      try {
        const data = await apiRequest<PatientDetail>(`/api/v1/admin/patients/${patientId}`)
        setDetails((prev) => ({ ...prev, [patientId]: data.appointments }))
      } catch {
        toast('Failed to load patient details', 'error')
      }
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Patients</h1>

      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {loading && (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="4rem" borderRadius="var(--radius-md)" />
          ))}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <EmptyState heading="No patients found" subtext={search ? 'Try a different search' : 'No patients registered yet'} />
      )}

      {!loading && patients.length > 0 && (
        <div className={styles.grid}>
          {patients.map((p) => (
            <PatientRow
              key={p.id}
              patient={p}
              appointments={details[p.id] || []}
              expanded={expandedId === p.id}
              onToggle={() => toggleExpand(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
