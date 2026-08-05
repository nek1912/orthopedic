import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '@shared/components/Navbar'
import Button from '@shared/components/Button'
import HeroSection from '@patient/components/HeroSection'
import Footer from '@patient/components/Footer'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()

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

  const conditions = [
    { name: 'Knee Pain', icon: 'knee' },
    { name: 'Back & Neck Pain', icon: 'spine' },
    { name: 'Shoulder Pain', icon: 'shoulder' },
    { name: 'Sports Injuries', icon: 'sports' },
    { name: 'Fractures', icon: 'fracture' },
    { name: 'Arthritis', icon: 'arthritis' },
    { name: 'Joint Replacement', icon: 'joint' },
  ]

  const testimonials = [
    { quote: 'After years of knee pain, I finally got my life back. The treatment and care I received were exceptional.', name: 'Anjali Sharma', treatment: 'Knee Pain Treatment', rating: 5 },
    { quote: 'Very professional and friendly doctor. Explained everything clearly and treated my back pain very effectively.', name: 'Ramesh Patel', treatment: 'Back Pain Treatment', rating: 5 },
    { quote: 'The surgery and recovery guidance were excellent. I\'m now pain-free and walking daily.', name: 'Meena Iyer', treatment: 'Knee Replacement', rating: 5 },
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

        <section id="conditions" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Conditions We Treat</h2>
            <div className={styles.conditionsGrid}>
              {conditions.map((c) => (
                <div key={c.name} className={styles.conditionCard}>
                  <div className={styles.conditionIcon}>
                    {c.icon === 'knee' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="6" r="3" />
                        <circle cx="12" cy="18" r="3" />
                        <path d="M12 9v6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {c.icon === 'spine' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="9" y="3" width="6" height="3" rx="1" />
                        <rect x="9" y="8" width="6" height="3" rx="1" />
                        <rect x="9" y="13" width="6" height="3" rx="1" />
                        <rect x="9" y="18" width="6" height="3" rx="1" />
                        <line x1="12" y1="6" x2="12" y2="8" />
                        <line x1="12" y1="11" x2="12" y2="13" />
                        <line x1="12" y1="16" x2="12" y2="18" />
                      </svg>
                    )}
                    {c.icon === 'shoulder' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M8 12L4 20" strokeLinecap="round" />
                        <path d="M16 12L20 20" strokeLinecap="round" />
                        <path d="M12 12V20" strokeLinecap="round" />
                      </svg>
                    )}
                    {c.icon === 'sports' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2C6.5 2 2 6.5 2 12" />
                        <path d="M22 12C22 6.5 17.5 2 12 2" />
                        <path d="M12 22C17.5 22 22 17.5 22 12" />
                      </svg>
                    )}
                    {c.icon === 'fracture' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 4C5 4 4 5 4 6.5C4 8 5.5 9 7 10L17 14C18.5 15 20 16 20 17.5C20 19 19 20 18 20" strokeLinecap="round" />
                        <path d="M12 9L10 12L13 15" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {c.icon === 'arthritis' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="7" />
                        <path d="M12 8V12L15 13" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
                      </svg>
                    )}
                    {c.icon === 'joint' && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2a3 3 0 100 6 3 3 0 000-6z" />
                        <path d="M17 11.5L12 9 7 11.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 9v6" />
                        <path d="M9 22l3-7 3 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={styles.conditionName}>{c.name}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="default" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
              View All Conditions
            </Button>
          </div>
        </section>

        <section id="services" className={`${styles.section} ${styles.bookingSection}`}>
          <div className={styles.container}>
            <div className={styles.bookingGrid}>
              <div className={styles.bookingContent}>
                <span className={styles.label}>QUICK & EASY BOOKING</span>
                <h2 className={styles.sectionTitle}>Book Your Appointment<br />in Just 3 Simple Steps</h2>
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
                    <div className={styles.stepContent}>
                      <span className={styles.stepNumber}>1</span>
                      <span className={styles.stepTitle}>Choose Date</span>
                      <span className={styles.stepText}>Select a convenient day from the calendar</span>
                    </div>
                  </div>
                  <div className={styles.stepArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div className={styles.stepContent}>
                      <span className={styles.stepNumber}>2</span>
                      <span className={styles.stepTitle}>Tell Us About You</span>
                      <span className={styles.stepText}>Fill in a few basic details about your concern</span>
                    </div>
                  </div>
                  <div className={styles.stepArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className={styles.stepContent}>
                      <span className={styles.stepNumber}>3</span>
                      <span className={styles.stepTitle}>We Review & Confirm</span>
                      <span className={styles.stepText}>We&apos;ll confirm your request and assign a time</span>
                    </div>
                  </div>
                </div>
                <Button variant="primary" size="default" onClick={() => navigate('/book')}>
                  Book Appointment Now
                </Button>
                <span className={styles.freeText}>It&apos;s completely free!</span>
              </div>
              <div className={styles.bookingCalendar}>
                <div className={styles.calendarDemo}>
                  <div className={styles.calendarHeader}>
                    <span className={styles.calendarTitle}>Select a Date</span>
                  </div>
                  <div className={styles.calendarNav}>
                    <button className={styles.calendarArrow} aria-label="Previous month">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className={styles.calendarMonth}>May 2026</span>
                    <button className={styles.calendarArrow} aria-label="Next month">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.calendarGrid}>
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                      <div key={d} className={styles.dayHeader}>{d}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1
                      const hasDot = [3, 8, 9, 10, 13, 14, 15, 17, 18, 20, 22, 23, 24, 25, 27].includes(day)
                      const isBusy = [8, 9, 10, 14, 15, 22, 23].includes(day)
                      const isModerate = [13, 18, 24, 25, 27].includes(day)
                      const isSelected = day === 20
                      const dotColor = isBusy ? 'red' : isModerate ? 'orange' : 'green'
                      return (
                        <div key={day} className={`${styles.calendarDay} ${isSelected ? styles.selectedDay : ''}`}>
                          {day}
                          {hasDot && <span className={`${styles.dot} ${styles[dotColor]}`} />}
                        </div>
                      )
                    })}
                  </div>
                  <div className={styles.legend}>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.red}`} /> Busy
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.orange}`} /> Moderate
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.dot} ${styles.green}`} /> Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.values}`}>
          <div className={styles.container}>
            <span className={styles.label}>WHY PATIENTS CHOOSE US</span>
            <h2 className={styles.sectionTitle}>Care That <span className={styles.highlight}>Moves</span> You Forward</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Accurate Diagnosis</h3>
                <p className={styles.valueText}>Thorough evaluation using advanced imaging & clinical expertise.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Personalized Treatment</h3>
                <p className={styles.valueText}>Tailored treatment plans designed for your unique needs.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Modern Facilities</h3>
                <p className={styles.valueText}>State-of-the-art equipment for better outcomes.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Post-Treatment Support</h3>
                <p className={styles.valueText}>Continuous guidance for a faster and safer recovery.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className={`${styles.section} ${styles.doctorSection}`}>
          <div className={styles.container}>
            <div className={styles.doctorGrid}>
              <div className={styles.doctorImage}>
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&h=600&fit=crop&crop=top"
                  alt="Dr. Rahul Mehta - Consultant Orthopedic Surgeon"
                  className={styles.doctorPhoto}
                />
              </div>
              <div className={styles.doctorContent}>
                <span className={styles.label}>MEET YOUR DOCTOR</span>
                <h2 className={styles.doctorName}>Dr. Rahul Mehta</h2>
                <p className={styles.doctorTitle}>Consultant Orthopedic Surgeon</p>
                <p className={styles.doctorText}>
                  With over 15 years of experience in orthopedic care, Dr. Rahul Mehta specializes in joint preservation, sports injury management, arthroscopy, and joint replacement surgeries. His patient-first approach ensures the best possible outcomes for pain-free living.
                </p>
                <div className={styles.credentials}>
                  <div className={styles.credential}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>MBBS, MS (Orthopedics)</span>
                  </div>
                  <div className={styles.credential}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>15+ Years Experience</span>
                  </div>
                  <div className={styles.credential}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <span>5000+ Patients Treated</span>
                  </div>
                </div>
                <Button variant="primary" size="default" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                  Know More About Dr. Mehta
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.testimonialSection}`}>
          <div className={styles.container}>
            <span className={styles.label}>WHAT PATIENTS SAY</span>
            <h2 className={styles.sectionTitle}>Real Stories. Real Recoveries.</h2>
            <div
              className={styles.testimonialGrid}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {testimonials.map((t, i) => (
                <div key={i} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {Array.from({ length: t.rating }, (_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className={styles.quote}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className={styles.author}>
                    <span className={styles.authorName}>— {t.name}</span>
                    <span className={styles.authorTreatment}>{t.treatment}</span>
                  </div>
                </div>
              ))}
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
        </section>

        <section className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.container}>
            <span className={styles.label}>FREQUENTLY ASKED QUESTIONS</span>
            <h2 className={styles.sectionTitle}>Your Questions, Answered</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqCol}>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>Is the consultation really free?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>How do I book an appointment?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>What should I carry during my visit?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>How will I be notified about confirmation?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              </div>
              <div className={styles.faqCol}>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>Can I reschedule my appointment?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>What types of orthopedic conditions do you treat?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>Do you provide online consultation?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className={styles.faqItem}>
                  <span className={styles.faqQuestion}>What if I have insurance?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaBanner}>
          <div className={styles.container}>
            <div className={styles.ctaBannerContent}>
              <div className={styles.ctaBannerText}>
                <h3>Take the first step towards a pain-free life.</h3>
                <p>We&apos;re here to help you move better, live better.</p>
              </div>
              <div className={styles.ctaBannerActions}>
                <Button variant="primary" size="default" onClick={() => navigate('/book')}>
                  Book Appointment Now
                </Button>
                <span className={styles.ctaPhone}>or Call Us: +91 98765 43210</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
