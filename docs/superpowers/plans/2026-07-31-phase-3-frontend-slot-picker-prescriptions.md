# Phase 3: Enhanced Time Slot Picker & Prescription Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the enhanced time slot picker with end time selector, and the complete prescription flow with file uploads, drafts, and medicine search.

**Architecture:** Extend existing TimeSlotPicker with end time selection, add file upload with drag-and-drop, implement draft recovery via localStorage, and build medicine search API.

**Tech Stack:** React + TypeScript, Vite, CSS Modules, FastAPI, SQLAlchemy

---

## File Structure

### New Files
- `frontend/src/admin/components/EndTimeSelector.tsx` — End time dropdown after start slot selected
- `frontend/src/admin/components/EndTimeSelector.module.css` — End time styles
- `frontend/src/admin/components/FileUploadZone.tsx` — Drag-and-drop file upload
- `frontend/src/admin/components/FileUploadZone.module.css` — Upload zone styles
- `frontend/src/admin/components/MedicineSearch.tsx` — Searchable medicine dropdown
- `frontend/src/admin/components/MedicineSearch.module.css` — Search dropdown styles
- `frontend/src/admin/components/PrescriptionDraftIndicator.tsx` — Draft saved indicator
- `frontend/src/admin/components/PrescriptionDraftIndicator.module.css` — Draft indicator styles
- `backend/app/api/v1/admin_medicines.py` — Medicine search endpoint

### Modified Files
- `frontend/src/admin/components/TimeSlotPicker.tsx` — Add end time selection, range highlighting
- `frontend/src/admin/components/TimeSlotPicker.module.css` — Add range highlight styles
- `frontend/src/admin/components/PrescriptionForm.tsx` — Add file upload, medicine search, draft recovery
- `frontend/src/admin/components/PrescriptionForm.module.css` — Add upload zone, search styles
- `backend/app/api/v1/router.py` — Register medicine search router

---

## Task 1: Backend — Medicine Search API

**Files:**
- Create: `backend/app/api/v1/admin_medicines.py`
- Modify: `backend/app/api/v1/router.py`

**Interfaces:**
- Consumes: none (static medicine database)
- Produces: `GET /admin/medicines?q=` returns matching medicines

- [ ] **Step 1: Create medicine search endpoint**

```python
# backend/app/api/v1/admin_medicines.py
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.core.security import get_current_admin
from app.models.admin import AdminSettings

router = APIRouter(prefix="/admin/medicines", tags=["admin-medicines"])

COMMON_MEDICINES = [
    {"name": "Amoxicillin", "dosage": "500mg", "frequency": "3x/day", "duration": "7 days"},
    {"name": "Ibuprofen", "dosage": "400mg", "frequency": "3x/day", "duration": "5 days"},
    {"name": "Paracetamol", "dosage": "500mg", "frequency": "3x/day", "duration": "5 days"},
    {"name": "Metronidazole", "dosage": "400mg", "frequency": "3x/day", "duration": "7 days"},
    {"name": "Azithromycin", "dosage": "500mg", "frequency": "1x/day", "duration": "5 days"},
    {"name": "Ciprofloxacin", "dosage": "500mg", "frequency": "2x/day", "duration": "7 days"},
    {"name": "Clindamycin", "dosage": "300mg", "frequency": "3x/day", "duration": "7 days"},
    {"name": "Diclofenac", "dosage": "50mg", "frequency": "3x/day", "duration": "5 days"},
    {"name": "Naproxen", "dosage": "500mg", "frequency": "2x/day", "duration": "7 days"},
    {"name": "Pantoprazole", "dosage": "40mg", "frequency": "1x/day", "duration": "14 days"},
    {"name": "Omeprazole", "dosage": "20mg", "frequency": "1x/day", "duration": "14 days"},
    {"name": "Lidocaine", "dosage": "2%", "frequency": "as needed", "duration": "single use"},
    {"name": "Articaine", "dosage": "4%", "frequency": "as needed", "duration": "single use"},
    {"name": "Chlorhexidine", "dosage": "0.2%", "frequency": "2x/day", "duration": "14 days"},
    {"name": "Fluoride Gel", "dosage": "1.1%", "frequency": "1x/day", "duration": "30 days"},
    {"name": "Amoxicillin + Clavulanate", "dosage": "625mg", "frequency": "3x/day", "duration": "7 days"},
    {"name": "Cephalexin", "dosage": "500mg", "frequency": "4x/day", "duration": "7 days"},
    {"name": "Metformin", "dosage": "500mg", "frequency": "2x/day", "duration": "ongoing"},
    {"name": "Aspirin", "dosage": "75mg", "frequency": "1x/day", "duration": "ongoing"},
    {"name": "Amlodipine", "dosage": "5mg", "frequency": "1x/day", "duration": "ongoing"},
]


class MedicineResult(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str


@router.get("", response_model=list[MedicineResult])
async def search_medicines(
    q: str = Query(..., min_length=1),
    admin: AdminSettings = Depends(get_current_admin),
):
    query = q.lower()
    results = [m for m in COMMON_MEDICINES if query in m["name"].lower()]
    return results[:10]
```

- [ ] **Step 2: Register router**

```python
# Add to backend/app/api/v1/router.py
from app.api.v1.admin_medicines import router as admin_medicines_router

router.include_router(admin_medicines_router)
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_medicines.py backend/app/api/v1/router.py
git commit -m "feat: add medicine search API endpoint"
```

---

## Task 2: TimeSlotPicker — Add End Time Selection

**Files:**
- Modify: `frontend/src/admin/components/TimeSlotPicker.tsx:1-66`
- Modify: `frontend/src/admin/components/TimeSlotPicker.module.css:1-95`

**Interfaces:**
- Consumes: `bookedSlots`, `unavailableSlots` from props
- Produces: `onSelect(start, end)` with full range, `selectedStart`, `selectedEnd` state

- [ ] **Step 1: Rewrite TimeSlotPicker with end time**

```tsx
// frontend/src/admin/components/TimeSlotPicker.tsx
import { useState, useMemo } from 'react'
import styles from './TimeSlotPicker.module.css'

interface TimeSlotPickerProps {
  date: string
  bookedSlots: { start: string; end: string; label: string }[]
  unavailableSlots: { start: string; end: string }[]
  onSelect: (start: string, end: string) => void
}

const SLOTS: { start: string; end: string }[] = []
for (let h = 8; h < 18; h++) {
  SLOTS.push({ start: `${h.toString().padStart(2, '0')}:00`, end: `${h.toString().padStart(2, '0')}:30` })
  SLOTS.push({ start: `${h.toString().padStart(2, '0')}:30`, end: `${(h + 1).toString().padStart(2, '0')}:00` })
}

const END_TIME_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
]

function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
}

function isInRange(slotStart: string, rangeStart: string, rangeEnd: string): boolean {
  return slotStart >= rangeStart && slotStart < rangeEnd
}

export default function TimeSlotPicker({ bookedSlots, unavailableSlots, onSelect }: TimeSlotPickerProps) {
  const [selectedStart, setSelectedStart] = useState<string | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null)

  const slotStates = useMemo(() => {
    return SLOTS.map((slot) => {
      const isBooked = bookedSlots.some((b) => overlaps(slot.start, slot.end, b.start, b.end))
      const isUnavailable = unavailableSlots.some((u) => overlaps(slot.start, slot.end, u.start, u.end))
      const isSelected = selectedStart && selectedEnd
        ? isInRange(slot.start, selectedStart, selectedEnd)
        : slot.start === selectedStart
      const inSelectedRange = selectedStart && selectedEnd
        ? isInRange(slot.start, selectedStart, selectedEnd)
        : false

      let state: 'available' | 'booked' | 'unavailable' | 'selected' | 'range' = 'available'
      if (isSelected) state = 'selected'
      else if (inSelectedRange) state = 'range'
      else if (isBooked) state = 'booked'
      else if (isUnavailable) state = 'unavailable'

      return {
        ...slot,
        state,
        label: isBooked
          ? bookedSlots.find((b) => overlaps(slot.start, slot.end, b.start, b.end))?.label || 'Booked'
          : isUnavailable
            ? 'Doctor unavailable'
            : 'Available',
      }
    })
  }, [bookedSlots, unavailableSlots, selectedStart, selectedEnd])

  const endTimeOptions = useMemo(() => {
    if (!selectedStart) return []
    const startMinutes = timeToMinutes(selectedStart)
    return END_TIME_OPTIONS.filter((opt) => {
      const endMinutes = startMinutes + opt.minutes
      if (endMinutes > 18 * 60) return false
      for (let m = startMinutes; m < endMinutes; m += 30) {
        const t = minutesToTime(m)
        const slot = SLOTS.find((s) => s.start === t)
        if (!slot) continue
        const isBooked = bookedSlots.some((b) => overlaps(slot.start, slot.end, b.start, b.end))
        const isUnavailable = unavailableSlots.some((u) => overlaps(slot.start, slot.end, u.start, u.end))
        if (isBooked || isUnavailable) return false
      }
      return true
    }).map((opt) => ({
      ...opt,
      endTime: minutesToTime(startMinutes + opt.minutes),
    }))
  }, [selectedStart, bookedSlots, unavailableSlots])

  function handleSlotClick(slot: typeof SLOTS[0]) {
    const found = slotStates.find((s) => s.start === slot.start)
    if (!found || found.state === 'booked' || found.state === 'unavailable') return

    setSelectedStart(slot.start)
    setSelectedEnd(null)
  }

  function handleEndTimeSelect(endTime: string) {
    setSelectedEnd(endTime)
    if (selectedStart) {
      onSelect(selectedStart, endTime)
    }
  }

  function handleClear() {
    setSelectedStart(null)
    setSelectedEnd(null)
  }

  return (
    <div className={styles.picker}>
      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.availDot}`} /> Available</span>
        <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.bookedDot}`} /> Booked</span>
        <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.unavailDot}`} /> Unavailable</span>
        <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.selectedDot}`} /> Selected</span>
      </div>

      <div className={styles.grid}>
        {slotStates.map((slot) => (
          <button
            key={slot.start}
            className={`${styles.slot} ${styles[slot.state]}`}
            disabled={slot.state === 'booked' || slot.state === 'unavailable'}
            onClick={() => handleSlotClick(slot)}
            type="button"
            title={slot.label}
          >
            {slot.start}
          </button>
        ))}
      </div>

      {selectedStart && !selectedEnd && (
        <div className={styles.endTimePanel}>
          <div className={styles.endTimeHeader}>
            <span>Selected start: <strong>{selectedStart}</strong></span>
            <button type="button" className={styles.clearBtn} onClick={handleClear}>Clear</button>
          </div>
          <div className={styles.endTimeOptions}>
            {endTimeOptions.map((opt) => (
              <button
                key={opt.minutes}
                type="button"
                className={styles.endTimeOption}
                onClick={() => handleEndTimeSelect(opt.endTime)}
              >
                {opt.label} <span className={styles.endTimeValue}>→ {opt.endTime}</span>
              </button>
            ))}
            {endTimeOptions.length === 0 && (
              <span className={styles.noOptions}>No available end times for this start</span>
            )}
          </div>
        </div>
      )}

      {selectedStart && selectedEnd && (
        <div className={styles.selectedRange}>
          <span>Selected: <strong>{selectedStart} – {selectedEnd}</strong></span>
          <button type="button" className={styles.clearBtn} onClick={handleClear}>Change</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update CSS with range and end time styles**

```css
/* frontend/src/admin/components/TimeSlotPicker.module.css */
.picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.legend {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.legendDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.availDot { background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); }
.bookedDot { background-color: var(--color-surface-muted); }
.unavailDot { background-color: rgba(212, 92, 92, 0.2); }
.selectedDot { background-color: var(--color-primary); }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  max-height: 300px;
  overflow-y: auto;
}

.slot {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: 1px solid var(--color-border);
  transition: all var(--duration-fast) var(--ease-out);
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .slot {
    min-height: 44px;
  }
}

.available {
  background-color: var(--color-surface-elevated);
  color: var(--color-text);
  border-color: var(--color-border);
}

.available:hover {
  border-color: var(--color-accent);
  background-color: rgba(74, 158, 142, 0.06);
}

.booked {
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
  border-color: transparent;
}

.unavailable {
  background-color: rgba(212, 92, 92, 0.08);
  color: var(--color-danger);
  cursor: not-allowed;
  border-color: transparent;
}

.selected {
  background-color: var(--color-primary);
  color: #FFFFFF;
  border-color: var(--color-primary);
}

.range {
  background-color: rgba(74, 158, 142, 0.15);
  color: var(--color-text);
  border-color: var(--color-accent);
}

.endTimePanel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.endTimeHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.clearBtn {
  font-size: var(--text-xs);
  color: var(--color-danger);
  font-weight: 500;
  cursor: pointer;
}

.clearBtn:hover {
  text-decoration: underline;
}

.endTimeOptions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.endTimeOption {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  background-color: var(--color-surface);
  color: var(--color-text);
  transition: all var(--duration-fast) var(--ease-out);
}

.endTimeOption:hover {
  border-color: var(--color-accent);
  background-color: rgba(74, 158, 142, 0.06);
}

.endTimeValue {
  color: var(--color-text-secondary);
  font-weight: 400;
}

.noOptions {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.selectedRange {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background-color: rgba(74, 158, 142, 0.08);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-text);
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/admin/components/TimeSlotPicker.tsx frontend/src/admin/components/TimeSlotPicker.module.css
git commit -m "feat: enhance TimeSlotPicker with end time selection and range highlighting"
```

---

## Task 3: FileUploadZone Component

**Files:**
- Create: `frontend/src/admin/components/FileUploadZone.tsx`
- Create: `frontend/src/admin/components/FileUploadZone.module.css`

**Interfaces:**
- Consumes: `onFilesSelected(files: File[])`, `maxFiles`, `acceptedTypes`
- Produces: renders drag-and-drop zone with file list

- [ ] **Step 1: Create FileUploadZone component**

```tsx
// frontend/src/admin/components/FileUploadZone.tsx
import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import styles from './FileUploadZone.module.css'

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  existingFiles?: { name: string; url: string; type: string }[]
  onRemoveExisting?: (index: number) => void
}

const DEFAULT_ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

export default function FileUploadZone({
  onFilesSelected,
  maxFiles = 10,
  acceptedTypes = DEFAULT_ACCEPTED,
  existingFiles = [],
  onRemoveExisting,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateFile(file: File): boolean {
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type ${file.type} not allowed`)
      return false
    }
    if (file.size > MAX_SIZE) {
      setError('File size must be under 10MB')
      return false
    }
    return true
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    setError(null)
    const valid: File[] = []
    for (let i = 0; i < files.length; i++) {
      if (existingFiles.length + valid.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        break
      }
      if (validateFile(files[i])) {
        valid.push(files[i])
      }
    }
    if (valid.length > 0) {
      onFilesSelected(valid)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  function getIcon(type: string): string {
    if (type.startsWith('image/')) return '🖼'
    if (type === 'application/pdf') return '📄'
    return '📎'
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className={styles.hiddenInput}
        />
        <div className={styles.dropContent}>
          <span className={styles.dropIcon}>📎</span>
          <span className={styles.dropText}>
            Drag & drop files here, or <span className={styles.browse}>browse</span>
          </span>
          <span className={styles.dropHint}>Images, PDFs · Max 10MB each · Up to {maxFiles} files</span>
        </div>
      </div>

      {error && <span className={styles.error}>{error}</span>}

      {existingFiles.length > 0 && (
        <div className={styles.fileList}>
          {existingFiles.map((file, i) => (
            <div key={i} className={styles.fileItem}>
              <span className={styles.fileIcon}>{getIcon(file.type)}</span>
              <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.fileName}>
                {file.name}
              </a>
              {onRemoveExisting && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => onRemoveExisting(i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create FileUploadZone CSS**

```css
/* frontend/src/admin/components/FileUploadZone.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  background-color: var(--color-surface);
}

.dropzone:hover,
.dragging {
  border-color: var(--color-accent);
  background-color: rgba(74, 158, 142, 0.04);
}

.hiddenInput {
  display: none;
}

.dropContent {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
}

.dropIcon {
  font-size: 2rem;
  opacity: 0.5;
}

.dropText {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.browse {
  color: var(--color-accent);
  font-weight: 500;
  text-decoration: underline;
}

.dropHint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  font-weight: 500;
}

.fileList {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.fileItem {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.fileIcon {
  font-size: 1rem;
  flex-shrink: 0;
}

.fileName {
  flex: 1;
  font-size: var(--text-xs);
  color: var(--color-accent);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fileName:hover {
  text-decoration: underline;
}

.removeBtn {
  color: var(--color-danger);
  font-size: 1.25rem;
  cursor: pointer;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/admin/components/FileUploadZone.tsx frontend/src/admin/components/FileUploadZone.module.css
git commit -m "feat: add FileUploadZone component with drag-and-drop"
```

---

## Task 4: MedicineSearch Component

**Files:**
- Create: `frontend/src/admin/components/MedicineSearch.tsx`
- Create: `frontend/src/admin/components/MedicineSearch.module.css`

**Interfaces:**
- Consumes: `onSelect(medicine: { name, dosage, frequency, duration })`, `apiRequest`
- Produces: searchable dropdown with debounced API call

- [ ] **Step 1: Create MedicineSearch component**

```tsx
// frontend/src/admin/components/MedicineSearch.tsx
import { useState, useEffect, useRef } from 'react'
import { apiRequest } from '@shared/api/client'
import styles from './MedicineSearch.module.css'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface MedicineSearchProps {
  onSelect: (medicine: Medicine) => void
  placeholder?: string
}

export default function MedicineSearch({ onSelect, placeholder = 'Search medicines...' }: MedicineSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Medicine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await apiRequest<Medicine[]>(`/api/v1/admin/medicines?q=${encodeURIComponent(query)}`)
        setResults(data)
        setIsOpen(data.length > 0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function handleSelect(medicine: Medicine) {
    onSelect(medicine)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
      />
      {loading && <span className={styles.loading}>Searching...</span>}
      {isOpen && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((med) => (
            <button
              key={med.name}
              type="button"
              className={styles.option}
              onClick={() => handleSelect(med)}
            >
              <span className={styles.medName}>{med.name}</span>
              <span className={styles.medDetails}>{med.dosage} · {med.frequency} · {med.duration}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create MedicineSearch CSS**

```css
/* frontend/src/admin/components/MedicineSearch.module.css */
.container {
  position: relative;
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-text);
  background-color: var(--color-surface-elevated);
}

.input:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.loading {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  text-align: left;
  cursor: pointer;
  border: none;
  background: none;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.option:hover {
  background-color: rgba(74, 158, 142, 0.06);
}

.medName {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.medDetails {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/admin/components/MedicineSearch.tsx frontend/src/admin/components/MedicineSearch.module.css
git commit -m "feat: add MedicineSearch component with debounced API search"
```

---

## Task 5: PrescriptionDraftIndicator Component

**Files:**
- Create: `frontend/src/admin/components/PrescriptionDraftIndicator.tsx`
- Create: `frontend/src/admin/components/PrescriptionDraftIndicator.module.css`

**Interfaces:**
- Consumes: `lastSaved: Date | null`, `onRecover`, `onDiscard`
- Produces: shows draft status with recover/discard actions

- [ ] **Step 1: Create PrescriptionDraftIndicator component**

```tsx
// frontend/src/admin/components/PrescriptionDraftIndicator.tsx
import { useState, useEffect } from 'react'
import styles from './PrescriptionDraftIndicator.module.css'

interface PrescriptionDraftIndicatorProps {
  lastSaved: Date | null
  onRecover: () => void
  onDiscard: () => void
}

export default function PrescriptionDraftIndicator({
  lastSaved,
  onRecover,
  onDiscard,
}: PrescriptionDraftIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!lastSaved) return
    function update() {
      const diff = Date.now() - lastSaved.getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) setTimeAgo('just now')
      else if (mins < 60) setTimeAgo(`${mins} min ago`)
      else {
        const hours = Math.floor(mins / 60)
        setTimeAgo(`${hours}h ago`)
      }
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [lastSaved])

  if (!lastSaved) return null

  return (
    <div className={styles.indicator}>
      <span className={styles.dot} />
      <span className={styles.text}>
        Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {timeAgo}
      </span>
      <button type="button" className={styles.recoverBtn} onClick={onRecover}>
        Recover
      </button>
      <button type="button" className={styles.discardBtn} onClick={onDiscard}>
        Discard
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create PrescriptionDraftIndicator CSS**

```css
/* frontend/src/admin/components/PrescriptionDraftIndicator.module.css */
.indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: rgba(74, 158, 142, 0.06);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-accent);
  flex-shrink: 0;
}

.text {
  flex: 1;
  color: var(--color-text-secondary);
}

.recoverBtn {
  color: var(--color-accent);
  font-weight: 500;
  cursor: pointer;
}

.recoverBtn:hover {
  text-decoration: underline;
}

.discardBtn {
  color: var(--color-danger);
  font-weight: 500;
  cursor: pointer;
}

.discardBtn:hover {
  text-decoration: underline;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/admin/components/PrescriptionDraftIndicator.tsx frontend/src/admin/components/PrescriptionDraftIndicator.module.css
git commit -m "feat: add PrescriptionDraftIndicator component"
```

---

## Task 6: Enhanced PrescriptionForm with File Upload, Medicine Search, Drafts

**Files:**
- Modify: `frontend/src/admin/components/PrescriptionForm.tsx:1-96`
- Modify: `frontend/src/admin/components/PrescriptionForm.module.css:1-102`

**Interfaces:**
- Consumes: `FileUploadZone`, `MedicineSearch`, `PrescriptionDraftIndicator`, `apiRequest`
- Produces: full prescription form with file upload, medicine search, draft recovery

- [ ] **Step 1: Rewrite PrescriptionForm**

```tsx
// frontend/src/admin/components/PrescriptionForm.tsx
import { useState, useEffect, useRef, type FormEvent } from 'react'
import Button from '@shared/components/Button'
import FileUploadZone from './FileUploadZone'
import MedicineSearch from './MedicineSearch'
import PrescriptionDraftIndicator from './PrescriptionDraftIndicator'
import styles from './PrescriptionForm.module.css'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

interface PrescriptionFormProps {
  appointmentId: string
  onSubmit: (data: {
    appointment_id: string
    diagnosis: string
    medicines: { medicines: Medicine[] }
    notes: string
    files: File[]
  }) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

const DRAFT_KEY = 'prescription_draft'
const AUTOSAVE_INTERVAL = 30000

export default function PrescriptionForm({ appointmentId, onSubmit, onCancel, submitting }: PrescriptionFormProps) {
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }])
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autosaveRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (parsed.appointmentId === appointmentId) {
          setDiagnosis(parsed.diagnosis || '')
          setMedicines(parsed.medicines || [{ name: '', dosage: '', frequency: '', duration: '' }])
          setNotes(parsed.notes || '')
          setLastSaved(new Date(parsed.savedAt))
        }
      } catch {}
    }
  }, [appointmentId])

  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      saveDraft()
    }, AUTOSAVE_INTERVAL)
    return () => { if (autosaveRef.current) clearInterval(autosaveRef.current) }
  }, [diagnosis, medicines, notes, appointmentId])

  function saveDraft() {
    const draft = {
      appointmentId,
      diagnosis,
      medicines,
      notes,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setLastSaved(new Date())
  }

  function handleRecover() {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setDiagnosis(parsed.diagnosis || '')
        setMedicines(parsed.medicines || [{ name: '', dosage: '', frequency: '', duration: '' }])
        setNotes(parsed.notes || '')
      } catch {}
    }
  }

  function handleDiscard() {
    localStorage.removeItem(DRAFT_KEY)
    setDiagnosis('')
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }])
    setNotes('')
    setFiles([])
    setLastSaved(null)
  }

  function addMedicine() {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  function removeMedicine(i: number) {
    setMedicines(medicines.filter((_, idx) => idx !== i))
  }

  function updateMedicine(i: number, field: keyof Medicine, value: string) {
    const updated = [...medicines]
    updated[i] = { ...updated[i], [field]: value }
    setMedicines(updated)
  }

  function handleMedicineSelect(med: Medicine) {
    const lastEmpty = medicines.findIndex((m) => !m.name)
    if (lastEmpty >= 0) {
      const updated = [...medicines]
      updated[lastEmpty] = med
      setMedicines(updated)
    } else {
      setMedicines([...medicines, med])
    }
  }

  function handleFilesSelected(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10))
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      appointment_id: appointmentId,
      diagnosis,
      medicines: { medicines },
      notes,
      files,
    })
    localStorage.removeItem(DRAFT_KEY)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <PrescriptionDraftIndicator
        lastSaved={lastSaved}
        onRecover={handleRecover}
        onDiscard={handleDiscard}
      />

      <div className={styles.field}>
        <label className={styles.label}>Diagnosis</label>
        <textarea
          className={styles.textarea}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={3}
          placeholder="Enter diagnosis..."
        />
      </div>

      <div className={styles.field}>
        <div className={styles.medHeader}>
          <label className={styles.label}>Medicines</label>
          <button type="button" className={styles.addBtn} onClick={addMedicine}>+ Add</button>
        </div>

        <MedicineSearch onSelect={handleMedicineSelect} placeholder="Search to add medicine..." />

        {medicines.map((med, i) => (
          <div key={i} className={styles.medRow}>
            <input className={styles.medInput} placeholder="Name" value={med.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} />
            <input className={styles.medInput} placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} />
            <select className={styles.medSelect} value={med.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}>
              <option value="">Frequency</option>
              <option value="1x/day">1x/day</option>
              <option value="2x/day">2x/day</option>
              <option value="3x/day">3x/day</option>
              <option value="4x/day">4x/day</option>
              <option value="as needed">as needed</option>
            </select>
            <input className={styles.medInput} placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} />
            {medicines.length > 1 && (
              <button type="button" className={styles.removeBtn} onClick={() => removeMedicine(i)}>&times;</button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Additional Notes</label>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional notes..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Clinical Documents</label>
        <FileUploadZone
          onFilesSelected={handleFilesSelected}
          maxFiles={10}
          existingFiles={files.map((f) => ({ name: f.name, url: URL.createObjectURL(f), type: f.type }))}
          onRemoveExisting={handleRemoveFile}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="small" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="small" type="submit" loading={submitting}>Save Prescription</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Update PrescriptionForm CSS**

```css
/* frontend/src/admin/components/PrescriptionForm.module.css */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background-color: var(--color-surface-elevated);
  resize: vertical;
  font-family: var(--font-body);
}

.textarea:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.medHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.addBtn {
  font-size: var(--text-xs);
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
}

.addBtn:hover {
  color: var(--color-accent-hover);
}

.medRow {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .medRow {
    flex-wrap: nowrap;
  }
}

.medInput {
  flex: 1;
  height: 40px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text);
  background-color: var(--color-surface-elevated);
  min-width: 0;
}

.medInput:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.medSelect {
  flex: 1;
  height: 40px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text);
  background-color: var(--color-surface-elevated);
  min-width: 0;
}

.medSelect:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.removeBtn {
  color: var(--color-danger);
  font-size: 1.25rem;
  cursor: pointer;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/admin/components/PrescriptionForm.tsx frontend/src/admin/components/PrescriptionForm.module.css
git commit -m "feat: enhance PrescriptionForm with file upload, medicine search, draft recovery"
```

---

## Task 7: Backend — Prescription File Upload Endpoint

**Files:**
- Modify: `backend/app/api/v1/admin_prescriptions.py:1-71`

**Interfaces:**
- Consumes: `StorageService`, `AppointmentDocument` model
- Produces: `POST /admin/prescriptions/{id}/documents` for attaching files to prescriptions

- [ ] **Step 1: Add prescription document upload**

```python
# Add to backend/app/api/v1/admin_prescriptions.py
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.prescription import Prescription
from app.models.document import AppointmentDocument
from app.services.storage import StorageService
from app.schemas.document import DocumentUploadResponse

# Add after existing endpoints:
@router.post("/{prescription_id}/documents", response_model=DocumentUploadResponse, status_code=201)
async def upload_prescription_document(
    prescription_id: str,
    file: UploadFile = File(...),
    document_type: str = "prescription_pdf",
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Prescription).where(Prescription.id == uuid.UUID(prescription_id))
    )
    presc = result.scalar_one_or_none()
    if presc is None:
        raise HTTPException(status_code=404, detail="Prescription not found")

    content = await file.read()
    StorageService.validate_upload(file.filename, len(content), file.content_type)

    storage_key = StorageService.save(content, file.filename, f"prescriptions/{prescription_id}")
    file_url = StorageService.get_url(storage_key)

    doc = AppointmentDocument(
        id=uuid.uuid4(),
        appointment_id=presc.appointment_id,
        document_type=document_type,
        filename=file.filename,
        mime_type=file.content_type,
        storage_key=storage_key,
        file_url=file_url,
        file_type=document_type,
        uploaded_by="admin",
        uploaded_at=datetime.utcnow(),
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return DocumentUploadResponse(
        id=str(doc.id),
        filename=doc.filename,
        file_url=doc.file_url,
        document_type=doc.document_type,
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/api/v1/admin_prescriptions.py
git commit -m "feat: add prescription document upload endpoint"
```

---

## Task 8: Verify Everything Works

**Files:**
- No new files — verification only

**Interfaces:**
- Consumes: all Tasks 1-7 outputs
- Produces: all components and endpoints working

- [ ] **Step 1: Start backend server**

Run: `cd backend && python -m uvicorn app.main:app --reload`
Expected: Server starts without errors

- [ ] **Step 2: Test medicine search**

```bash
curl "http://localhost:8000/api/v1/admin/medicines?q=amox" -H "Authorization: Bearer <token>"
```
Expected: Returns list of matching medicines

- [ ] **Step 3: Start frontend dev server**

Run: `cd frontend && npm run dev`
Expected: Frontend starts without errors

- [ ] **Step 4: Test TimeSlotPicker in browser**

Navigate to admin requests page, click a pending appointment, verify:
- Slot grid renders with booked/unavailable states
- Clicking an available slot shows end time selector
- Selecting end time highlights range
- onSelect fires with correct start/end times

- [ ] **Step 5: Test PrescriptionForm in browser**

Navigate to a started appointment, open prescription form, verify:
- Draft indicator appears after 30 seconds
- Medicine search returns results
- File upload accepts images and PDFs
- Draft saves to localStorage and recovers on reload

- [ ] **Step 6: Commit verification**

```bash
git add -A
git commit -m "chore: verify Phase 3 frontend and backend components"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Time Slot Picker: grid with 30-min slots, end time selector (30m/45m/1h/1.5h/2h), range highlighting, booked/unavailable handling with tooltips
- ✅ Backend Integration: `GET /admin/medicines?q=` endpoint, existing slots endpoint from Phase 2
- ✅ Prescription Flow: diagnosis, medicines list, frequency dropdown, duration, notes
- ✅ File Upload: drag-and-drop, multiple files, 10MB limit, type validation, preview
- ✅ Draft Recovery: localStorage primary, auto-save every 30s, recover/discard actions

**2. Placeholder scan:** No TBD/TODO found. All steps have complete code.

**3. Type consistency:**
- `TimeSlotPicker.onSelect(start, end)` matches `AcceptRequest` schema
- `MedicineSearch.onSelect(medicine)` matches `Medicine` interface in PrescriptionForm
- `FileUploadZone.onFilesSelected(files)` returns `File[]`, used in form submission
- `PrescriptionForm.onSubmit` includes `files: File[]` for upload
- `PrescriptionDraftIndicator.lastSaved` is `Date | null`, matches localStorage ISO string parse

**No issues found.**
