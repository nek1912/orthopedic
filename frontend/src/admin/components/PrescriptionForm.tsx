import { useState, type FormEvent } from 'react'
import Button from '@shared/components/Button'
import styles from './PrescriptionForm.module.css'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface PrescriptionFormProps {
  appointmentId: string
  onSubmit: (data: { appointment_id: string; diagnosis: string; medicines: { medicines: Medicine[] }; notes: string }) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export default function PrescriptionForm({ appointmentId, onSubmit, onCancel, submitting }: PrescriptionFormProps) {
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }])
  const [notes, setNotes] = useState('')

  function addMedicine() {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  function removeMedicine(i: number) {
    setMedicines(medicines.filter((_, idx) => idx !== i))
  }

  function updateMedicine(i: number, field: keyof Medicine, value: string) {
    const updated = [...medicines]
    updated[i] = { ...updated[i], [field]: value }
    setMedicines(updated)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      appointment_id: appointmentId,
      diagnosis,
      medicines: { medicines },
      notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Diagnosis</label>
        <textarea
          className={styles.textarea}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={3}
          placeholder="Enter diagnosis..."
        />
      </div>

      <div className={styles.field}>
        <div className={styles.medHeader}>
          <label className={styles.label}>Medicines</label>
          <button type="button" className={styles.addBtn} onClick={addMedicine}>+ Add</button>
        </div>
        {medicines.map((med, i) => (
          <div key={i} className={styles.medRow}>
            <input className={styles.medInput} placeholder="Name" value={med.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} />
            <input className={styles.medInput} placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} />
            <input className={styles.medInput} placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)} />
            <input className={styles.medInput} placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} />
            {medicines.length > 1 && (
              <button type="button" className={styles.removeBtn} onClick={() => removeMedicine(i)}>&times;</button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional notes..."
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="small" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="small" type="submit" loading={submitting}>Save Prescription</Button>
      </div>
    </form>
  )
}
