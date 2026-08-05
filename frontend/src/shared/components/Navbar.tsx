import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import Button from './Button'
import styles from './Navbar.module.css'

function HashLink({ to, className, onClick, children }: { to: string; className?: string; onClick?: () => void; children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    onClick?.()

    if (to.startsWith('/#')) {
      const hash = to.slice(1)
      if (location.pathname === '/') {
        const el = document.getElementById(hash.slice(1))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return
        }
      }
      navigate('/', { state: { scrollTo: hash.slice(1) } })
    } else {
      navigate(to)
    }
  }

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" stroke="#0F2537" strokeWidth="2" fill="none" />
                <path d="M20 8C16.5 8 14 10.5 14 14C14 17.5 16.5 20 20 20C23.5 20 26 17.5 26 14C26 10.5 23.5 8 20 8Z" stroke="#0F2537" strokeWidth="1.5" fill="none" />
                <path d="M20 20V32" stroke="#0F2537" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 28H24" stroke="#0F2537" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>Dr. Rahul Mehta</span>
              <span className={styles.logoSub}>ORTHOPEDIC CARE</span>
            </div>
          </div>
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
        </button>

        <div className={`${styles.links} ${menuOpen ? styles.show : ''}`}>
          <HashLink to="/" className={styles.link} onClick={() => setMenuOpen(false)}>
            Home
          </HashLink>
          <HashLink to="/#about" className={styles.link} onClick={() => setMenuOpen(false)}>
            About
          </HashLink>
          <HashLink to="/#conditions" className={styles.link} onClick={() => setMenuOpen(false)}>
            Conditions We Treat
          </HashLink>
          <HashLink to="/#services" className={styles.link} onClick={() => setMenuOpen(false)}>
            Services
          </HashLink>
          <HashLink to="/#patient-guide" className={styles.link} onClick={() => setMenuOpen(false)}>
            Patient Guide
          </HashLink>
          <HashLink to="/#contact" className={styles.link} onClick={() => setMenuOpen(false)}>
            Contact
          </HashLink>
        </div>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Button variant="primary" size="small" onClick={() => { navigate('/my-appointments'); setMenuOpen(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Appointments
              </Button>
            </>
          ) : (
            <Button variant="primary" size="small" onClick={() => { navigate('/login'); setMenuOpen(false) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Book Appointment
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
