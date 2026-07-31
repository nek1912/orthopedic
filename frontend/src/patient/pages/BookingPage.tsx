import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import { ApiError } from '@shared/api/client'
import type { CalendarResponse, ServiceResponse } from '@shared/types'
import Navbar from '@shared/components/Navbar'
import Button from '@shared/components/Button'
import Calendar from '@shared/components/Calendar'
import CrowdMeter from '@shared/components/CrowdMeter'
import { CalendarIcon, CheckupIcon, SparkleIcon } from '@shared/components/Icons'
import ServiceSelector from '@patient/components/ServiceSelector'
import BookingConfirmation from '@patient/components/BookingConfirmation'
import styles from './BookingPage.module.css'

type Step = 'service' | 'date' | 'confirm'

export default function BookingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('service')
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [crowdData, setCrowdData] = useState<CalendarResponse['dates']>({})
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [services, setServices] = useState<ServiceResponse[]>([])

  useEffect(() => {
    apiRequest<ServiceResponse[]>('/api/v1/services', { auth: false })
      .then(setServices)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const m = `${year}-${month.toString().padStart(2, '0')}`
    apiRequest<CalendarResponse>(`/api/v1/availability/calendar?month=${m}`, { auth: false })
      .then((data) => {
        setCrowdData(data.dates)
        setBlockedDates(Object.entries(data.dates).filter(([, v]) => v.blocked).map(([k]) => k))
      })
      .catch(() => {})
  }, [year, month])

  function getServiceName(id: string | null): string {
    if (id === '__other__') return customDescription || 'Other'
    const svc = services.find((s) => s.id === id)
    return svc?.name || 'Selected service'
  }

  async function handleConfirm() {
    if (!selectedServiceId || !selectedDate) return
    setSubmitting(true)
    try {
      await apiRequest('/api/v1/appointments', {
        method: 'POST',
        body: {
          service_id: selectedServiceId === '__other__' ? null : selectedServiceId,
          service_description: selectedServiceId === '__other__' ? customDescription : null,
          requested_date: selectedDate,
        },
      })
      toast('Appointment booked successfully!', 'success')
      navigate('/my-appointments')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          toast('Session expired. Please log in again.', 'error')
          navigate('/login')
          return
        }
        toast(err.detail, 'error')
      } else {
        toast('Failed to book appointment', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'service', label: 'Service', icon: <CheckupIcon className={styles.stepIcon} /> },
    { key: 'date', label: 'Date', icon: <CalendarIcon className={styles.stepIcon} /> },
    { key: 'confirm', label: 'Confirm', icon: <SparkleIcon className={styles.stepIcon} /> },
  ]
  const currentIdx = steps.findIndex((s) => s.key === step)

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>Book Appointment</span>
            <h1 className={styles.heroTitle}>Your smile deserves<br />the best care</h1>
            <p className={styles.heroSub}>Choose your service, pick a date, and we&apos;ll handle the rest.</p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroShape} />
            <div className={styles.heroDot} />
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.progress}>
            {steps.map((s, i) => (
              <div key={s.key} className={`${styles.step} ${i <= currentIdx ? styles.active : ''} ${i < currentIdx ? styles.done : ''}`}>
                <span className={styles.stepNum}>
                  {i < currentIdx ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={styles.stepLabel}>{s.label}</span>
                {i < steps.length - 1 && <span className={styles.stepLine} />}
              </div>
            ))}
          </div>

          <div className={styles.content}>
            {step === 'service' && (
              <div>
                <h2 className={styles.heading}>Select Service</h2>
                <p className={styles.headingSub}>What brings you in today?</p>
                <ServiceSelector
                  selectedId={selectedServiceId}
                  onSelect={setSelectedServiceId}
                  customDescription={customDescription}
                  onCustomDescription={setCustomDescription}
                />
                <div className={styles.actions}>
                  <Button
                    variant="primary"
                    size="default"
                    disabled={!selectedServiceId}
                    onClick={() => setStep('date')}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 'date' && (
              <div>
                <h2 className={styles.heading}>Pick a Date</h2>
                <p className={styles.headingSub}>Select an available date for your visit</p>
                <div className={styles.calendarWrap}>
                  <Calendar
                    year={year}
                    month={month}
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    crowdData={crowdData}
                    blockedDates={blockedDates}
                    onMonthChange={(y, m) => { setYear(y); setMonth(m) }}
                  />
                  <CrowdMeter />
                </div>
                <div className={styles.actions}>
                  <Button variant="ghost" size="small" onClick={() => setStep('service')}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="default"
                    disabled={!selectedDate}
                    onClick={() => setStep('confirm')}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div>
                <h2 className={styles.heading}>Confirm Booking</h2>
                <p className={styles.headingSub}>Review your appointment details</p>
                <BookingConfirmation
                  serviceName={getServiceName(selectedServiceId)}
                  date={selectedDate!}
                />
                <div className={styles.actions}>
                  <Button variant="ghost" size="small" onClick={() => setStep('date')}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="default"
                    loading={submitting}
                    onClick={handleConfirm}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
