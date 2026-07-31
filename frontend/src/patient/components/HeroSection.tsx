import { useNavigate } from 'react-router-dom'
import Button from '@shared/components/Button'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.label}>Healthy smile, confident you.</span>
        <h1 className={styles.heading}>
          Gentle Dental Care<br />
          You Can <span className={styles.highlight}>Trust</span>
        </h1>
        <p className={styles.subtext}>
          Advanced treatment. Personal care.<br />
          A comfortable experience for the whole family.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="default" onClick={() => navigate('/book')}>
            Book Appointment
          </Button>
          <Button variant="secondary" size="default" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
            Our Services
          </Button>
        </div>
        <div className={styles.trustBadges}>
          <div className={styles.badge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <span className={styles.badgeTitle}>Safe & Hygienic</span>
              <span className={styles.badgeText}>Sterilized Equipment</span>
            </div>
          </div>
          <div className={styles.badge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <div>
              <span className={styles.badgeTitle}>Patient First</span>
              <span className={styles.badgeText}>Care with Compassion</span>
            </div>
          </div>
          <div className={styles.badge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div>
              <span className={styles.badgeTitle}>10+ Years</span>
              <span className={styles.badgeText}>Clinical Experience</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.imageWrapper}>
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=500&fit=crop&crop=center"
          alt="Modern dental clinic with dental chair and equipment"
          className={styles.heroImage}
        />
        <div className={styles.patientCounter}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <div>
            <span className={styles.counterLabel}>Happy Patients</span>
            <span className={styles.counterValue}>2,500+</span>
          </div>
        </div>
      </div>
    </section>
  )
}
