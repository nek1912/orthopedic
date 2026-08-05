import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@admin/context/AdminAuthContext'
import { useState, type JSX } from 'react'
import MoreDrawer from './MoreDrawer'
import GlobalSearch from './GlobalSearch'
import NotificationCenter from './NotificationCenter'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { path: '/admin/today', label: 'Today\'s Queue', icon: 'queue' },
  { path: '/admin/requests', label: 'Appointment Requests', icon: 'requests' },
  { path: '/admin/patients', label: 'Patients', icon: 'patients' },
  { path: '/admin/schedule', label: 'Schedule', icon: 'schedule' },
  { path: '/admin/settings', label: 'Clinic Settings', icon: 'settings' },
]

const MOBILE_ITEMS = [
  { path: '/admin/today', label: 'Queue', icon: 'queue' },
  { path: '/admin/requests', label: 'Requests', icon: 'requests' },
  { path: '/admin/patients', label: 'Patients', icon: 'patients' },
  { path: '/admin/schedule', label: 'Schedule', icon: 'schedule' },
]

function getIcon(type: string) {
  const icons: Record<string, JSX.Element> = {
    queue: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
    requests: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    patients: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    schedule: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    services: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    prescriptions: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  }
  return icons[type] || null
}

export default function Sidebar() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Admin Panel</div>
        <div className={styles.searchWrap}>
          <GlobalSearch />
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.notifWrap}>
          <NotificationCenter />
        </div>
        <div className={styles.footer}>
          <div className={styles.adminInfo}>
            <div className={styles.adminName}>Dr. Aarav Mehta</div>
            <div className={styles.adminRole}>Administrator</div>
            <div className={styles.clinicStatus}>
              <span className={styles.statusDot} />
              Clinic Open
            </div>
          </div>
          <button className={styles.logoutBtn} type="button" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav}>
        {MOBILE_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.mobileNavItem} ${isActive ? styles.mobileActive : ''}`
            }
          >
            {getIcon(item.icon)}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          className={styles.mobileNavItem}
          onClick={() => setMoreOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
          <span>More</span>
        </button>
      </nav>

      {/* More Drawer */}
      <MoreDrawer
        isOpen={moreOpen}
        onClose={() => setMoreOpen(false)}
        onLogout={handleLogout}
      />
    </>
  )
}
