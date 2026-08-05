import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminRequestsPage from './AdminRequestsPage'
import AdminTodayPage from './AdminTodayPage'
import AdminPatientsPage from './AdminPatientsPage'
import AdminSchedulePage from './AdminSchedulePage'
import AdminSettingsPage from './AdminSettingsPage'

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/today" replace />} />
        <Route path="today" element={<AdminTodayPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="schedule" element={<AdminSchedulePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/today" replace />} />
      </Route>
    </Routes>
  )
}
