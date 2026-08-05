import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  heading: string
  subtext?: string
  action?: ReactNode
  illustration?: ReactNode
  variant?: 'default' | 'calendar' | 'patients' | 'appointments'
}

function CalendarIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="12" y="16" width="56" height="52" rx="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M28 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M52 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 28H68" stroke="currentColor" strokeWidth="2"/>
      <circle cx="32" cy="40" r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="48" cy="40" r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="32" cy="54" r="4" fill="currentColor" opacity="0.1"/>
    </svg>
  )
}

function PatientsIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="28" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 62C20 51 29 42 40 42C51 42 60 51 60 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="60" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="20" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  )
}

function AppointmentsIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="16" y="20" width="48" height="44" rx="6" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 16V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M48 16V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 32H64" stroke="currentColor" strokeWidth="2"/>
      <path d="M30 44L36 50L50 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
    </svg>
  )
}

function DefaultIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="24" y="12" width="32" height="56" rx="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 28H48" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 40H48" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 52H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

const ILLUSTRATIONS = {
  default: <DefaultIllustration />,
  calendar: <CalendarIllustration />,
  patients: <PatientsIllustration />,
  appointments: <AppointmentsIllustration />,
}

export default function EmptyState({ heading, subtext, action, illustration, variant = 'default' }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.illustration}>
        {illustration || ILLUSTRATIONS[variant]}
      </div>
      <h3 className={styles.heading}>{heading}</h3>
      {subtext && <p className={styles.subtext}>{subtext}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
