import { type FormEvent, type ReactNode } from 'react'
import Button from '@shared/components/Button'
import styles from './AuthForm.module.css'

interface AuthFormProps {
  title: string
  subtitle?: string
  children: ReactNode
  onSubmit: (e: FormEvent) => void
  loading?: boolean
  submitLabel?: string
  footer?: ReactNode
}

export default function AuthForm({
  title,
  subtitle,
  children,
  onSubmit,
  loading = false,
  submitLabel = 'Submit',
  footer,
}: AuthFormProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A4.5 4.5 0 0017.5 4c-1.6 0-3.04.82-3.84 2.05" />
            <path d="M7.34 6.05C6.54 4.82 5.1 4 3.5 4A4.5 4.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5" />
            <path d="M12 20c-3 0-5.5-2.5-5.5-5.5" />
            <path d="M12 20c3 0 5.5-2.5 5.5-5.5" />
          </svg>
        </div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        <form onSubmit={onSubmit} className={styles.form}>
          {children}
          <Button type="submit" variant="primary" size="default" loading={loading} className={styles.submit}>
            {submitLabel}
          </Button>
        </form>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
