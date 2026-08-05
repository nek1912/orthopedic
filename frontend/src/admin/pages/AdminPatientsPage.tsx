import { useEffect, useState, useRef, useCallback } from 'react'
import { apiRequest } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AdminPatientResponse, AppointmentResponse } from '@shared/types'
import PatientList from '@admin/components/PatientList'
import PatientDetail from '@admin/components/PatientDetail'
import EditAppointmentModal from '@admin/components/EditAppointmentModal'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminPatientsPage.module.css'

interface PatientDetailResponse {
  patient: AdminPatientResponse
  appointments: AppointmentResponse[]
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<AdminPatientResponse[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<PatientDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editModal, setEditModal] = useState<AppointmentResponse | null>(null)
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

  async function handleSelect(patientId: string) {
    if (selectedId === patientId) return
    setSelectedId(patientId)
    setDetailLoading(true)
    try {
      const data = await apiRequest<PatientDetailResponse>(`/api/v1/admin/patients/${patientId}`)
      setDetail(data)
    } catch {
      toast('Failed to load patient details', 'error')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const selectedPatient = patients.find((p) => p.id === selectedId) || null

  return (
    <div className={styles.page}>
      <div className={styles.listPanel}>
        <PatientList
          patients={patients}
          selectedId={selectedId}
          onSelect={handleSelect}
          search={search}
          onSearchChange={handleSearch}
          loading={loading}
        />
      </div>

      <div className={styles.detailPanel}>
        {!selectedId && !loading && patients.length > 0 && (
          <div className={styles.emptyState}>
            <EmptyState heading="Select a patient" subtext="Choose a patient from the list to view their details and appointment history." />
          </div>
        )}

        {!loading && patients.length === 0 && (
          <div className={styles.emptyState}>
            <EmptyState heading="No patients" subtext="No patients registered yet." />
          </div>
        )}

        {selectedId && detail && selectedPatient && (
          <PatientDetail
            patient={selectedPatient}
            appointments={detail.appointments}
            loading={detailLoading}
            onEditAppointment={(appt) => setEditModal(appt)}
          />
        )}

        {selectedId && detailLoading && (
          <div className={styles.emptyState}>
            <PatientDetail
              patient={selectedPatient || { id: selectedId, name: '', email: '', phone: null, dob: null, created_at: '', total_visits: 0, last_visit_date: null, pending_count: 0, completed_count: 0, prescription_count: 0 }}
              appointments={[]}
              loading={true}
            />
          </div>
        )}
      </div>

      {editModal && (
        <EditAppointmentModal
          open={!!editModal}
          onClose={() => setEditModal(null)}
          appointment={editModal}
          onSaved={() => {
            if (selectedId) {
              apiRequest<PatientDetailResponse>(`/api/v1/admin/patients/${selectedId}`)
                .then((data) => setDetail(data))
                .catch(() => {})
            }
          }}
        />
      )}
    </div>
  )
}
