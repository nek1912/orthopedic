import Card from '@shared/components/Card'
import { CheckupIcon, CalendarIcon } from '@shared/components/Icons'
import styles from './BookingConfirmation.module.css'

interface BookingConfirmationProps {
  serviceName: string
  date: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BookingConfirmation({ serviceName, date }: BookingConfirmationProps) {
  return (
    <Card variant="static" className={styles.card}>
      <div className={styles.summary}>
        <div className={styles.iconRow}>
          <span className={styles.iconCircle}>
            <CheckupIcon className={styles.icon} />
          </span>
        </div>
        <h3 className={styles.serviceName}>{serviceName}</h3>
        <p className={styles.confirmText}>Please confirm your appointment details below</p>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.rowIcon}>
            <CheckupIcon className={styles.rowIconSvg} />
          </span>
          <div className={styles.rowContent}>
            <span className={styles.rowLabel}>Service</span>
            <span className={styles.rowValue}>{serviceName}</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.row}>
          <span className={styles.rowIcon}>
            <CalendarIcon className={styles.rowIconSvg} />
          </span>
          <div className={styles.rowContent}>
            <span className={styles.rowLabel}>Date</span>
            <span className={styles.rowValue}>{formatDate(date)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
