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

function formatMonthYear(value: string | null): string {
  if (!value) return ''
  return new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function PatientList({ patients, selectedId, onSelect, search, onSearchChange, loading }: PatientListProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
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
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.row}>
                <Skeleton width="2.5rem" height="2.5rem" borderRadius="50%" />
                <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="0.875rem" />
                <div style={{ marginTop: '4px' }}>
                  <Skeleton width="80%" height="0.75rem" />
                </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && patients.length === 0 && (
          <div className={styles.empty}>No patients found</div>
        )}

        {!loading && patients.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.row} ${selectedId === p.id ? styles.selected : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <div className={styles.avatar}>{getInitials(p.name)}</div>
            <div className={styles.info}>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.email}>{p.email}</span>
            </div>
            <div className={styles.meta}>
              {p.last_visit_date && (
                <span className={styles.lastVisit}>{formatMonthYear(p.last_visit_date)}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
