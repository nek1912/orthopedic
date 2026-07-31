import { NavLink } from 'react-router-dom'
import styles from './MoreDrawer.module.css'

interface MoreDrawerProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

const MORE_ITEMS = [
  { path: '/admin/schedule', label: 'Schedule' },
  { path: '/admin/services', label: 'Services' },
  { path: '/admin/prescriptions', label: 'Prescriptions' },
]

export default function MoreDrawer({ isOpen, onClose, onLogout }: MoreDrawerProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>More</span>
          <button type="button" aria-label="Close menu" className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav className={styles.nav}>
          {MORE_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={styles.navItem}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" className={styles.logoutBtn} onClick={onLogout}>
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  )
}
