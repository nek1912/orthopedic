import type { PrescriptionResponse } from '@shared/types'
import styles from './AdminPrescriptionView.module.css'

interface AdminPrescriptionViewProps {
  prescriptions: PrescriptionResponse[]
}

interface Medicine {
  name?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

function parseMedicines(medicines: unknown): Medicine[] {
  if (!medicines) return []
  if (Array.isArray(medicines)) return medicines as Medicine[]
  if (typeof medicines === 'object' && medicines !== null) {
    const obj = medicines as Record<string, unknown>
    if (Array.isArray(obj.medicines)) return obj.medicines as Medicine[]
    return []
  }
  return []
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminPrescriptionView({ prescriptions }: AdminPrescriptionViewProps) {
  if (prescriptions.length === 0) return null

  return (
    <div className={styles.container}>
      {prescriptions.map((p, idx) => {
        const meds = parseMedicines(p.medicines)
        return (
          <div key={p.id || idx} className={styles.prescription}>
            <div className={styles.header}>
              <span className={styles.date}>{formatDate(p.created_at)}</span>
            </div>

            {p.diagnosis && (
              <div className={styles.section}>
                <h4 className={styles.label}>Diagnosis</h4>
                <p className={styles.diagnosis}>{p.diagnosis}</p>
              </div>
            )}

            {meds.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.label}>Medicines</h4>
                <div className={styles.medList}>
                  {meds.map((m, mIdx) => (
                    <div key={mIdx} className={styles.medCard}>
                      <span className={styles.medName}>{m.name || 'Medicine'}</span>
                      <div className={styles.medDetails}>
                        {m.dosage && <span>Dosage: {m.dosage}</span>}
                        {m.frequency && <span>Frequency: {m.frequency}</span>}
                        {m.duration && <span>Duration: {m.duration}</span>}
                        {m.instructions && <span>Instructions: {m.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {p.notes && (
              <div className={styles.section}>
                <h4 className={styles.label}>Notes</h4>
                <p className={styles.notes}>{p.notes}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
