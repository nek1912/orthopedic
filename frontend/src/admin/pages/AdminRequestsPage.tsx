import { useEffect, useState, useCallback, useRef } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AppointmentResponse, AdminAppointmentDetail } from '@shared/types'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import TimeSlotPicker from '@admin/components/TimeSlotPicker'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminRequestsPage.module.css'

export default function AdminRequestsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [selected, setSelected] = useState<AppointmentResponse | null>(null)
  const [detail, setDetail] = useState<AdminAppointmentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState<AppointmentResponse | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<{ appointments: AppointmentResponse[] }>('/api/v1/admin/appointments?status=pending')
      setAppointments(data.appointments)
    } catch {
      toast('Failed to load requests', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const selectedIdRef = useRef<string | null>(null)

  const selectRequest = useCallback(async (appt: AppointmentResponse) => {
    setSelected(appt)
    setDetail(null)
    setDetailLoading(true)
    selectedIdRef.current = appt.id
    const id = appt.id
    try {
      const data = await apiRequest<AdminAppointmentDetail>(`/api/v1/admin/appointments/${id}`)
      if (selectedIdRef.current !== id) return
      setDetail(data)
    } catch (err) {
      if (selectedIdRef.current !== id) return
      if (err instanceof ApiError) {
        toast(err.detail, 'error')
      } else {
        toast('Unable to load request details', 'error')
      }
    } finally {
      if (selectedIdRef.current === id) setDetailLoading(false)
    }
  }, [toast])

  async function handleAccept(start: string, end: string) {
    if (!selected) return
    setSubmitting(true)
    try {
      await apiRequest(`/api/v1/admin/appointments/${selected.id}/accept`, {
        method: 'PATCH',
        body: { date: selected.requested_date, start_time: start, end_time: end },
      })
      toast('Appointment accepted', 'success')
      setSelected(null)
      setDetail(null)
      fetchRequests()
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.detail, 'error')
      } else {
        toast('Failed to accept', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!rejectModal) return
    setSubmitting(true)
    try {
      await apiRequest(`/api/v1/admin/appointments/${rejectModal.id}/reject`, {
        method: 'PATCH',
        body: { reason: rejectReason || null },
      })
      toast('Appointment rejected', 'success')
      setRejectModal(null)
      setRejectReason('')
      if (selected?.id === rejectModal.id) {
        setSelected(null)
        setDetail(null)
      }
      fetchRequests()
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.detail, 'error')
      } else {
        toast('Failed to reject', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Appointment Requests</h1>
        <div className={styles.skeleton} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Appointment Requests</h1>

      {appointments.length === 0 ? (
        <EmptyState heading="No pending requests" subtext="All caught up!" variant="appointments" />
      ) : (
        <div className={styles.inbox}>
          <div className={styles.list}>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className={`${styles.listItem} ${selected?.id === appt.id ? styles.selected : ''}`}
                onClick={() => selectRequest(appt)}
              >
                <div className={styles.avatar}>{appt.patient_name.charAt(0)}</div>
                <div className={styles.listItemInfo}>
                  <div className={styles.patientName}>{appt.patient_name}</div>
                  <div className={styles.serviceName}>{appt.service_name || appt.service_description}</div>
                  <div className={styles.date}>{appt.requested_date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.detail}>
            {selected && !detailLoading && detail && (
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.avatarLarge}>{detail.patient_name.charAt(0)}</div>
                  <div>
                    <div className={styles.patientNameLarge}>{detail.patient_name}</div>
                    <div className={styles.patientEmail}>{detail.patient_email}</div>
                    <div className={styles.patientPhone}>{detail.patient_phone}</div>
                  </div>
                </div>
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Service</div>
                  <div className={styles.detailValue}>{detail.service_name || detail.service_description}</div>
                </div>
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Preferred Date</div>
                  <div className={styles.detailValue}>{detail.requested_date}</div>
                </div>
                {detail.notes && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Notes</div>
                    <div className={styles.detailValue}>{detail.notes}</div>
                  </div>
                )}
                <div className={styles.slotSection}>
                  <div className={styles.detailLabel}>Assign Time Slot</div>
                  <TimeSlotPicker
                    date={detail.requested_date}
                    bookedSlots={[]}
                    unavailableSlots={[]}
                    onSelect={handleAccept}
                  />
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.rejectBtn} onClick={() => setRejectModal(detail)}>
                    Reject
                  </button>
                </div>
              </>
            )}
            {selected && detailLoading && (
              <Skeleton height="8rem" />
            )}
            {!selected && (
              <div className={styles.emptyDetail}>Select a request to view details</div>
            )}
            {selected && !detailLoading && !detail && (
              <div className={styles.emptyDetail}>Unable to load request details</div>
            )}
          </div>
        </div>
      )}

      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="Reject Appointment">
        <div className={styles.rejectModal}>
          <textarea
            className={styles.rejectTextarea}
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className={styles.rejectActions}>
            <Button variant="ghost" size="small" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancel</Button>
            <Button variant="primary" size="small" loading={submitting} onClick={handleReject}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
