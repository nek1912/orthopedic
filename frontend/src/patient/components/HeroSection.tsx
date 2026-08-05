import { useNavigate } from 'react-router-dom'
import Button from '@shared/components/Button'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.label}>ORTHOPEDIC CARE YOU CAN TRUST</span>
        <h1 className={styles.heading}>
          Stronger Bones.<br />
          Better Movement.<br />
          Better Life.
        </h1>
        <p className={styles.subtext}>
          Personalized care for pain relief, mobility, and long-term bone & joint health. We&apos;re here to help you move better, every single day.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <span className={styles.featureTitle}>Expert Orthopedic Care</span>
              <span className={styles.featureText}>Evidence-based treatment with compassionate care</span>
            </div>
          </div>
          <div className={styles.feature}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div>
              <span className={styles.featureTitle}>Advanced Technology</span>
              <span className={styles.featureText}>Modern diagnostics for accurate treatment</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" size="large" onClick={() => navigate('/book')}>
            Book Appointment
          </Button>
          <Button variant="secondary" size="large" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            Call Us
          </Button>
        </div>

        <div className={styles.trustBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Secure booking • No hidden charges • 100% Free Consultation</span>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <div className={styles.statsStack}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>15+</span>
            <span className={styles.statLabel}>Years Experience</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>5000+</span>
            <span className={styles.statLabel}>Patients Treated</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>98%</span>
            <span className={styles.statLabel}>Patient Satisfaction</span>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=700&fit=crop&crop=center"
            alt="Active person running - representing mobility and recovery"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  )
}
