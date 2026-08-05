import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <div className={styles.brandRow}>
            <div className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                <path d="M20 8C16.5 8 14 10.5 14 14C14 17.5 16.5 20 20 20C23.5 20 26 17.5 26 14C26 10.5 23.5 8 20 8Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                <path d="M20 20V32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 28H24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.brandText}>
              <h3 className={styles.brand}>Dr. Rahul Mehta</h3>
              <span className={styles.brandSub}>ORTHOPEDIC CARE</span>
            </div>
          </div>
          <p className={styles.text}>Compassionate orthopedic care to help you move better and live a pain-free life.</p>
          <div className={styles.social}>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className={styles.socialLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
            <a href="#" aria-label="WhatsApp" className={styles.socialLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </a>
          </div>
        </div>
        <div className={styles.column}>
          <h4 className={styles.heading}>Quick Links</h4>
          <Link to="/" className={styles.link}>Home</Link>
          <Link to="/#about" className={styles.link}>About Us</Link>
          <Link to="/#conditions" className={styles.link}>Conditions We Treat</Link>
          <Link to="/#services" className={styles.link}>Services</Link>
          <Link to="/#patient-guide" className={styles.link}>Patient Guide</Link>
          <Link to="/#contact" className={styles.link}>Contact</Link>
        </div>
        <div className={styles.column}>
          <h4 className={styles.heading}>Services</h4>
          <span className={styles.link}>Knee Pain Treatment</span>
          <span className={styles.link}>Back & Neck Pain</span>
          <span className={styles.link}>Sports Injury</span>
          <span className={styles.link}>Fracture Care</span>
          <span className={styles.link}>Joint Replacement</span>
          <span className={styles.link}>Arthroscopy</span>
        </div>
        <div className={styles.column}>
          <h4 className={styles.heading}>Contact Us</h4>
          <div className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span>+91 98765 43210</span>
          </div>
          <div className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>hello@drrahulmehtaortho.com</span>
          </div>
          <div className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>123, Health Avenue, Ahmedabad, Gujarat 380015</span>
          </div>
          <div className={styles.contactItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>Mon - Sat: 10:00 AM - 7:00 PM<br />Sunday: Closed</span>
          </div>
        </div>
        <div className={styles.column}>
          <h4 className={styles.heading}>Clinic Location</h4>
          <div className={styles.mapPlaceholder}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className={styles.mapText}>View on Google Maps</span>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copy}>&copy; {new Date().getFullYear()} Dr. Rahul Mehta Orthopedic Care. All rights reserved.</p>
        <div className={styles.legal}>
          <Link to="/privacy" className={styles.legalLink}>Privacy Policy</Link>
          <span className={styles.divider}>|</span>
          <Link to="/terms" className={styles.legalLink}>Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  )
}
