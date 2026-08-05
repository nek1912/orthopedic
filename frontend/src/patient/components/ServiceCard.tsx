import { type ReactNode } from 'react'
import type { ServiceResponse } from '@shared/types'
import styles from './ServiceCard.module.css'

interface ServiceCardProps {
  service: ServiceResponse
}

const serviceIcons: Record<string, ReactNode> = {
  'Joint Replacement': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <path d="M12 9v6" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  'Sports Injury & Arthroscopy': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Fracture & Trauma Care': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4C5 4 4 5 4 6.5C4 8 5.5 9 7 10L17 14C18.5 15 20 16 20 17.5C20 19 19 20 18 20" strokeLinecap="round" />
      <path d="M12 9L10 12L13 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Spine & Back Pain Care': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="9" y="3" width="6" height="3" rx="1" />
      <rect x="9" y="8" width="6" height="3" rx="1" />
      <rect x="9" y="13" width="6" height="3" rx="1" />
      <rect x="9" y="18" width="6" height="3" rx="1" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="12" y1="11" x2="12" y2="13" />
      <line x1="12" y1="16" x2="12" y2="18" />
    </svg>
  ),
  'Arthritis & Pain Relief': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8V12L15 13" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  'Rehab & Mobility Check': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2a3 3 0 100 6 3 3 0 000-6z" />
      <path d="M17 11.5L12 9 7 11.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v6" />
      <path d="M9 22l3-7 3 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const icon = serviceIcons[service.name] || serviceIcons['Other Treatments']

  return (
    <div className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <h3 className={styles.name}>{service.name}</h3>
      {service.description && (
        <p className={styles.description}>{service.description}</p>
      )}
    </div>
  )
}
