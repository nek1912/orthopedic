import { useEffect, useState, useCallback } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { UnavailabilityResponse } from '@shared/types'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import { SLOTS } from '@admin/components/TimeSlotPicker'
import styles from './AdminSchedulePage.module.css'

function localDateISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function AdminSchedulePage() {
  const [entries, setEntries] = useState<UnavailabilityResponse[]>([])
  const [bookedCount, setBookedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addDate, setAddDate] = useState('')
  const [addStart, setAddStart] = useState('09:00')
  const [addEnd, setAddEnd] = useState('10:00')
  const [addRecurring, setAddRecurring] = useState('none')
  const [addReason, setAddReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<UnavailabilityResponse[]>('/api/v1/admin/unavailability')
      setEntries(data)
    } catch {
      toast('Failed to load schedule', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  async function fetchBooked() {
    try {
      const data = await apiRequest<{ appointments: unknown[] }>(
        `/api/v1/admin/appointments?status=accepted&date=${localDateISO(new Date())}`
      )
      setBookedCount(data.appointments.length)
    } catch {
      setBookedCount(null)
    }
  }

  useEffect(() => { fetchEntries() }, [fetchEntries])

  useEffect(() => { fetchBooked() }, [])

  async function handleAdd() {
    if (!addDate || !addStart || !addEnd) return
    setSubmitting(true)
    try {
      await apiRequest('/api/v1/admin/unavailability', {
        method: 'POST',
        body: { date: addDate, start_time: addStart, end_time: addEnd, recurring: addRecurring, reason: addReason || null },
      })
      toast('Unavailability added', 'success')
      setShowAdd(false)
      setAddDate('')
      setAddReason('')
      fetchEntries()
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to add', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/v1/admin/unavailability/${id}`, { method: 'DELETE' })
      toast('Entry removed', 'success')
      fetchEntries()
    } catch {
      toast('Failed to delete', 'error')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schedule</h1>
        <Button variant="primary" size="small" onClick={() => setShowAdd(true)}>+ Add</Button>
      </div>

      {bookedCount !== null && (
        <p className={styles.utilization}>
          {`${SLOTS.length} slots · ${bookedCount} booked · ${Math.max(SLOTS.length - bookedCount, 0)} available · ${SLOTS.length > 0 ? Math.round((bookedCount / SLOTS.length) * 100) : 0}% utilization`}
        </p>
      )}

      {loading && (
        <div className={styles.list}>
          {[1, 2].map((i) => (
            <Skeleton key={i} height="3rem" borderRadius="var(--radius-md)" />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <EmptyState heading="No unavailability set" subtext="Add unavailable times to block appointment slots." action={<Button variant="primary" size="small" onClick={() => setShowAdd(true)}>+ Add</Button>} />
      )}

      {!loading && entries.length > 0 && (
        <div className={styles.list}>
          {entries.map((e) => (
            <div key={e.id} className={styles.entry}>
              <div className={styles.entryInfo}>
                <span className={styles.entryDate}>{e.date}</span>
                <span className={styles.entryTime}>{e.start_time} - {e.end_time}</span>
                {e.recurring !== 'none' && <span className={styles.entryRecurring}>{e.recurring}</span>}
                {e.reason && <span className={styles.entryReason}>{e.reason}</span>}
              </div>
              <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(e.id)} title="Delete">&times;</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Unavailability">
        <div className={styles.formBody}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Date</label>
            <input type="date" className={styles.fieldInput} value={addDate} onChange={(e) => setAddDate(e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Start</label>
              <input type="time" className={styles.fieldInput} value={addStart} onChange={(e) => setAddStart(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>End</label>
              <input type="time" className={styles.fieldInput} value={addEnd} onChange={(e) => setAddEnd(e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Recurring</label>
            <select className={styles.select} value={addRecurring} onChange={(e) => setAddRecurring(e.target.value)}>
              <option value="none">None</option>
              <option value="weekly">Weekly</option>
              <option value="weekdays">Weekdays</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Reason (optional)</label>
            <input type="text" className={styles.fieldInput} value={addReason} onChange={(e) => setAddReason(e.target.value)} placeholder="e.g., Conference" />
          </div>
          <div className={styles.fieldActions}>
            <Button variant="ghost" size="small" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="small" loading={submitting} onClick={handleAdd}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
