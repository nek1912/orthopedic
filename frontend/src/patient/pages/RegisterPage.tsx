import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { useToast } from '@shared/context/ToastContext'
import { ApiError } from '@shared/api/client'
import Input from '@shared/components/Input'
import AuthForm from '@patient/components/AuthForm'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await register({ name, email, password, phone: phone || null })
      toast('Account created successfully!', 'success')
      navigate('/book')
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
      title="Create your account"
      subtitle="Join us for expert orthopedic care"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create account"
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <Input
        label="Name"
        type="text"
        name="name"
        placeholder="Your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        error={error || undefined}
      />
      <Input
        label="Phone (optional)"
        type="tel"
        name="phone"
        placeholder="(555) 123-4567"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
    </AuthForm>
  )
}
