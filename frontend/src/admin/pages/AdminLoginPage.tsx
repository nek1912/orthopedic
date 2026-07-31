import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@admin/context/AdminAuthContext'
import { ApiError } from '@shared/api/client'
import Input from '@shared/components/Input'
import Button from '@shared/components/Button'
import styles from './AdminLoginPage.module.css'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAdminAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await login(password, rememberMe)
      navigate('/admin/today')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail)
      } else {
        setError('An error occurred')
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className={styles.title}>Admin Access</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error || undefined}
          />

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <Button type="submit" variant="primary" size="default" loading={loading} className={styles.submit}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
