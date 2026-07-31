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
  const { isAuthenticated, patient, logout } = useAuth()
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.logoIcon}>
              <path d="M12 2C8.5 2 6 4.5 6 7c0 2.5 1.5 4 2.5 5l.5.5v4a1 1 0 001 1h4a1 1 0 001-1v-4l.5-.5c1-1 2.5-2.5 2.5-5 0-2.5-2.5-5-6-5z" />
            </svg>
            <div className={styles.logoText}>
              <span className={styles.logoName}>Dr. Aarav Mehta</span>
              <span className={styles.logoSub}>Dental Care</span>
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
          <HashLink to="/#services" className={styles.link} onClick={() => setMenuOpen(false)}>
            Services
          </HashLink>
          <HashLink to="/#about" className={styles.link} onClick={() => setMenuOpen(false)}>
            About
          </HashLink>
          <HashLink to="/#values" className={styles.link} onClick={() => setMenuOpen(false)}>
            Why Us
          </HashLink>
          <Link to="/book" className={styles.link} onClick={() => setMenuOpen(false)}>
            Book Appointment
          </Link>
          <HashLink to="/#contact" className={styles.link} onClick={() => setMenuOpen(false)}>
            Contact
          </HashLink>
        </div>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <span className={styles.greeting}>Hi, {patient?.name?.split(' ')[0]}</span>
              <Button variant="ghost" size="small" onClick={() => { logout(); setMenuOpen(false) }}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="small" onClick={() => { navigate('/login'); setMenuOpen(false) }}>
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
