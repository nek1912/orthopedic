import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { useToast } from '@shared/context/ToastContext'
import { ApiError } from '@shared/api/client'
import Input from '@shared/components/Input'
import AuthForm from '@patient/components/AuthForm'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await login({ email, password })
      toast('Welcome back!', 'success')
      const returnUrl = searchParams.get('returnUrl') || '/book'
      navigate(returnUrl)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail)
      } else {
        setError('An error occurred. Please try again.')
      }
    }
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your account"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Sign in"
      footer={
        <>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </>
      }
    >
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={error ? ' ' : undefined}
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        error={error || undefined}
      />
    </AuthForm>
  )
}
