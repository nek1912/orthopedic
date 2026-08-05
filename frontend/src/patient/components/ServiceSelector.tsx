import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import type { ServiceResponse } from '@shared/types'
import { CheckupIcon, SportsMedicineIcon, FractureIcon, SpineIcon, JointIcon } from '@shared/components/Icons'
import styles from './ServiceSelector.module.css'

interface ServiceSelectorProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  customDescription: string
  onCustomDescription: (val: string) => void
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'joint': <CheckupIcon className={styles.cardIcon} />,
  'sports': <SportsMedicineIcon className={styles.cardIcon} />,
  'fracture': <FractureIcon className={styles.cardIcon} />,
  'spine': <SpineIcon className={styles.cardIcon} />,
  'arthritis': <JointIcon className={styles.cardIcon} />,
  'rehab': <JointIcon className={styles.cardIcon} />,
}

const FALLBACK_ICONS: Record<number, React.ReactNode> = {
  0: <CheckupIcon className={styles.cardIcon} />,
  1: <JointIcon className={styles.cardIcon} />,
  2: <JointIcon className={styles.cardIcon} />,
  3: <JointIcon className={styles.cardIcon} />,
  4: <SpineIcon className={styles.cardIcon} />,
  5: <SportsMedicineIcon className={styles.cardIcon} />,
  6: <FractureIcon className={styles.cardIcon} />,
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
          { id: '00000000-0000-0000-0000-000000000001', name: 'Joint Replacement', description: 'Hip, Knee, Shoulder Consultation & Surgery', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '00000000-0000-0000-0000-000000000002', name: 'Sports Injury & Arthroscopy', description: 'Minimally Invasive Ligament & Joint Repair', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '00000000-0000-0000-0000-000000000003', name: 'Fracture & Trauma Care', description: 'Bone Setting, Casting & Emergency Care', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '00000000-0000-0000-0000-000000000004', name: 'Spine & Back Pain Care', description: 'Disc, Vertebral & Sciatica Management', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '00000000-0000-0000-0000-000000000005', name: 'Arthritis & Pain Relief', description: 'Joint Injections, Pain Therapy & Care', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '00000000-0000-0000-0000-000000000006', name: 'Rehab & Mobility Check', description: 'Post-op Physical Therapy & Alignment', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
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
            <JointIcon className={styles.cardIcon} />
          </span>
          <span className={styles.name}>Other Concern</span>
          <span className={styles.desc}>Describe your orthopedic concern</span>
        </button>
      </div>

      {isOther && (
        <textarea
          className={styles.textarea}
          placeholder="Describe your joint, bone, or orthopedic concern..."
          value={customDescription}
          onChange={(e) => onCustomDescription(e.target.value)}
          rows={3}
        />
      )}
    </div>
  )
}
