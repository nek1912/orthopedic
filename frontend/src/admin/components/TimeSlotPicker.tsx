import { useState, useMemo } from 'react'
import styles from './TimeSlotPicker.module.css'

interface TimeSlotPickerProps {
  date: string
  bookedSlots: { start: string; end: string; label: string }[]
  unavailableSlots: { start: string; end: string }[]
  onSelect: (start: string, end: string) => void
}

export const SLOTS: { start: string; end: string }[] = []
for (let h = 8; h < 18; h++) {
  SLOTS.push({ start: `${h.toString().padStart(2, '0')}:00`, end: `${h.toString().padStart(2, '0')}:30` })
  SLOTS.push({ start: `${h.toString().padStart(2, '0')}:30`, end: `${(h + 1).toString().padStart(2, '0')}:00` })
}

function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1
}

export default function TimeSlotPicker({ bookedSlots, unavailableSlots, onSelect }: TimeSlotPickerProps) {
  const [selectedStart, setSelectedStart] = useState<string | null>(null)

  const slotStates = useMemo(() => {
    return SLOTS.map((slot) => {
      const isBooked = bookedSlots.some((b) => overlaps(slot.start, slot.end, b.start, b.end))
      const isUnavailable = unavailableSlots.some((u) => overlaps(slot.start, slot.end, u.start, u.end))
      const isSelected = slot.start === selectedStart
      return { ...slot, state: isSelected ? 'selected' as const : isBooked ? 'booked' as const : isUnavailable ? 'unavailable' as const : 'available' as const, label: isBooked ? (bookedSlots.find((b) => overlaps(slot.start, slot.end, b.start, b.end))?.label || 'Booked') : 'Available' }
    })
  }, [bookedSlots, unavailableSlots, selectedStart])

  function handleClick(slot: typeof SLOTS[0]) {
    const s = slotStates.find((s) => s.start === slot.start)
    if (!s || s.state !== 'available') return

    setSelectedStart(slot.start)
    onSelect(slot.start, slot.end)
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
            disabled={slot.state !== 'available'}
            onClick={() => {
              const found = SLOTS.find((s) => s.start === slot.start)
              if (found) handleClick(found)
            }}
            type="button"
          >
            {slot.start}
          </button>
        ))}
      </div>
    </div>
  )
}
