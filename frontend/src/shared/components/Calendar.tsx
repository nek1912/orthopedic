import { useMemo } from 'react'
import styles from './Calendar.module.css'

interface CrowdData {
  [dateKey: string]: {
    count: number
    level: string
    blocked: boolean
  }
}

interface CalendarProps {
  year: number
  month: number
  selectedDate: string | null
  onSelect: (date: string) => void
  crowdData?: CrowdData
  blockedDates?: string[]
  onMonthChange?: (year: number, month: number) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`
}

export default function Calendar({
  year,
  month,
  selectedDate,
  onSelect,
  crowdData = {},
  blockedDates = [],
  onMonthChange,
}: CalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const today = new Date()
  const todayStr = dateKey(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const cells = useMemo(() => {
    const result: { day: number; key: string; isCurrentMonth: boolean }[] = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push({ day: 0, key: `pad-${i}`, isCurrentMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, key: dateKey(year, month, d), isCurrentMonth: true })
    }
    return result
  }, [year, month, daysInMonth, firstDayOfWeek])

  function prevMonth() {
    const newMonth = month === 1 ? 12 : month - 1
    const newYear = month === 1 ? year - 1 : year
    const curMonth = today.getMonth() + 1
    const curYear = today.getFullYear()
    if (newYear < curYear || (newYear === curYear && newMonth < curMonth)) return
    onMonthChange?.(newYear, newMonth)
  }

  function nextMonth() {
    const newMonth = month === 12 ? 1 : month + 1
    const newYear = month === 12 ? year + 1 : year
    onMonthChange?.(newYear, newMonth)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const canGoPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1)

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.nav} onClick={prevMonth} disabled={!canGoPrev} aria-label="Previous month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className={styles.label}>{monthNames[month - 1]} {year}</span>
        <button className={styles.nav} onClick={nextMonth} aria-label="Next month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.grid}>
        {DAYS.map((d) => (
          <div key={d} className={styles.dayHeader}>{d}</div>
        ))}
        {cells.map((cell) => {
          if (!cell.isCurrentMonth) {
            return <div key={cell.key} className={styles.emptyCell} />
          }

          const key = cell.key
          const info = crowdData[key]
          const isPast = key < todayStr
          const isBlocked = isPast || blockedDates.includes(key) || info?.blocked
          const isToday = key === todayStr
          const isSelected = key === selectedDate
          const crowdLevel = info?.level || 'green'

          let cellCls = styles.cell
          if (isPast) cellCls += ` ${styles.past}`
          if (isBlocked && !isPast) cellCls += ` ${styles.blocked}`
          if (isSelected) cellCls += ` ${styles.selected}`
          if (isToday && !isSelected) cellCls += ` ${styles.today}`

          return (
            <button
              key={key}
              className={cellCls}
              disabled={isBlocked}
              onClick={() => !isBlocked && onSelect(key)}
              aria-label={`${monthNames[month - 1]} ${cell.day}, ${year}`}
              aria-selected={isSelected}
              aria-disabled={isBlocked}
            >
              {cell.day}
              {!isBlocked && !isPast && (
                <span className={`${styles.dot} ${styles[crowdLevel]}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
