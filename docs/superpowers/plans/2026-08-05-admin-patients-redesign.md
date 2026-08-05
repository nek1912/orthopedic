# Admin Patients Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Admin Patients page from a single-column expandable list to a split-panel layout with a patient list on the left and a detail view on the right.

**Architecture:** Two-panel split layout — left panel (30%) holds a searchable patient list, right panel (70%) shows selected patient details with stats and appointment timeline. New components: `PatientList`, `PatientDetail`, `AdminPrescriptionView`. Old `PatientRow` and its CSS are removed.

**Tech Stack:** React, TypeScript, CSS Modules, existing design tokens from `tokens.css`

## Global Constraints

- Use CSS custom properties from `tokens.css` — no hardcoded colors/sizes
- No comments in code unless asked
- Mobile-first: panels stack vertically on screens ≤768px
- Read-only view — no edit buttons
- Import types from `@shared/types`
- Use `StatusBadge` from `@shared/components/Badge`
- Use `StatCard` from `@admin/components/StatCard`
- Use `apiRequest` from `@shared/api/client` for API calls
- Use `useToast` from `@shared/context/ToastContext` for notifications
- Use `Skeleton` from `@shared/components/Skeleton` for loading states
- Use `EmptyState` from `@shared/components/EmptyState` for empty states

---

## Task 1: Create AdminPrescriptionView Component

**Files:**
- Create: `frontend/src/admin/components/AdminPrescriptionView.tsx`
- Create: `frontend/src/admin/components/AdminPrescriptionView.module.css`

**Interfaces:**
- Consumes: `PrescriptionResponse[]` from `@shared/types`
- Produces: `<AdminPrescriptionView prescriptions={...} />`

- [ ] **Step 1: Create the component file**

```tsx
// frontend/src/admin/components/AdminPrescriptionView.tsx
import type { PrescriptionResponse } from '@shared/types'
import styles from './AdminPrescriptionView.module.css'

interface Medicine {
  name: string
  dosage?: string
  frequency?: string
  duration?: string
}

function parseMedicines(prescription: PrescriptionResponse): Medicine[] {
  if (!prescription.medicines) return []
  const raw = prescription.medicines

  if (Array.isArray(raw)) {
    return raw.filter((m): m is Medicine => m && typeof m === 'object' && 'name' in m)
  }

  if (typeof raw === 'object' && raw !== null && 'medicines' in raw) {
    const inner = (raw as Record<string, unknown>).medicines
    if (Array.isArray(inner)) {
      return inner.filter((m): m is Medicine => m && typeof m === 'object' && 'name' in m)
    }
  }

  return []
}

interface AdminPrescriptionViewProps {
  prescriptions: PrescriptionResponse[]
}

export default function AdminPrescriptionView({ prescriptions }: AdminPrescriptionViewProps) {
  if (!prescriptions || prescriptions.length === 0) return null

  return (
    <div className={styles.container}>
      {prescriptions.map((rx) => {
        const medicines = parseMedicines(rx)
        return (
          <div key={rx.id} className={styles.card}>
            {rx.diagnosis && (
              <div className={styles.section}>
                <span className={styles.label}>Diagnosis</span>
                <p className={styles.text}>{rx.diagnosis}</p>
              </div>
            )}

            {medicines.length > 0 && (
              <div className={styles.section}>
                <span className={styles.label}>Medicines</span>
                <div className={styles.medicinesList}>
                  {medicines.map((med, i) => (
                    <div key={i} className={styles.medicineCard}>
                      <span className={styles.medicineName}>{med.name}</span>
                      <div className={styles.medicineDetails}>
                        {med.dosage && <span>{med.dosage}</span>}
                        {med.frequency && <span>{med.frequency}</span>}
                        {med.duration && <span>{med.duration}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rx.notes && (
              <div className={styles.section}>
                <span className={styles.label}>Notes</span>
                <p className={styles.text}>{rx.notes}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create the CSS module**

```css
/* frontend/src/admin/components/AdminPrescriptionView.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.section + .section {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}

.label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.text {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: var(--leading-normal);
}

.medicinesList {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.medicineCard {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}

.medicineName {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.medicineDetails {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: Verify build**

Run: `cd D:\client_project\frontend && npm run build 2>&1 | Select-String -Pattern "error|Error|fail" -CaseSensitive:$false`
Expected: No errors related to the new files

---

## Task 2: Create PatientList Component

**Files:**
- Create: `frontend/src/admin/components/PatientList.tsx`
- Create: `frontend/src/admin/components/PatientList.module.css`

**Interfaces:**
- Consumes: `AdminPatientResponse[]`, `selectedId`, `search`, loading states
- Produces: `<PatientList patients={...} selectedId={...} onSelect={...} search={...} onSearchChange={...} loading={...} />`

- [ ] **Step 1: Create the component file**

```tsx
// frontend/src/admin/components/PatientList.tsx
import type { AdminPatientResponse } from '@shared/types'
import Skeleton from '@shared/components/Skeleton'
import styles from './PatientList.module.css'

interface PatientListProps {
  patients: AdminPatientResponse[]
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
  onSearchChange: (val: string) => void
  loading: boolean
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No visits'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PatientList({
  patients,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  loading,
}: PatientListProps) {
  const sorted = [...patients].sort((a, b) => {
    if (a.last_visit_date && b.last_visit_date) {
      return b.last_visit_date.localeCompare(a.last_visit_date)
    }
    if (a.last_visit_date) return -1
    if (b.last_visit_date) return 1
    return b.created_at.localeCompare(a.created_at)
  })

  return (
    <div className={styles.panel}>
      <div className={styles.searchWrapper}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {loading && (
          <div className={styles.loadingList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="64px" borderRadius="var(--radius-md)" />
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className={styles.empty}>
            <p>{search ? 'No patients match your search' : 'No patients yet'}</p>
          </div>
        )}

        {!loading && sorted.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.row} ${selectedId === p.id ? styles.selected : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <div className={styles.avatar}>
              {getInitials(p.name)}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.meta}>
                {p.total_visits} visit{p.total_visits !== 1 ? 's' : ''} · Last: {formatDate(p.last_visit_date)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the CSS module**

```css
/* frontend/src/admin/components/PatientList.module.css */
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-surface-elevated);
}

.searchWrapper {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.search {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background-color: var(--color-surface);
}

.search:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.search::placeholder {
  color: var(--color-text-muted);
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.loadingList {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2);
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.row:hover {
  background-color: var(--color-surface-muted);
}

.selected {
  background-color: var(--color-surface-muted);
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-accent);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 3: Verify build**

Run: `cd D:\client_project\frontend && npm run build 2>&1 | Select-String -Pattern "error|Error|fail" -CaseSensitive:$false`
Expected: No errors related to the new files

---

## Task 3: Create PatientDetail Component

**Files:**
- Create: `frontend/src/admin/components/PatientDetail.tsx`
- Create: `frontend/src/admin/components/PatientDetail.module.css`

**Interfaces:**
- Consumes: `PatientResponse`, `AppointmentResponse[]`, loading state
- Produces: `<PatientDetail patient={...} appointments={...} loading={...} />`

- [ ] **Step 1: Create the component file**

```tsx
// frontend/src/admin/components/PatientDetail.tsx
import type { PatientResponse, AppointmentResponse } from '@shared/types'
import { StatusBadge } from '@shared/components/Badge'
import StatCard from '@admin/components/StatCard'
import AdminPrescriptionView from '@admin/components/AdminPrescriptionView'
import Skeleton from '@shared/components/Skeleton'
import EmptyState from '@shared/components/EmptyState'
import styles from './PatientDetail.module.css'

interface PatientDetailProps {
  patient: PatientResponse | null
  appointments: AppointmentResponse[]
  stats: {
    total_visits: number
    pending_count: number
    completed_count: number
    prescription_count: number
  } | null
  loading: boolean
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(start: string | null, end: string | null): string {
  if (!start) return ''
  const fmt = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }
  if (!end) return fmt(start)
  return `${fmt(start)} – ${fmt(end)}`
}

export default function PatientDetail({ patient, appointments, stats, loading }: PatientDetailProps) {
  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loadingContent}>
          <Skeleton height="24px" width="200px" borderRadius="var(--radius-sm)" />
          <Skeleton height="16px" width="300px" borderRadius="var(--radius-sm)" />
          <div className={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="90px" borderRadius="var(--radius-lg)" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <EmptyState heading="Select a patient" subtext="Choose a patient from the list to view their details" />
        </div>
      </div>
    )
  }

  const sorted = [...appointments].sort(
    (a, b) => b.requested_date.localeCompare(a.requested_date)
  )

  return (
    <div className={styles.panel}>
      <div className={styles.scrollContent}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {(() => {
              const parts = patient.name.trim().split(/\s+/).filter(Boolean)
              if (parts.length === 0) return '?'
              if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
              return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
            })()}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.name}>{patient.name}</h2>
            <div className={styles.contactRow}>
              <span className={styles.contactItem}>{patient.email}</span>
              {patient.phone && <span className={styles.contactItem}>{patient.phone}</span>}
              {patient.dob && <span className={styles.contactItem}>DOB: {patient.dob}</span>}
            </div>
          </div>
        </div>

        {stats && (
          <div className={styles.statsGrid}>
            <StatCard label="Visits" value={stats.total_visits} variant="accent" />
            <StatCard label="Pending" value={stats.pending_count} variant="warning" />
            <StatCard label="Completed" value={stats.completed_count} variant="success" />
            <StatCard label="Prescriptions" value={stats.prescription_count} />
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Appointment History</h3>

          {sorted.length === 0 && (
            <p className={styles.noAppointments}>No appointments recorded</p>
          )}

          <div className={styles.timeline}>
            {sorted.map((appt) => (
              <div key={appt.id} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <span className={styles.cardDate}>{formatFullDate(appt.requested_date)}</span>
                      {appt.time_slot_start && (
                        <span className={styles.cardTime}>{formatTime(appt.time_slot_start, appt.time_slot_end)}</span>
                      )}
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <p className={styles.cardService}>
                    {appt.service_name || appt.service_description || 'General Consultation'}
                  </p>

                  {appt.notes && (
                    <div className={styles.cardSection}>
                      <span className={styles.cardLabel}>Notes</span>
                      <p className={styles.cardText}>{appt.notes}</p>
                    </div>
                  )}

                  {appt.rejection_reason && (
                    <div className={styles.cardSection}>
                      <span className={styles.cardLabel}>Rejection Reason</span>
                      <p className={styles.rejectionText}>{appt.rejection_reason}</p>
                    </div>
                  )}

                  {appt.prescriptions && appt.prescriptions.length > 0 && (
                    <div className={styles.cardSection}>
                      <span className={styles.cardLabel}>Prescriptions</span>
                      <AdminPrescriptionView prescriptions={appt.prescriptions} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the CSS module**

```css
/* frontend/src/admin/components/PatientDetail.module.css */
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-surface);
}

.scrollContent {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.loadingContent {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.emptyState {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-accent);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.headerInfo {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.name {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.contactRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.contactItem {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.contactItem + .contactItem::before {
  content: '·';
  margin-right: var(--space-3);
  color: var(--color-text-muted);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sectionTitle {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.noAppointments {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  padding: var(--space-4);
  text-align: center;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.timelineItem {
  display: flex;
  gap: var(--space-4);
  position: relative;
  padding-bottom: var(--space-4);
}

.timelineItem:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: 0;
  width: 2px;
  background-color: var(--color-border);
}

.timelineDot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  z-index: 1;
}

.timelineCard {
  flex: 1;
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.cardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.cardDate {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.cardTime {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.cardService {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.cardSection {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}

.cardLabel {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.cardText {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: var(--leading-normal);
}

.rejectionText {
  font-size: var(--text-sm);
  color: var(--color-danger);
  line-height: var(--leading-normal);
}

@media (max-width: 768px) {
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }

  .scrollContent {
    padding: var(--space-4);
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .contactRow {
    flex-direction: column;
    gap: var(--space-1);
  }

  .contactItem + .contactItem::before {
    display: none;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd D:\client_project\frontend && npm run build 2>&1 | Select-String -Pattern "error|Error|fail" -CaseSensitive:$false`
Expected: No errors related to the new files

---

## Task 4: Rewrite AdminPatientsPage and Update CSS

**Files:**
- Rewrite: `frontend/src/admin/pages/AdminPatientsPage.tsx`
- Rewrite: `frontend/src/admin/pages/AdminPatientsPage.module.css`

**Interfaces:**
- Consumes: `PatientList`, `PatientDetail` from `@admin/components`
- Produces: The main page component

- [ ] **Step 1: Rewrite the page component**

```tsx
// frontend/src/admin/pages/AdminPatientsPage.tsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { apiRequest } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { AdminPatientResponse, PatientResponse, AppointmentResponse } from '@shared/types'
import PatientList from '@admin/components/PatientList'
import PatientDetail from '@admin/components/PatientDetail'
import styles from './AdminPatientsPage.module.css'

interface PatientDetailData {
  patient: PatientResponse
  appointments: AppointmentResponse[]
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<AdminPatientResponse[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<PatientDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { toast } = useToast()

  const fetchPatients = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const path = q
        ? `/api/v1/admin/patients?search=${encodeURIComponent(q)}`
        : '/api/v1/admin/patients'
      const data = await apiRequest<AdminPatientResponse[]>(path)
      setPatients(data)
    } catch {
      toast('Failed to load patients', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)

  function handleSearch(val: string) {
    setSearch(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchPatients(val || undefined), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  async function handleSelect(patientId: string) {
    if (selectedId === patientId) return
    setSelectedId(patientId)
    setDetailLoading(true)
    try {
      const data = await apiRequest<PatientDetailData>(`/api/v1/admin/patients/${patientId}`)
      setDetail(data)
    } catch {
      toast('Failed to load patient details', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const selectedPatient = patients.find((p) => p.id === selectedId) || null
  const stats = selectedPatient
    ? {
        total_visits: selectedPatient.total_visits,
        pending_count: selectedPatient.pending_count,
        completed_count: selectedPatient.completed_count,
        prescription_count: selectedPatient.prescription_count,
      }
    : null

  return (
    <div className={styles.page}>
      <PatientList
        patients={patients}
        selectedId={selectedId}
        onSelect={handleSelect}
        search={search}
        onSearchChange={handleSearch}
        loading={loading}
      />
      <PatientDetail
        patient={detail?.patient || null}
        appointments={detail?.appointments || []}
        stats={stats}
        loading={detailLoading}
      />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite the CSS module**

```css
/* frontend/src/admin/pages/AdminPatientsPage.module.css */
.page {
  display: flex;
  height: calc(100vh - 2 * var(--space-8));
  margin: calc(-1 * var(--space-8));
  overflow: hidden;
}

@media (max-width: 768px) {
  .page {
    flex-direction: column;
    height: auto;
    margin: calc(-1 * var(--space-4));
    overflow: visible;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd D:\client_project\frontend && npm run build 2>&1 | Select-String -Pattern "error|Error|fail" -CaseSensitive:$false`
Expected: No errors

---

## Task 5: Remove Old PatientRow Component

**Files:**
- Delete: `frontend/src/admin/components/PatientRow.tsx`
- Delete: `frontend/src/admin/components/PatientRow.module.css`

**Interfaces:**
- Consumes: nothing (removing dead code)
- Produces: clean codebase with no unused files

- [ ] **Step 1: Verify PatientRow is no longer imported**

Run: `cd D:\client_project\frontend && grep -r "PatientRow" src/ --include="*.tsx" --include="*.ts"`
Expected: No results (all imports removed in Task 4)

- [ ] **Step 2: Delete the files**

Run: `Remove-Item "D:\client_project\frontend\src\admin\components\PatientRow.tsx" -Force; Remove-Item "D:\client_project\frontend\src\admin\components\PatientRow.module.css" -Force`

- [ ] **Step 3: Verify build after deletion**

Run: `cd D:\client_project\frontend && npm run build 2>&1 | Select-String -Pattern "error|Error|fail" -CaseSensitive:$false`
Expected: No errors

---

## Task 6: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full production build**

Run: `cd D:\client_project\frontend && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run lint**

Run: `cd D:\client_project\frontend && npm run lint`
Expected: No lint errors

- [ ] **Step 3: Verify no stale references**

Run: `cd D:\client_project\frontend && grep -r "PatientRow\|EditAppointmentModal\|onEditAppointment" src/admin/ --include="*.tsx" --include="*.ts"`
Expected: No results (old edit modal and PatientRow references removed)
