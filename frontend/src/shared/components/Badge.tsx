import { type HTMLAttributes } from 'react'
import styles from './Badge.module.css'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  dot?: boolean
}

export default function Badge({ variant = 'default', dot = true, children, className = '', ...props }: BadgeProps) {
  const cls = [styles.badge, styles[variant], className].filter(Boolean).join(' ')
  return (
    <span className={cls} {...props}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  )
}

export function StatusBadge({ status, ...props }: { status: string } & Omit<BadgeProps, 'variant'>) {
  return <Badge variant={status as BadgeProps['variant'] || 'default'} {...props}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}
