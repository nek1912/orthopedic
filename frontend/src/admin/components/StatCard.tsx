import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: string | number
  trend?: string
  icon?: ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning'
}

export default function StatCard({ label, value, trend, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.header}>
        <p className={styles.label}>{label}</p>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <p className={styles.value}>{value}</p>
      {trend && <p className={styles.trend}>{trend}</p>}
    </div>
  )
}
