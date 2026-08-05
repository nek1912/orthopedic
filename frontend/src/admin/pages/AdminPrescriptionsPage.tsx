import { useEffect, useState } from 'react'
import { apiRequest, ApiError } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import type { PrescriptionResponse, PrescriptionTemplateResponse } from '@shared/types'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminPrescriptionsPage.module.css'

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([])
  const [templates, setTemplates] = useState<PrescriptionTemplateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent')
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([
      apiRequest<PrescriptionResponse[]>('/api/v1/admin/prescriptions'),
      apiRequest<PrescriptionTemplateResponse[]>('/api/v1/admin/prescriptions/templates'),
    ])
      .then(([p, t]) => { setPrescriptions(p); setTemplates(t) })
      .catch((err) => {
        if (err instanceof ApiError) toast(err.detail, 'error')
        else toast('Failed to load prescriptions', 'error')
      })
      .finally(() => setLoading(false))
  }, [toast])

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Prescriptions</h1>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>

      {activeTab === 'recent' && (
        prescriptions.length ? (
          <div className={styles.list}>
            {prescriptions.map((rx) => {
              const medList = Array.isArray(rx.medicines?.medicines)
                ? rx.medicines.medicines
                : Array.isArray(rx.medicines)
                ? rx.medicines
                : []

              return (
                <div key={rx.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.patientName}>{rx.patient_name}</div>
                    <div className={styles.date}>{new Date(rx.created_at).toLocaleDateString()}</div>
                  </div>
                  {rx.diagnosis && <div className={styles.diagnosis}><strong>Diagnosis:</strong> {rx.diagnosis}</div>}
                  {medList.length > 0 && (
                    <div className={styles.medicines}>
                      {medList.map((m: any, idx: number) => (
                        <span key={idx} className={styles.medicine}>
                          {m.name} {m.dosage ? `(${m.dosage})` : ''} {m.frequency ? `- ${m.frequency}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {rx.notes && <div className={styles.notes} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}><em>Notes: {rx.notes}</em></div>}
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState heading="No recent prescriptions" subtext="Complete an appointment to write one." variant="default" />
        )
      )}

      {activeTab === 'templates' && (
        templates.length ? (
          <div className={styles.list}>
            {templates.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.patientName}>{t.name}</div>
                </div>
                {t.diagnosis && <div className={styles.diagnosis}>{t.diagnosis}</div>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState heading="No templates yet" subtext="Save templates from the prescription form." variant="default" />
        )
      )}
    </div>
  )
}
