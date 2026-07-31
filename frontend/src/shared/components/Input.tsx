import { type InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || props.name
    const cls = [styles.input, error ? styles.hasError : '', className].filter(Boolean).join(' ')

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={cls} {...props} />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
