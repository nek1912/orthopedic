import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '@shared/components/Navbar'
import Button from '@shared/components/Button'
import { apiRequest } from '@shared/api/client'
import type { ServiceResponse } from '@shared/types'
import HeroSection from '@patient/components/HeroSection'
import ServiceCard from '@patient/components/ServiceCard'
import Footer from '@patient/components/Footer'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [services, setServices] = useState<ServiceResponse[]>([])

  useEffect(() => {
    apiRequest<ServiceResponse[]>('/api/v1/services', { auth: false })
      .then(setServices)
      .catch(() => {
        setServices([
          { id: '1', name: 'General Dentistry', description: 'Checkups, Cleaning, Fillings & more', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '2', name: 'Dental Implants', description: 'Permanent solutions for missing teeth', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '3', name: 'Orthodontics', description: 'Braces & Aligners for a perfect smile', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '4', name: 'Cosmetic Dentistry', description: 'Smile Makeovers, Veneers, Whitening', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '5', name: 'Root Canal Treatment', description: 'Pain relief with precision care', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
          { id: '6', name: 'Other Treatments', description: 'Not listed? Tell us your need', duration_minutes: 30, default_fee: 0, preparation_notes: null, requires_followup: false, is_active: true },
        ])
      })
  }, [])

  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (window.location.hash) {
      const id = window.location.hash.slice(1)
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [location.state])

  const testimonials = [
    { quote: 'Excellent care, very polite staff and a comfortable experience. Highly recommend Dr. Aarav Mehta Dental Care.', name: 'Priya Sharma' },
    { quote: 'Best dental experience I have ever had. The doctor is very skilled and the clinic is extremely hygienic and modern.', name: 'Rahul Verma' },
    { quote: 'Got my root canal done here painlessly. The staff made sure I was comfortable throughout. Highly recommended!', name: 'Ananya Gupta' },
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    setCurrentTestimonial(idx)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
  }, [testimonials.length])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }
  const onTouchEnd = () => {
    if (touchDeltaX.current > 50) {
      goTo((currentTestimonial - 1 + testimonials.length) % testimonials.length)
    } else if (touchDeltaX.current < -50) {
      goTo((currentTestimonial + 1) % testimonials.length)
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        <section id="services" className={styles.section}>
          <div className={styles.container}>
            <span className={styles.label}>What We Offer</span>
            <h2 className={styles.sectionTitle}>Our Services</h2>
            <div className={styles.servicesGrid}>
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className={`${styles.section} ${styles.doctorSection}`}>
          <div className={styles.container}>
            <div className={styles.doctorGrid}>
              <div className={styles.doctorImage}>
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=600&fit=crop&crop=top"
                  alt="Dr. Aarav Mehta - Dental Surgeon"
                  className={styles.doctorPhoto}
                />
              </div>
              <div className={styles.doctorContent}>
                <span className={styles.label}>About The Doctor</span>
                <h2 className={styles.sectionTitle}>Care That Feels Personal</h2>
                <p className={styles.doctorText}>
                  Led by Dr. Aarav Mehta, our clinic is built on trust, transparency and the belief that every smile deserves the best care.
                </p>
                <ul className={styles.credentials}>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>BDS, MDS — Conservative Dentistry</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>10+ Years of Clinical Experience</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Modern Technology & Gentle Approach</span>
                  </li>
                </ul>
                <Button variant="primary" size="default" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                  Know More About Dr. Aarav
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.bookingSection}`}>
          <div className={styles.container}>
            <div className={styles.bookingGrid}>
              <div className={styles.bookingCalendar}>
                <div className={styles.calendarDemo}>
                  <div className={styles.calendarNav}>
                    <button className={styles.calendarArrow} aria-label="Previous month">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className={styles.calendarMonth}>June 2025</span>
                    <button className={styles.calendarArrow} aria-label="Next month">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className={styles.dayHeader}>{d}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1
                      const hasDot = [3, 10, 17, 24].includes(day)
                      const dotColor = day === 10 ? 'red' : day === 17 ? 'orange' : 'green'
                      return (
                        <div key={day} className={styles.calendarDay}>
                          {day}
                          {hasDot && <span className={`${styles.dot} ${styles[dotColor]}`} />}
                        </div>
                      )
                    })}
                  </div>
                  <div className={styles.legend}>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.red}`} /> Very Busy
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.orange}`} /> Busy
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.yellow}`} /> Moderate
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.green}`} /> Available
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.gray}`} /> Closed
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.bookingContent}>
                <span className={styles.label}>Easy Appointment Booking</span>
                <h2 className={styles.sectionTitle}>Book Your Appointment In Just a Few Steps</h2>
                <p className={styles.bookingText}>
                  Select a date that works for you. We&apos;ll confirm your request after reviewing availability.
                </p>
                <div className={styles.steps}>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4" />
                        <path d="M8 2v4" />
                        <path d="M3 10h18" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.stepTitle}>Choose a Date</span>
                      <span className={styles.stepText}>See crowd levels to pick the right day</span>
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.stepTitle}>Tell Us Your Concern</span>
                      <span className={styles.stepText}>Select a service and fill basic details</span>
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.stepTitle}>We&apos;ll Confirm</span>
                      <span className={styles.stepText}>We&apos;ll review & confirm your appointment</span>
                    </div>
                  </div>
                </div>
                <Button variant="primary" size="default" onClick={() => navigate('/book')}>
                  Book Your Appointment
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.values}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Why Patients Choose Us</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Minimal Waiting</h3>
                <p className={styles.valueText}>Smart scheduling to reduce waiting time</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Modern Clinic</h3>
                <p className={styles.valueText}>Advanced equipment for better diagnosis</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Transparent Care</h3>
                <p className={styles.valueText}>Clear treatment plans & honest advice</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Comfort Focused</h3>
                <p className={styles.valueText}>Pain-free, gentle & patient-friendly care</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.testimonialSection}`}>
          <div className={styles.container}>
            <div
              className={styles.testimonialCard}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <svg className={styles.quoteIcon} width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className={styles.quote} key={currentTestimonial}>
                {testimonials[currentTestimonial].quote}
              </blockquote>
              <div className={styles.author}>
                <span className={styles.authorName}>— {testimonials[currentTestimonial].name}</span>
              </div>
              <div className={styles.pagination}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageDot} ${i === currentTestimonial ? styles.activeDot : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaBanner}>
          <div className={styles.container}>
            <div className={styles.ctaBannerContent}>
              <div className={styles.ctaBannerIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A4.5 4.5 0 0017.5 4c-1.6 0-3.04.82-3.84 2.05" />
                  <path d="M7.34 6.05C6.54 4.82 5.1 4 3.5 4A4.5 4.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5" />
                  <path d="M12 20c-3 0-5.5-2.5-5.5-5.5" />
                  <path d="M12 20c3 0 5.5-2.5 5.5-5.5" />
                </svg>
              </div>
              <div className={styles.ctaBannerText}>
                <h3>Your smile is our priority.</h3>
                <p>We&apos;re here to help you smile with confidence.</p>
              </div>
              <Button variant="primary" size="default" onClick={() => navigate('/book')}>
                Book Appointment Now
              </Button>
            </div>
          </div>
        </section>

        <section id="contact" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Get In Touch</h2>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Phone</h3>
                <p className={styles.valueText}>+91 98765 43210</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Address</h3>
                <p className={styles.valueText}>123 Dental Lane, Mumbai, Maharashtra 400001</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Hours</h3>
                <p className={styles.valueText}>Mon - Sat: 9:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
