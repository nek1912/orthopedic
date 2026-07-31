import { useCallback, useEffect, useRef, useState, type CSSProperties, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@shared/api/client'
import type { SearchResponse } from '@shared/types'
import styles from './GlobalSearch.module.css'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [panelStyle, setPanelStyle] = useState<CSSProperties | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const activeQuery = useRef('')
  const navigate = useNavigate()

  const runSearch = useCallback(async (q: string) => {
    activeQuery.current = q
    setStatus('loading')
    try {
      const data = await apiRequest<SearchResponse>(`/api/v1/admin/search?q=${encodeURIComponent(q)}`)
      if (activeQuery.current === q) {
        setResults(data)
        setStatus('done')
      }
    } catch {
      if (activeQuery.current === q) {
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function handleChange(val: string) {
    setQuery(val)
    const q = val.trim()
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (q.length < 2) {
      setOpen(false)
      setStatus('idle')
      setResults(null)
      return
    }
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPanelStyle({
        top: rect.bottom + 8,
        left: rect.left,
        maxHeight: Math.max(120, window.innerHeight - rect.bottom - 16),
      })
    }
    setOpen(true)
    setStatus('loading')
    debounceTimer.current = setTimeout(() => runSearch(q), 300)
  }

  function goTo(path: string) {
    navigate(path)
    setQuery('')
    setOpen(false)
    setStatus('idle')
    setResults(null)
    inputRef.current?.blur()
  }

  function renderSection(title: string, rows: JSX.Element[]): JSX.Element | null {
    if (rows.length === 0) return null
    return (
      <div className={styles.section}>
        <div className={styles.sectionLabel}>{title}</div>
        {rows}
      </div>
    )
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div className={`${styles.wrapper} ${showDropdown ? styles.open : ''}`}>
      {showDropdown && <div className={styles.backdrop} onClick={() => setOpen(false)} />}
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder="Search patients, services, appointments…"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
      />
      {showDropdown && (
        <div className={styles.panel} style={panelStyle}>
          {status === 'loading' && <p className={styles.message}>Searching…</p>}
          {status === 'error' && <p className={styles.message}>Search failed</p>}
          {status === 'done' && results &&
            (results.patients.length === 0 && results.services.length === 0 && results.appointments.length === 0 ? (
              <p className={styles.message}>No results</p>
            ) : (
              <>
                {renderSection('Patients', results.patients.map((p) => (
                  <button key={p.id} type="button" className={styles.row} onClick={() => goTo('/admin/patients')}>
                    <span className={styles.rowTitle}>{p.name}</span>
                    <span className={styles.rowSub}>{p.email}</span>
                  </button>
                )))}
                {renderSection('Services', results.services.map((s) => (
                  <button key={s.id} type="button" className={styles.row} onClick={() => goTo('/admin/services')}>
                    <span className={styles.rowTitle}>{s.name}</span>
                  </button>
                )))}
                {renderSection('Appointments', results.appointments.map((a) => (
                  <button key={a.id} type="button" className={styles.row} onClick={() => goTo('/admin/today')}>
                    <span className={styles.rowTitle}>{a.patient_name}</span>
                    <span className={styles.rowSub}>
                      {a.service_name || a.service_description || 'General'} · {formatDate(a.requested_date)}
                    </span>
                  </button>
                )))}
              </>
            ))}
        </div>
      )}
    </div>
  )
}
