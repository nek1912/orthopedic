import type { PrescriptionResponse } from '@shared/types'
import styles from './PrescriptionView.module.css'

interface PrescriptionViewProps {
  prescriptions: PrescriptionResponse[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

export default function PrescriptionView({ prescriptions }: PrescriptionViewProps) {
  if (prescriptions.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No prescription recorded yet.</p>
      </div>
    )
  }

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
                <h4 className={styles.sectionTitle}>Diagnosis</h4>
                <p className={styles.diagnosis}>{p.diagnosis}</p>
              </div>
            )}

            {meds.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Medicines</h4>
                <div className={styles.medicineList}>
                  {meds.map((m, mIdx) => (
                    <div key={mIdx} className={styles.medicine}>
                      <div className={styles.medName}>{m.name || 'Medicine'}</div>
                      <div className={styles.medDetails}>
                        {m.dosage && <span className={styles.medDetail}><strong>Dosage:</strong> {m.dosage}</span>}
                        {m.frequency && <span className={styles.medDetail}><strong>Frequency:</strong> {m.frequency}</span>}
                        {m.duration && <span className={styles.medDetail}><strong>Duration:</strong> {m.duration}</span>}
                        {m.instructions && <span className={styles.medDetail}><strong>Instructions:</strong> {m.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {p.notes && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Doctor&apos;s Notes</h4>
                <p className={styles.notes}>{p.notes}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
