import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@shared/api/client'
import { useToast } from '@shared/context/ToastContext'
import { ApiError } from '@shared/api/client'
import type { CalendarResponse, UnavailabilitySlot } from '@shared/types'
import Navbar from '@shared/components/Navbar'
import Button from '@shared/components/Button'
import Calendar from '@shared/components/Calendar'
import CrowdMeter from '@shared/components/CrowdMeter'
import ServiceSelector from '@patient/components/ServiceSelector'
import styles from './BookingPage.module.css'


export default function BookingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [crowdData, setCrowdData] = useState<CalendarResponse['dates']>({})
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailabilitySlot[]>([])
  const [allUnavailableHours, setAllUnavailableHours] = useState<Record<string, UnavailabilitySlot[]>>({})

  useEffect(() => {
    const m = `${year}-${month.toString().padStart(2, '0')}`
    apiRequest<CalendarResponse>(`/api/v1/availability/calendar?month=${m}`, { auth: false })
      .then((data) => {
        setCrowdData(data.dates)
        setBlockedDates(Object.entries(data.dates).filter(([, v]) => v.blocked).map(([k]) => k))
        const hoursMap: Record<string, UnavailabilitySlot[]> = {}
        Object.entries(data.dates).forEach(([date, info]) => {
          if (info.unavailable_hours && info.unavailable_hours.length > 0) {
            hoursMap[date] = info.unavailable_hours
          }
        })
        setAllUnavailableHours(hoursMap)
      })
      .catch(() => {})
  }, [year, month])

  useEffect(() => {
    if (!selectedDate) {
      setUnavailableSlots([])
      return
    }
    if (allUnavailableHours[selectedDate]) {
      setUnavailableSlots(allUnavailableHours[selectedDate])
      return
    }
    apiRequest<UnavailabilitySlot[]>(`/api/v1/availability/unavailability?date=${selectedDate}`, { auth: false })
      .then(setUnavailableSlots)
      .catch(() => setUnavailableSlots([]))
  }, [selectedDate, allUnavailableHours])

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



  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Book Your Appointment</h1>
            <p className={styles.heroSub}>Select a convenient date. Our team will review your request and confirm your time slot.</p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroShape} />
            <div className={styles.heroDot} />
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.progress}>
            <div className={`${styles.step} ${styles.active}`}>
              <span className={styles.stepNum}>1</span>
              <span className={styles.stepLabel}>Choose Date & Service</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span className={styles.stepLabel}>Review & Confirm</span>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.bookingForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionHeading}>1. Choose a Date</h3>
                <p className={styles.sectionSub}>Select any date to request your appointment</p>
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
                  <div className={styles.availabilityPanel}>
                    <h4 className={styles.panelHeading}>Date Availability</h4>
                    {selectedDate && <p className={styles.selectedDateText}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                    <CrowdMeter />
                    {unavailableSlots.length > 0 && (
                      <div className={styles.unavailableNote}>
                        <span className={styles.unavailableIcon}>⚠</span>
                        <div>
                          <strong>Doctor unavailable:</strong>
                          {unavailableSlots.map((slot, i) => (
                            <p key={i} className={styles.unavailableTime}>
                              {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                              {slot.reason && <span className={styles.unavailableReason}> ({slot.reason})</span>}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={styles.infoBox}>
                      <span className={styles.infoIcon}>🕒</span>
                      <div>
                        <strong>Please note:</strong>
                        <p>You are requesting for the day only. Exact time slot will be assigned after your request is accepted.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionHeading}>2. Select the Reason for Visit</h3>
                <p className={styles.sectionSub}>Choose the main concern or service you need</p>
                <ServiceSelector
                  selectedId={selectedServiceId}
                  onSelect={setSelectedServiceId}
                  customDescription={customDescription}
                  onCustomDescription={setCustomDescription}
                />
              </div>

              <div className={styles.actions}>
                <Button
                  variant="primary"
                  size="default"
                  disabled={!selectedDate || !selectedServiceId || (selectedServiceId === '__other__' && !customDescription)}
                  loading={submitting}
                  onClick={handleConfirm}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
