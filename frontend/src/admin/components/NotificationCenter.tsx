import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { apiRequest } from '@shared/api/client'
import type { NotificationResponse } from '@shared/types'
import styles from './NotificationCenter.module.css'

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties | undefined>(undefined)
  const bellRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiRequest<NotificationResponse[]>('/api/v1/admin/notifications')
      setNotifications(data)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function toggleOpen() {
    const next = !open
    if (next && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect()
      setPanelStyle({
        bottom: window.innerHeight - rect.top + 8,
        left: Math.max(8, rect.right - 320),
        maxHeight: window.innerHeight - 16,
      })
    }
    setOpen(next)
  }

  async function markRead(id: string) {
    const target = notifications.find((n) => n.id === id)
    if (!target || target.is_read) return
    try {
      await apiRequest(`/api/v1/admin/notifications/${id}`, { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {
      return
    }
  }

  async function markAllRead() {
    if (unreadCount === 0) return
    try {
      await apiRequest('/api/v1/admin/notifications/read-all', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      return
    }
  }

  return (
    <div className={styles.wrapper}>
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}
      <button ref={bellRef} type="button" className={styles.bellRow} onClick={toggleOpen}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span className={styles.label}>Notifications</span>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <div className={styles.panel} style={panelStyle}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAll} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className={styles.list}>
            {failed && (
              <p className={styles.empty}>Could not load notifications</p>
            )}
            {!failed && notifications.length === 0 && (
              <p className={styles.empty}>No notifications</p>
            )}
            {!failed && notifications.map((n) => (
              <button key={n.id} type="button" className={styles.item} onClick={() => markRead(n.id)}>
                <span className={`${styles.dot} ${n.is_read ? styles.dotRead : ''}`} />
                <span className={styles.itemBody}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemMsg}>{n.message}</span>
                  <span className={styles.itemTime}>{timeAgo(n.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
