import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import type { ActivityLogResponse } from '@shared/types'
import styles from './ActivityLog.module.css'

function humanizeAction(action: string): string {
  const parts = action.split('.')
  const last = parts[parts.length - 1].replace(/_/g, ' ')
  const humanized = last.charAt(0).toUpperCase() + last.slice(1)
  if (parts.length === 1) return humanized
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  return `${humanized} ${first}`
}

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityLogResponse[]>([])
  const [failed, setFailed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchActivity = useCallback(async () => {
    try {
      const data = await apiRequest<ActivityLogResponse[]>('/api/v1/admin/activity?limit=50')
      setEntries(data)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => { fetchActivity() }, [fetchActivity])

  if (failed) {
    return <p className={styles.muted}>Could not load activity</p>
  }

  if (entries.length === 0) {
    return <p className={styles.muted}>No activity yet</p>
  }

  const visibleEntries = expanded ? entries : entries.slice(0, 3)

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {visibleEntries.map((entry) => (
          <div key={entry.id} className={styles.row}>
            <span className={styles.time}>
              {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={styles.action}>{humanizeAction(entry.action)}</span>
            {entry.detail && <span className={styles.detail}>{entry.detail}</span>}
          </div>
        ))}
      </div>
      {entries.length > 3 && (
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse Activity' : `View All Activity (${entries.length})`}
        </button>
      )}
    </div>
  )
}
