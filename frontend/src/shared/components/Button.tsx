import { type ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'default' | 'small' | 'large'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const cls = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="small" />}
      <span className={loading ? styles.labelHidden : ''}>{children}</span>
    </button>
  )
}
