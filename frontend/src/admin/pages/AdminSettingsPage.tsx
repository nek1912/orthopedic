import { useState, useEffect, type FormEvent } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { SettingsResponse } from '@shared/types'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import Card from '@shared/components/Card'
import Skeleton from '@shared/components/Skeleton'
import styles from './AdminSettingsPage.module.css'

export default function AdminSettingsPage() {
  const [, setSettings] = useState<SettingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [clinicName, setClinicName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    apiRequest<SettingsResponse>('/api/v1/admin/settings')
      .then((data) => {
        setSettings(data)
        setClinicName(data.clinic_name || '')
        setAddress(data.address || '')
        setPhone(data.phone || '')
      })
      .catch(() => toast('Failed to load settings', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = await apiRequest<SettingsResponse>('/api/v1/admin/settings', {
        method: 'PATCH',
        body: { clinic_name: clinicName || null, address: address || null, phone: phone || null },
      })
      setSettings(data)
      toast('Settings saved', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error')
      return
    }
    setChangingPassword(true)
    try {
      await apiRequest('/api/v1/admin/password', {
        method: 'PATCH',
        body: { current_password: currentPassword, new_password: newPassword },
      })
      toast('Password changed', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      if (err instanceof ApiError) toast(err.detail, 'error')
      else toast('Failed to change password', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton width="200px" height="2rem" />
        <Skeleton width="100%" height="200px" borderRadius="var(--radius-md)" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      <Card variant="static" className={styles.card}>
        <h2 className={styles.cardTitle}>Clinic Information</h2>
        <form onSubmit={handleSave} className={styles.form}>
          <Input label="Clinic Name" type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Address</label>
            <textarea className={styles.textarea} value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className={styles.actions}>
            <Button variant="primary" size="small" type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Card>

      <Card variant="static" className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        <form onSubmit={handleChangePassword} className={styles.form}>
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <div className={styles.actions}>
            <Button variant="primary" size="small" type="submit" loading={changingPassword}>Update Password</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
