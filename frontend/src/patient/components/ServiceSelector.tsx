import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import type { ServiceResponse } from '@shared/types'
import { CheckupIcon, CleaningIcon, FillingIcon, RootCanalIcon, ToothIcon } from '@shared/components/Icons'
import styles from './ServiceSelector.module.css'

interface ServiceSelectorProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  customDescription: string
  onCustomDescription: (val: string) => void
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'dental checkup': <CheckupIcon className={styles.cardIcon} />,
  'checkup': <CheckupIcon className={styles.cardIcon} />,
  'general': <CheckupIcon className={styles.cardIcon} />,
  'teeth cleaning': <CleaningIcon className={styles.cardIcon} />,
  'cleaning': <CleaningIcon className={styles.cardIcon} />,
  'scaling': <CleaningIcon className={styles.cardIcon} />,
  'filling': <FillingIcon className={styles.cardIcon} />,
  'root canal': <RootCanalIcon className={styles.cardIcon} />,
  'implant': <ToothIcon className={styles.cardIcon} />,
  'orthodont': <ToothIcon className={styles.cardIcon} />,
  'braces': <ToothIcon className={styles.cardIcon} />,
  'aligner': <ToothIcon className={styles.cardIcon} />,
  'cosmetic': <ToothIcon className={styles.cardIcon} />,
  'whitening': <ToothIcon className={styles.cardIcon} />,
  'veneer': <ToothIcon className={styles.cardIcon} />,
}

const FALLBACK_ICONS: Record<number, React.ReactNode> = {
  0: <CheckupIcon className={styles.cardIcon} />,
  1: <ToothIcon className={styles.cardIcon} />,
  2: <ToothIcon className={styles.cardIcon} />,
  3: <ToothIcon className={styles.cardIcon} />,
  4: <RootCanalIcon className={styles.cardIcon} />,
  5: <CleaningIcon className={styles.cardIcon} />,
  6: <FillingIcon className={styles.cardIcon} />,
}

export default function ServiceSelector({
  selectedId,
  onSelect,
  customDescription,
  onCustomDescription,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<ServiceResponse[]>([])

  useEffect(() => {
    apiRequest<ServiceResponse[]>('/api/v1/services', { auth: false })
      .then(setServices)
      .catch(() => {
        setServices([
          { id: '1', name: 'General Dentistry', description: 'Checkups, Cleaning, Fillings & more', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '2', name: 'Dental Implants', description: 'Permanent solutions for missing teeth', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '3', name: 'Orthodontics', description: 'Braces & Aligners for a perfect smile', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '4', name: 'Cosmetic Dentistry', description: 'Smile Makeovers, Veneers, Whitening', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '5', name: 'Root Canal Treatment', description: 'Pain relief with precision care', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
        ])
      })
  }, [])

  const isOther = selectedId === '__other__'

  function getIcon(serviceName: string, index: number): React.ReactNode {
    const key = Object.keys(SERVICE_ICONS).find(k => serviceName.toLowerCase().includes(k))
    if (key) return SERVICE_ICONS[key]
    return FALLBACK_ICONS[index] || FALLBACK_ICONS[0]
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {services.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.card} ${selectedId === s.id ? styles.selected : ''}`}
            onClick={() => onSelect(s.id)}
            type="button"
          >
            <span className={styles.iconWrap}>
              {getIcon(s.name, i)}
            </span>
            <span className={styles.name}>{s.name}</span>
            {s.description && <span className={styles.desc}>{s.description}</span>}
          </button>
        ))}
        <button
          className={`${styles.card} ${isOther ? styles.selected : ''}`}
          onClick={() => onSelect('__other__')}
          type="button"
        >
          <span className={styles.iconWrap}>
            <ToothIcon className={styles.cardIcon} />
          </span>
          <span className={styles.name}>Other</span>
          <span className={styles.desc}>Describe your concern</span>
        </button>
      </div>

      {isOther && (
        <textarea
          className={styles.textarea}
          placeholder="Describe your dental concern..."
          value={customDescription}
          onChange={(e) => onCustomDescription(e.target.value)}
          rows={3}
        />
      )}
    </div>
  )
}
