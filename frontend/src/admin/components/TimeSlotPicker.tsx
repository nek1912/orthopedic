import { useState, useMemo } from 'react'
import styles from './TimeSlotPicker.module.css'

interface TimeSlotPickerProps {
  date: string
  bookedSlots: { start: string; end: string; label: string }[]
  unavailableSlots: { start: string; end: string }[]
  onSelect: (start: string, end: string) => void
}

export const SLOTS: { start: string; end: string }[] = []
for (let h = 9; h < 19; h++) {
  SLOTS.push({ start: `${h.toString().padStart(2, '0')}:00`, end: `${h.toString().padStart(2, '0')}:30` })
  SLOTS.push({ start: `${h.toString().padStart(2, '0')}:30`, end: `${(h + 1).toString().padStart(2, '0')}:00` })
}

function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToTime(m: number): string {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}

export default function TimeSlotPicker({ bookedSlots, unavailableSlots, onSelect }: TimeSlotPickerProps) {
  const [selectedStart, setSelectedStart] = useState<string | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null)

  const slotStates = useMemo(() => {
    return SLOTS.map((slot) => {
      const isBooked = bookedSlots.some((b) => overlaps(slot.start, slot.end, b.start, b.end))
      const isUnavailable = unavailableSlots.some((u) => overlaps(slot.start, slot.end, u.start, u.end))
      const isSelected = slot.start === selectedStart
      const isInRange = selectedStart && selectedEnd && slot.start >= selectedStart && slot.start < selectedEnd
      let state: 'selected' | 'booked' | 'unavailable' | 'available' | 'in-range' = 'available'
      if (isSelected) state = 'selected'
      else if (isBooked) state = 'booked'
      else if (isUnavailable) state = 'unavailable'
      else if (isInRange) state = 'in-range'
      return { ...slot, state, label: isBooked ? (bookedSlots.find((b) => overlaps(slot.start, slot.end, b.start, b.end))?.label || 'Booked') : 'Available' }
    })
  }, [bookedSlots, unavailableSlots, selectedStart, selectedEnd])

  const endOptions = useMemo(() => {
    if (!selectedStart) return []
    const startMin = timeToMin(selectedStart)
    const options: { time: string; disabled: boolean }[] = []
    for (let m = startMin + 30; m <= 19 * 60; m += 30) {
      const end = minToTime(m)
      const hasOverlap = bookedSlots.some((b) => overlaps(selectedStart, end, b.start, b.end)) ||
        unavailableSlots.some((u) => overlaps(selectedStart, end, u.start, u.end))
      options.push({ time: end, disabled: hasOverlap })
    }
    return options
  }, [selectedStart, bookedSlots, unavailableSlots])

  function handleStartClick(slot: typeof SLOTS[0]) {
    const s = slotStates.find((s) => s.start === slot.start)
    if (!s || s.state === 'booked' || s.state === 'unavailable') return
    setSelectedStart(slot.start)
    setSelectedEnd(null)
  }

  function handleEndSelect(endTime: string) {
    if (!selectedStart) return
    setSelectedEnd(endTime)
    onSelect(selectedStart, endTime)
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
      </div>

      <div className={styles.grid}>
        {slotStates.map((slot) => (
          <button
            key={slot.start}
            className={`${styles.slot} ${styles[slot.state]}`}
            disabled={slot.state === 'booked' || slot.state === 'unavailable'}
            onClick={() => handleStartClick(slot)}
            type="button"
          >
            {slot.start}
          </button>
        ))}
      </div>

      {selectedStart && (
        <div className={styles.endPicker}>
          <div className={styles.endHeader}>
            <span className={styles.endLabel}>
              Start: <strong>{selectedStart}</strong>
            </span>
            {selectedEnd && (
              <span className={styles.endLabel}>
                End: <strong>{selectedEnd}</strong>
              </span>
            )}
            <button type="button" className={styles.clearBtn} onClick={handleClear}>Clear</button>
          </div>
          <div className={styles.endDropdown}>
            <label className={styles.endSelectLabel}>Select end time:</label>
            <div className={styles.endOptions}>
              {endOptions.map((opt) => (
                <button
                  key={opt.time}
                  type="button"
                  className={`${styles.endOption} ${selectedEnd === opt.time ? styles.endOptionSelected : ''} ${opt.disabled ? styles.endOptionDisabled : ''}`}
                  disabled={opt.disabled}
                  onClick={() => handleEndSelect(opt.time)}
                >
                  {opt.time}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
