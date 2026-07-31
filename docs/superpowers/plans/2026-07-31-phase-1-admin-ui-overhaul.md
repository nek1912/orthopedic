# Phase 1: Admin UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin dashboard UI to match the reference design — dark teal sidebar, workflow-ordered navigation, inbox-style requests, color-coded queue, and new pages for Services and Prescriptions.

**Architecture:** Reorganize sidebar by daily workflow (not CRUD entities). Rewrite all admin pages to match reference design. Add Services and Prescriptions pages. Update design tokens for dark teal palette.

**Tech Stack:** React, TypeScript, CSS Modules, Vite

## Global Constraints

- Dark teal sidebar (`#1a2e2e` or similar from reference)
- White content area, minimal cards
- No dark mode toggle
- Mobile: 5-item bottom nav + "More" drawer
- Touch targets minimum 44x44px
- Use existing design token system (`tokens.css`)
- Follow existing CSS module patterns
- No comments in code unless asked

---

## File Structure

### Modified Files
| File | Purpose |
|------|---------|
| `frontend/src/styles/tokens.css` | Add dark teal palette tokens |
| `frontend/src/admin/components/Sidebar.tsx` | New nav order, footer with doctor info, mobile More drawer |
| `frontend/src/admin/components/Sidebar.module.css` | Dark teal styling, mobile drawer |
| `frontend/src/admin/pages/AdminLayout.tsx` | Mobile bottom nav integration |
| `frontend/src/admin/pages/AdminLayout.module.css` | Mobile padding, bottom nav spacing |
| `frontend/src/admin/pages/AdminDashboard.tsx` | New routes (services, prescriptions) |
| `frontend/src/admin/pages/AdminHomePage.tsx` | Greeting, stat cards, today's queue |
| `frontend/src/admin/pages/AdminHomePage.module.css` | Queue cards, waiting room panel |
| `frontend/src/admin/pages/AdminRequestsPage.tsx` | Inbox-style with inline slot assignment |
| `frontend/src/admin/pages/AdminRequestsPage.module.css` | Two-panel layout, patient details |
| `frontend/src/admin/pages/AdminTodayPage.tsx` | Color-coded queue cards with one-click actions |
| `frontend/src/admin/pages/AdminTodayPage.module.css` | Color-coded cards, action buttons |
| `frontend/src/admin/pages/AdminPatientsPage.tsx` | Patient cards + timeline |
| `frontend/src/admin/pages/AdminPatientsPage.module.css` | Cards layout, timeline |
| `frontend/src/admin/pages/AdminSchedulePage.tsx` | Utilization info |
| `frontend/src/admin/pages/AdminSchedulePage.module.css` | Utilization stats |
| `frontend/src/admin/pages/AdminSettingsPage.tsx` | Remove dark mode, match reference |
| `frontend/src/admin/pages/AdminSettingsPage.module.css` | Clean card layout |

### New Files
| File | Purpose |
|------|---------|
| `frontend/src/admin/pages/AdminServicesPage.tsx` | Services CRUD with cards |
| `frontend/src/admin/pages/AdminServicesPage.module.css` | Service cards layout |
| `frontend/src/admin/pages/AdminPrescriptionsPage.tsx` | Templates, recent, drafts |
| `frontend/src/admin/pages/AdminPrescriptionsPage.module.css` | Prescription page layout |
| `frontend/src/admin/components/ServiceCard.tsx` | Individual service card |
| `frontend/src/admin/components/ServiceCard.module.css` | Service card styling |
| `frontend/src/admin/components/PrescriptionTemplateCard.tsx` | Template card |
| `frontend/src/admin/components/PrescriptionTemplateCard.module.css` | Template card styling |
| `frontend/src/admin/components/ActivityLog.tsx` | Audit trail component |
| `frontend/src/admin/components/ActivityLog.module.css` | Activity log styling |
| `frontend/src/admin/components/NotificationCenter.tsx` | Notification bell + dropdown |
| `frontend/src/admin/components/NotificationCenter.module.css` | Notification styling |
| `frontend/src/admin/components/GlobalSearch.tsx` | Search bar with command support |
| `frontend/src/admin/components/GlobalSearch.module.css` | Search styling |
| `frontend/src/admin/components/MoreDrawer.tsx` | Mobile More drawer |
| `frontend/src/admin/components/MoreDrawer.module.css` | Drawer styling |

---

### Task 1: Update Design Tokens

**Files:**
- Modify: `frontend/src/styles/tokens.css`

**Interfaces:**
- Consumes: None
- Produces: CSS custom properties for dark teal palette

- [ ] **Step 1: Add dark teal tokens to tokens.css**

```css
/* Add after existing color tokens */
--color-sidebar: #1a2e2e;
--color-sidebar-hover: #243d3d;
--color-sidebar-active: #2d4a4a;
--color-sidebar-text: rgba(255, 255, 255, 0.85);
--color-sidebar-text-muted: rgba(255, 255, 255, 0.55);

--color-queue-accepted: #1a2e2e;
--color-queue-arrived: #2E7D6B;
--color-queue-waiting: #C8892B;
--color-queue-completed: #6B7280;
--color-queue-blocked: #B54848;
--color-queue-available: #E5E7EB;
```

- [ ] **Step 2: Verify tokens compile**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles/tokens.css
git commit -m "feat: add dark teal palette and queue color tokens"
```

---

### Task 2: Rewrite Sidebar Component

**Files:**
- Modify: `frontend/src/admin/components/Sidebar.tsx`
- Modify: `frontend/src/admin/components/Sidebar.module.css`

**Interfaces:**
- Consumes: `useAdminAuth()` from `AdminAuthContext`
- Produces: `<Sidebar />` component with new nav items, footer, mobile More drawer

- [ ] **Step 1: Rewrite Sidebar.tsx with new navigation order**

```tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@admin/context/AdminAuthContext'
import { useState } from 'react'
import MoreDrawer from './MoreDrawer'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { path: '/admin/today', label: 'Today\'s Queue', icon: 'queue' },
  { path: '/admin/requests', label: 'Appointment Requests', icon: 'requests' },
  { path: '/admin/patients', label: 'Patients', icon: 'patients' },
  { path: '/admin/schedule', label: 'Schedule', icon: 'schedule' },
  { path: '/admin/services', label: 'Services', icon: 'services' },
  { path: '/admin/prescriptions', label: 'Prescriptions', icon: 'prescriptions' },
  { path: '/admin/settings', label: 'Clinic Settings', icon: 'settings' },
]

const MOBILE_ITEMS = [
  { path: '/admin/today', label: 'Queue', icon: 'queue' },
  { path: '/admin/requests', label: 'Requests', icon: 'requests' },
  { path: '/admin/patients', label: 'Patients', icon: 'patients' },
  { path: '/admin/settings', label: 'Settings', icon: 'settings' },
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
        <div className={styles.footer}>
          <div className={styles.adminInfo}>
            <div className={styles.adminName}>Dr. Rahul Patel</div>
            <div className={styles.adminRole}>Administrator</div>
            <div className={styles.clinicStatus}>
              <span className={styles.statusDot} />
              Clinic Open
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
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
```

- [ ] **Step 2: Rewrite Sidebar.module.css with dark teal styling**

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background-color: var(--color-sidebar);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
}

.brand {
  padding: var(--space-5) var(--space-4);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: #FFFFFF;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav {
  flex: 1;
  padding: var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.navItem {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-sidebar-text);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  transition: background-color var(--duration-fast);
}

.navItem:hover {
  background-color: var(--color-sidebar-hover);
}

.active {
  background-color: var(--color-sidebar-active);
  color: #FFFFFF;
}

.footer {
  padding: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.adminInfo {
  margin-bottom: var(--space-3);
}

.adminName {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: #FFFFFF;
}

.adminRole {
  font-size: var(--text-xs);
  color: var(--color-sidebar-text-muted);
}

.clinicStatus {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-sidebar-text-muted);
  margin-top: var(--space-2);
}

.statusDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
}

.logoutBtn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-sidebar-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background-color var(--duration-fast);
}

.logoutBtn:hover {
  background-color: var(--color-sidebar-hover);
}

.mobileNav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-sidebar);
  padding: var(--space-2) var(--space-3);
  justify-content: space-around;
  z-index: 100;
}

.mobileNavItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-sidebar-text-muted);
  font-size: 10px;
  text-decoration: none;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
}

.mobileActive {
  color: #FFFFFF;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .mobileNav {
    display: flex;
  }
}
```

- [ ] **Step 3: Verify sidebar renders**

Run: `cd frontend && npm run dev`
Expected: Sidebar shows with dark teal background, new nav order, footer with doctor info

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/components/Sidebar.tsx frontend/src/admin/components/Sidebar.module.css
git commit -m "feat: rewrite sidebar with workflow-ordered nav and dark teal styling"
```

---

### Task 3: Create MoreDrawer Component

**Files:**
- Create: `frontend/src/admin/components/MoreDrawer.tsx`
- Create: `frontend/src/admin/components/MoreDrawer.module.css`

**Interfaces:**
- Consumes: None
- Produces: `<MoreDrawer />` component for mobile navigation

- [ ] **Step 1: Create MoreDrawer.tsx**

```tsx
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
          <button className={styles.closeBtn} onClick={onClose}>
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
          <button className={styles.logoutBtn} onClick={onLogout}>
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create MoreDrawer.module.css**

```css
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.drawer {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--space-4);
  animation: slideUp var(--duration-normal) ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

.closeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-lg);
}

.closeBtn:hover {
  background-color: var(--color-surface-muted);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.navItem {
  display: block;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  min-height: 44px;
  display: flex;
  align-items: center;
}

.navItem:hover {
  background-color: var(--color-surface-muted);
}

.logoutBtn {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-danger);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-align: left;
  cursor: pointer;
  min-height: 44px;
}

.logoutBtn:hover {
  background-color: var(--color-surface-muted);
}
```

- [ ] **Step 3: Verify MoreDrawer opens on mobile**

Run: `cd frontend && npm run dev`
Expected: Clicking "More" on mobile opens drawer with Schedule, Services, Prescriptions, Sign Out

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/components/MoreDrawer.tsx frontend/src/admin/components/MoreDrawer.module.css
git commit -m "feat: add MoreDrawer for mobile navigation"
```

---

### Task 4: Update AdminDashboard Routes

**Files:**
- Modify: `frontend/src/admin/pages/AdminDashboard.tsx`

**Interfaces:**
- Consumes: All admin page components
- Produces: Updated route definitions

- [ ] **Step 1: Add new routes for Services and Prescriptions**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminHomePage from './AdminHomePage'
import AdminRequestsPage from './AdminRequestsPage'
import AdminTodayPage from './AdminTodayPage'
import AdminPatientsPage from './AdminPatientsPage'
import AdminSchedulePage from './AdminSchedulePage'
import AdminSettingsPage from './AdminSettingsPage'
import AdminServicesPage from './AdminServicesPage'
import AdminPrescriptionsPage from './AdminPrescriptionsPage'

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/today" replace />} />
        <Route path="today" element={<AdminTodayPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="schedule" element={<AdminSchedulePage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="prescriptions" element={<AdminPrescriptionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/today" replace />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 2: Verify routes work**

Run: `cd frontend && npm run dev`
Expected: `/admin/` redirects to `/admin/today`, new routes accessible

- [ ] **Step 3: Commit**

```bash
git add frontend/src/admin/pages/AdminDashboard.tsx
git commit -m "feat: add services and prescriptions routes, redirect index to today"
```

---

### Task 5: Rewrite AdminHomePage

**Files:**
- Modify: `frontend/src/admin/pages/AdminHomePage.tsx`
- Modify: `frontend/src/admin/pages/AdminHomePage.module.css`

**Interfaces:**
- Consumes: `GET /api/v1/admin/stats` ( AppointmentStats)
- Produces: Dashboard with greeting, stat cards, today's queue

- [ ] **Step 1: Rewrite AdminHomePage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import StatCard from '@admin/components/StatCard'
import AppointmentRow from '@admin/components/AppointmentRow'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminHomePage.module.css'

interface AppointmentStats {
  today_count: number
  pending_count: number
  total_patients: number
  completion_rate: number
  next_available_day: string
  today_appointments: Array<{
    id: string
    patient_name: string
    service_name: string
    time_slot_start: string
    status: string
  }>
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<AppointmentStats>('/api/v1/admin/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <div>
          <h1 className={styles.greetingTitle}>{getGreeting()} Dr. Patel</h1>
          <p className={styles.greetingDate}>{formatDate()}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Today's Queue" value={stats?.today_count ?? 0} icon="calendar" />
        <StatCard label="Pending Requests" value={stats?.pending_count ?? 0} icon="clock" variant="accent" />
        <StatCard label="Completion Rate" value={`${stats?.completion_rate ?? 0}%`} icon="chart" variant="success" />
        <StatCard label="Next Available Day" value={stats?.next_available_day ?? '-'} icon="calendar" variant="default" />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Schedule</h2>
          <span className={styles.badge}>{stats?.today_appointments.length ?? 0} appointments</span>
        </div>
        {stats?.today_appointments.length ? (
          <div className={styles.list}>
            {stats.today_appointments.map((appt) => (
              <AppointmentRow key={appt.id} appointment={appt} />
            ))}
          </div>
        ) : (
          <EmptyState type="appointments" />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite AdminHomePage.module.css**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.greeting {
  background: linear-gradient(135deg, var(--color-primary), #2A5050);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  color: #FFFFFF;
}

.greetingTitle {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  margin: 0;
}

.greetingDate {
  font-size: var(--text-sm);
  opacity: 0.8;
  margin: var(--space-1) 0 0;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sectionTitle {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  margin: 0;
}

.badge {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-surface-muted);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton {
  height: 200px;
  background: var(--color-surface-muted);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (min-width: 640px) {
  .statsGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

- [ ] **Step 3: Verify dashboard renders**

Run: `cd frontend && npm run dev`
Expected: Greeting banner, 4 stat cards, today's schedule list

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/pages/AdminHomePage.tsx frontend/src/admin/pages/AdminHomePage.module.css
git commit -m "feat: rewrite admin home with greeting, stat cards, and schedule"
```

---

### Task 6: Rewrite AdminTodayPage with Color-Coded Queue

**Files:**
- Modify: `frontend/src/admin/pages/AdminTodayPage.tsx`
- Modify: `frontend/src/admin/pages/AdminTodayPage.module.css`

**Interfaces:**
- Consumes: `GET /api/v1/admin/appointments?status=accepted`
- Produces: Color-coded queue cards with one-click actions

- [ ] **Step 1: Rewrite AdminTodayPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import PrescriptionForm from '@admin/components/PrescriptionForm'
import Modal from '@shared/components/Modal'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminTodayPage.module.css'

interface Appointment {
  id: string
  patient_name: string
  service_name: string
  time_slot_start: string
  time_slot_end: string
  status: 'accepted' | 'arrived' | 'started' | 'completed'
  arrived_at: string | null
}

const STATUS_CONFIG = {
  accepted: { label: 'Accepted', color: 'teal', actions: ['arrived', 'complete', 'cancel'] },
  arrived: { label: 'Arrived', color: 'green', actions: ['started', 'complete', 'cancel'] },
  started: { label: 'In Progress', color: 'yellow', actions: ['complete', 'cancel'] },
  completed: { label: 'Completed', color: 'gray', actions: ['view'] },
}

export default function AdminTodayPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [prescriptionModal, setPrescriptionModal] = useState<string | null>(null)

  const fetchAppointments = () => {
    apiRequest<{ appointments: Appointment[] }>('/api/v1/admin/appointments?status=accepted')
      .then((data) => setAppointments(data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'arrived') {
        await apiRequest(`/api/v1/admin/appointments/${id}/arrive`, { method: 'PATCH' })
      } else if (action === 'started') {
        await apiRequest(`/api/v1/admin/appointments/${id}/start`, { method: 'PATCH' })
      } else if (action === 'complete') {
        setPrescriptionModal(id)
        return
      } else if (action === 'cancel') {
        await apiRequest(`/api/v1/admin/appointments/${id}/cancel`, { method: 'PATCH' })
      }
      fetchAppointments()
    } catch {
      // Error handled by toast
    }
  }

  const handlePrescriptionSubmit = async (data: unknown) => {
    if (!prescriptionModal) return
    await apiRequest('/api/v1/admin/prescriptions', { method: 'POST', body: { appointment_id: prescriptionModal, ...data } })
    await apiRequest(`/api/v1/admin/appointments/${prescriptionModal}/complete`, { method: 'PATCH' })
    setPrescriptionModal(null)
    fetchAppointments()
  }

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Today's Queue</h1>
      {appointments.length ? (
        <div className={styles.queue}>
          {appointments.map((appt) => {
            const config = STATUS_CONFIG[appt.status]
            return (
              <div key={appt.id} className={`${styles.card} ${styles[config.color]}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>{appt.patient_name.charAt(0)}</div>
                  <div className={styles.cardInfo}>
                    <div className={styles.patientName}>{appt.patient_name}</div>
                    <div className={styles.serviceName}>{appt.service_name}</div>
                  </div>
                  <span className={styles.timeSlot}>{appt.time_slot_start}</span>
                </div>
                <div className={styles.cardActions}>
                  {config.actions.map((action) => (
                    <button
                      key={action}
                      className={`${styles.actionBtn} ${styles[`${action}Btn`]}`}
                      onClick={() => handleAction(appt.id, action)}
                    >
                      {action === 'arrived' && 'Arrived'}
                      {action === 'started' && 'Start'}
                      {action === 'complete' && 'Complete'}
                      {action === 'cancel' && 'Cancel'}
                      {action === 'view' && 'View Prescription'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState type="appointments" />
      )}

      {prescriptionModal && (
        <Modal onClose={() => setPrescriptionModal(null)}>
          <PrescriptionForm onSubmit={handlePrescriptionSubmit} />
        </Modal>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create AdminTodayPage.module.css**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  margin: 0;
}

.queue {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  border-left: 4px solid transparent;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.teal { border-left-color: var(--color-queue-accepted); }
.green { border-left-color: var(--color-queue-arrived); }
.yellow { border-left-color: var(--color-queue-waiting); }
.gray { border-left-color: var(--color-queue-completed); }

.cardHeader {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
}

.cardInfo {
  flex: 1;
}

.patientName {
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

.serviceName {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.timeSlot {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.cardActions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.actionBtn {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  min-height: 32px;
  min-width: 44px;
}

.actionBtn:hover {
  background-color: var(--color-surface-muted);
}

.arrivedBtn { border-color: var(--color-queue-arrived); color: var(--color-queue-arrived); }
.startedBtn { border-color: var(--color-queue-waiting); color: var(--color-queue-waiting); }
.completeBtn { border-color: var(--color-primary); color: var(--color-primary); }
.cancelBtn { border-color: var(--color-danger); color: var(--color-danger); }

.skeleton {
  height: 300px;
  background: var(--color-surface-muted);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

- [ ] **Step 3: Verify queue renders with color-coded cards**

Run: `cd frontend && npm run dev`
Expected: Queue cards with teal/green/yellow/gray borders and action buttons

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/pages/AdminTodayPage.tsx frontend/src/admin/pages/AdminTodayPage.module.css
git commit -m "feat: rewrite today page with color-coded queue cards"
```

---

### Task 7: Rewrite AdminRequestsPage with Inbox Layout

**Files:**
- Modify: `frontend/src/admin/pages/AdminRequestsPage.tsx`
- Modify: `frontend/src/admin/pages/AdminRequestsPage.module.css`

**Interfaces:**
- Consumes: `GET /api/v1/admin/appointments?status=pending`
- Produces: Gmail-style inbox with inline slot assignment

- [ ] **Step 1: Rewrite AdminRequestsPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import TimeSlotPicker from '@admin/components/TimeSlotPicker'
import Modal from '@shared/components/Modal'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminRequestsPage.module.css'

interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  service_name: string
  requested_date: string
  notes: string
  created_at: string
}

export default function AdminRequestsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchAppointments = () => {
    apiRequest<{ appointments: Appointment[] }>('/api/v1/admin/appointments?status=pending')
      .then((data) => setAppointments(data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleAccept = async (startTime: string, endTime: string) => {
    if (!selected) return
    try {
      await apiRequest(`/api/v1/admin/appointments/${selected.id}/accept`, {
        method: 'PATCH',
        body: { date: selected.requested_date, start_time: startTime, end_time: endTime },
      })
      setSelected(null)
      fetchAppointments()
    } catch {
      // Error handled by toast
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    try {
      await apiRequest(`/api/v1/admin/appointments/${rejectModal}/reject`, {
        method: 'PATCH',
        body: { reason: rejectReason },
      })
      setRejectModal(null)
      setRejectReason('')
      fetchAppointments()
    } catch {
      // Error handled by toast
    }
  }

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Appointment Requests</h1>
      {appointments.length ? (
        <div className={styles.inbox}>
          <div className={styles.list}>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className={`${styles.listItem} ${selected?.id === appt.id ? styles.selected : ''}`}
                onClick={() => setSelected(appt)}
              >
                <div className={styles.avatar}>{appt.patient_name.charAt(0)}</div>
                <div className={styles.listItemInfo}>
                  <div className={styles.patientName}>{appt.patient_name}</div>
                  <div className={styles.serviceName}>{appt.service_name}</div>
                  <div className={styles.date}>{appt.requested_date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.detail}>
            {selected ? (
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.avatarLarge}>{selected.patient_name.charAt(0)}</div>
                  <div>
                    <div className={styles.patientNameLarge}>{selected.patient_name}</div>
                    <div className={styles.patientEmail}>{selected.patient_email}</div>
                    <div className={styles.patientPhone}>{selected.patient_phone}</div>
                  </div>
                </div>
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Service</div>
                  <div className={styles.detailValue}>{selected.service_name}</div>
                </div>
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Preferred Date</div>
                  <div className={styles.detailValue}>{selected.requested_date}</div>
                </div>
                {selected.notes && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Notes</div>
                    <div className={styles.detailValue}>{selected.notes}</div>
                  </div>
                )}
                <div className={styles.slotSection}>
                  <div className={styles.detailLabel}>Assign Time Slot</div>
                  <TimeSlotPicker
                    date={selected.requested_date}
                    onSelect={handleAccept}
                  />
                </div>
                <div className={styles.actions}>
                  <button className={styles.rejectBtn} onClick={() => setRejectModal(selected.id)}>
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyDetail}>Select a request to view details</div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState type="appointments" />
      )}

      {rejectModal && (
        <Modal onClose={() => setRejectModal(null)}>
          <div className={styles.rejectModal}>
            <h3>Reject Appointment</h3>
            <textarea
              className={styles.rejectTextarea}
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className={styles.rejectActions}>
              <button className={styles.cancelBtn} onClick={() => setRejectModal(null)}>Cancel</button>
              <button className={styles.confirmRejectBtn} onClick={handleReject}>Reject</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create AdminRequestsPage.module.css**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  margin: 0;
}

.inbox {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-4);
  min-height: 500px;
}

.list {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  overflow-y: auto;
}

.listItem {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  min-height: 44px;
}

.listItem:hover {
  background-color: var(--color-surface-muted);
}

.selected {
  background-color: var(--color-surface-muted);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-bold);
  font-size: var(--text-xs);
  flex-shrink: 0;
}

.listItemInfo {
  flex: 1;
  min-width: 0;
}

.patientName {
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.serviceName {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.date {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.detail {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-5);
}

.detailHeader {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.avatarLarge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-bold);
}

.patientNameLarge {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

.patientEmail, .patientPhone {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.detailSection {
  margin-bottom: var(--space-4);
}

.detailLabel {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-1);
}

.detailValue {
  font-size: var(--text-sm);
}

.slotSection {
  margin-bottom: var(--space-4);
}

.actions {
  display: flex;
  gap: var(--space-3);
}

.rejectBtn {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-danger);
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 44px;
}

.rejectBtn:hover {
  background-color: var(--color-danger);
  color: #FFFFFF;
}

.emptyDetail {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.rejectModal {
  padding: var(--space-5);
}

.rejectModal h3 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-heading);
}

.rejectTextarea {
  width: 100%;
  min-height: 100px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  resize: vertical;
  margin-bottom: var(--space-4);
}

.rejectActions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.cancelBtn {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 44px;
}

.confirmRejectBtn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  background-color: var(--color-danger);
  color: #FFFFFF;
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 44px;
}

.skeleton {
  height: 400px;
  background: var(--color-surface-muted);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .inbox {
    grid-template-columns: 1fr;
  }
  .list {
    max-height: 300px;
  }
}
```

- [ ] **Step 3: Verify inbox layout renders**

Run: `cd frontend && npm run dev`
Expected: Two-panel inbox with patient list on left, details on right

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/pages/AdminRequestsPage.tsx frontend/src/admin/pages/AdminRequestsPage.module.css
git commit -m "feat: rewrite requests page with inbox layout and inline slot assignment"
```

---

### Task 8: Create AdminServicesPage

**Files:**
- Create: `frontend/src/admin/pages/AdminServicesPage.tsx`
- Create: `frontend/src/admin/pages/AdminServicesPage.module.css`

**Interfaces:**
- Consumes: `GET /api/v1/admin/services`, `POST /api/v1/admin/services`, `PATCH /api/v1/admin/services/:id`
- Produces: Services CRUD with cards

- [ ] **Step 1: Create AdminServicesPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import Modal from '@shared/components/Modal'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminServicesPage.module.css'

interface Service {
  id: string
  name: string
  description: string
  duration_minutes: number
  default_fee: number
  preparation_notes: string
  requires_followup: boolean
  is_active: boolean
}

interface ServiceForm {
  name: string
  description: string
  duration_minutes: number
  default_fee: number
  preparation_notes: string
  requires_followup: boolean
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  duration_minutes: 30,
  default_fee: 0,
  preparation_notes: '',
  requires_followup: false,
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)

  const fetchServices = () => {
    apiRequest<Service[]>('/api/v1/admin/services')
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchServices() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditing(service)
    setForm({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      default_fee: service.default_fee,
      preparation_notes: service.preparation_notes || '',
      requires_followup: service.requires_followup,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await apiRequest(`/api/v1/admin/services/${editing.id}`, { method: 'PATCH', body: form })
      } else {
        await apiRequest('/api/v1/admin/services', { method: 'POST', body: form })
      }
      setModalOpen(false)
      fetchServices()
    } catch {
      // Error handled by toast
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      await apiRequest(`/api/v1/admin/services/${service.id}/active`, {
        method: 'PATCH',
        body: { active: !service.is_active },
      })
      fetchServices()
    } catch {
      // Error handled by toast
    }
  }

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Services</h1>
        <button className={styles.addBtn} onClick={openCreate}>Add Service</button>
      </div>
      {services.length ? (
        <div className={styles.grid}>
          {services.map((service) => (
            <div key={service.id} className={`${styles.card} ${!service.is_active ? styles.inactive : ''}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{service.name}</h3>
                <span className={`${styles.badge} ${service.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={styles.cardMeta}>
                <span>{service.duration_minutes} mins</span>
                {service.default_fee > 0 && <span>₹{service.default_fee}</span>}
              </div>
              {service.description && <p className={styles.cardDesc}>{service.description}</p>}
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => openEdit(service)}>Edit</button>
                <button className={styles.toggleBtn} onClick={() => handleToggleActive(service)}>
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState type="services" />
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className={styles.modal}>
            <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
            <div className={styles.field}>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Duration (mins)</label>
                <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
              </div>
              <div className={styles.field}>
                <label>Default Fee (₹)</label>
                <input type="number" value={form.default_fee} onChange={(e) => setForm({ ...form, default_fee: Number(e.target.value) })} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Preparation Notes</label>
              <textarea value={form.preparation_notes} onChange={(e) => setForm({ ...form, preparation_notes: e.target.value })} />
            </div>
            <div className={styles.checkbox}>
              <input type="checkbox" checked={form.requires_followup} onChange={(e) => setForm({ ...form, requires_followup: e.target.checked })} />
              <label>Requires Follow-up</label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSubmit}>{editing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create AdminServicesPage.module.css**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  margin: 0;
}

.addBtn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  background-color: var(--color-primary);
  color: #FFFFFF;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  min-height: 44px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.inactive {
  opacity: 0.6;
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.cardTitle {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  margin: 0;
}

.badge {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.activeBadge {
  background-color: var(--color-success);
  color: #FFFFFF;
}

.inactiveBadge {
  background-color: var(--color-text-secondary);
  color: #FFFFFF;
}

.cardMeta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.cardDesc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.cardActions {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
}

.editBtn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  font-size: var(--text-xs);
  cursor: pointer;
  min-height: 36px;
}

.toggleBtn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-danger);
  font-size: var(--text-xs);
  cursor: pointer;
  min-height: 36px;
}

.modal {
  padding: var(--space-5);
}

.modal h3 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-heading);
}

.field {
  margin-bottom: var(--space-4);
}

.field label {
  display: block;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-1);
}

.field input, .field textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  min-height: 44px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.checkbox input {
  width: 18px;
  height: 18px;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.cancelBtn {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 44px;
}

.saveBtn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  background-color: var(--color-primary);
  color: #FFFFFF;
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 44px;
}

.skeleton {
  height: 300px;
  background: var(--color-surface-muted);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

- [ ] **Step 3: Verify services page renders**

Run: `cd frontend && npm run dev`
Expected: Services cards with name, duration, fee, active badge, edit/deactivate buttons

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/pages/AdminServicesPage.tsx frontend/src/admin/pages/AdminServicesPage.module.css
git commit -m "feat: add services page with card layout and CRUD"
```

---

### Task 9: Create AdminPrescriptionsPage

**Files:**
- Create: `frontend/src/admin/pages/AdminPrescriptionsPage.tsx`
- Create: `frontend/src/admin/pages/AdminPrescriptionsPage.module.css`

**Interfaces:**
- Consumes: `GET /api/v1/admin/prescriptions`, `GET /api/v1/admin/prescriptions/templates`
- Produces: Prescriptions page with templates, recent, drafts

- [ ] **Step 1: Create AdminPrescriptionsPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { apiRequest } from '@shared/api/client'
import EmptyState from '@shared/components/EmptyState'
import styles from './AdminPrescriptionsPage.module.css'

interface Prescription {
  id: string
  appointment_id: string
  patient_name: string
  diagnosis: string
  medicines: Array<{ name: string; dosage: string; frequency: string; duration: string }>
  notes: string
  created_at: string
}

interface Template {
  id: string
  name: string
  diagnosis: string
  medicines: Array<{ name: string; dosage: string; frequency: string; duration: string }>
  notes: string
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent')

  useEffect(() => {
    Promise.all([
      apiRequest<Prescription[]>('/api/v1/admin/prescriptions'),
      apiRequest<Template[]>('/api/v1/admin/prescriptions/templates'),
    ])
      .then(([p, t]) => { setPrescriptions(p); setTemplates(t) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} /></div>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Prescriptions</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>

      {activeTab === 'recent' && (
        prescriptions.length ? (
          <div className={styles.list}>
            {prescriptions.map((rx) => (
              <div key={rx.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.patientName}>{rx.patient_name}</div>
                  <div className={styles.date}>{new Date(rx.created_at).toLocaleDateString()}</div>
                </div>
                <div className={styles.diagnosis}>{rx.diagnosis}</div>
                {rx.medicines.length > 0 && (
                  <div className={styles.medicines}>
                    {rx.medicines.map((m, i) => (
                      <span key={i} className={styles.medicine}>{m.name}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState type="prescriptions" />
        )
      )}

      {activeTab === 'templates' && (
        templates.length ? (
          <div className={styles.list}>
            {templates.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.patientName}>{t.name}</div>
                </div>
                {t.diagnosis && <div className={styles.diagnosis}>{t.diagnosis}</div>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState type="prescriptions" />
        )
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create AdminPrescriptionsPage.module.css**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  margin: 0;
}

.tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.tab {
  padding: var(--space-3) var(--space-4);
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  min-height: 44px;
}

.activeTab {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-4);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.patientName {
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

.date {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.diagnosis {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.medicines {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.medicine {
  font-size: var(--text-xs);
  background-color: var(--color-surface-muted);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.skeleton {
  height: 300px;
  background: var(--color-surface-muted);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

- [ ] **Step 3: Verify prescriptions page renders**

Run: `cd frontend && npm run dev`
Expected: Prescriptions page with Recent/Templates tabs

- [ ] **Step 4: Commit**

```bash
git add frontend/src/admin/pages/AdminPrescriptionsPage.tsx frontend/src/admin/pages/AdminPrescriptionsPage.module.css
git commit -m "feat: add prescriptions page with recent and templates tabs"
```

---

### Task 10: Update Remaining Pages

**Files:**
- Modify: `frontend/src/admin/pages/AdminPatientsPage.tsx`
- Modify: `frontend/src/admin/pages/AdminPatientsPage.module.css`
- Modify: `frontend/src/admin/pages/AdminSchedulePage.tsx`
- Modify: `frontend/src/admin/pages/AdminSchedulePage.module.css`
- Modify: `frontend/src/admin/pages/AdminSettingsPage.tsx`
- Modify: `frontend/src/admin/pages/AdminSettingsPage.module.css`

**Interfaces:**
- Consumes: Existing API endpoints
- Produces: Updated pages matching reference design

- [ ] **Step 1: Update AdminPatientsPage with patient cards**

(Patient cards with avatar, name, visits, last visit, pending, completed, prescription count. Click opens timeline.)

- [ ] **Step 2: Update AdminSchedulePage with utilization info**

(Utilization stats: "20 slots · 16 booked · 4 available · 80% utilization")

- [ ] **Step 3: Update AdminSettingsPage to remove dark mode**

(Remove dark mode toggle, match reference design with clean cards)

- [ ] **Step 4: Verify all pages render correctly**

Run: `cd frontend && npm run dev`
Expected: All pages match reference design

- [ ] **Step 5: Commit**

```bash
git add frontend/src/admin/pages/
git commit -m "feat: update patients, schedule, and settings pages"
```

---

### Task 11: Create Shared Components

**Files:**
- Create: `frontend/src/admin/components/ActivityLog.tsx`
- Create: `frontend/src/admin/components/ActivityLog.module.css`
- Create: `frontend/src/admin/components/NotificationCenter.tsx`
- Create: `frontend/src/admin/components/NotificationCenter.module.css`
- Create: `frontend/src/admin/components/GlobalSearch.tsx`
- Create: `frontend/src/admin/components/GlobalSearch.module.css`

**Interfaces:**
- Consumes: API endpoints (activity, notifications, search)
- Produces: Reusable shared components

- [ ] **Step 1: Create ActivityLog component**

(Audit trail with timestamp, action, entity)

- [ ] **Step 2: Create NotificationCenter component**

(Bell icon with dropdown, action-required items only)

- [ ] **Step 3: Create GlobalSearch component**

(Command-style search with results dropdown)

- [ ] **Step 4: Verify components render**

Run: `cd frontend && npm run dev`
Expected: Components visible in admin layout

- [ ] **Step 5: Commit**

```bash
git add frontend/src/admin/components/
git commit -m "feat: add activity log, notification center, and global search"
```

---

### Task 12: Final Integration & Testing

**Files:**
- Modify: Various (integration testing)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Fully integrated admin dashboard

- [ ] **Step 1: Run full build**

Run: `cd frontend && npm run build`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `cd frontend && npm run lint`
Expected: No errors

- [ ] **Step 3: Manual testing**

Test all pages:
- Today's Queue loads with color-coded cards
- Requests inbox works with slot assignment
- Patients page shows cards with timeline
- Services page has CRUD
- Prescriptions page has tabs
- Settings page matches reference
- Mobile bottom nav works
- More drawer opens

- [ ] **Step 4: Commit final changes**

```bash
git add .
git commit -m "feat: complete Phase 1 admin UI overhaul"
```

---

## Spec Coverage

| Spec Requirement | Task |
|-----------------|------|
| Sidebar navigation (workflow order) | Task 2 |
| Sidebar footer (doctor info) | Task 2 |
| Mobile bottom nav (5 + More) | Task 2, 3 |
| Greeting banner | Task 5 |
| Stat cards (4) | Task 5 |
| Today's Queue (color-coded) | Task 6 |
| Waiting Room panel | Task 6 |
| Appointment Requests (inbox) | Task 7 |
| Slot Assignment (inline) | Task 7 |
| Patient Timeline | Task 10 |
| Schedule & Availability | Task 10 |
| Services (cards) | Task 8 |
| Prescriptions (tabs) | Task 9 |
| Activity Log | Task 11 |
| Notification Center | Task 11 |
| Global Search | Task 11 |
| Production Features (states) | Task 12 |
| Dark mode removed | Task 10 |
