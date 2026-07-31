import { type ReactNode } from 'react'
import type { ServiceResponse } from '@shared/types'
import styles from './ServiceCard.module.css'

interface ServiceCardProps {
  service: ServiceResponse
}

const serviceIcons: Record<string, ReactNode> = {
  'General Dentistry': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C8 2 5 5 5 8c0 2 1 3 2 4l1 1v5a1 1 0 001 1h6a1 1 0 001-1v-5l1-1c1-1 2-2 2-4 0-3-3-6-7-6z" />
    </svg>
  ),
  'Dental Implants': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="2" width="8" height="6" rx="1" />
      <path d="M12 8v14" />
      <path d="M8 12h8" />
    </svg>
  ),
  'Orthodontics': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="12" r="2" />
      <circle cx="17" cy="12" r="2" />
      <path d="M9 12h6" />
      <path d="M5 12v-2" />
      <path d="M19 12v-2" />
    </svg>
  ),
  'Cosmetic Dentistry': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L9 7l-5 1 3.5 4L6 18l6-3 6 3-1.5-6L18 8l-5-1z" />
    </svg>
  ),
  'Root Canal Treatment': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 14h.01" />
    </svg>
  ),
  'Other Treatments': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
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
