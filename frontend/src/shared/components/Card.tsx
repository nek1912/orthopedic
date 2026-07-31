import { type HTMLAttributes } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'static' | 'interactive' | 'elevated'
}

export default function Card({ variant = 'static', children, className = '', ...props }: CardProps) {
  const cls = [styles.card, styles[variant], className].filter(Boolean).join(' ')
  return <div className={cls} {...props}>{children}</div>
}
