import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@shared/context/AuthContext'
import { AdminAuthProvider } from '@admin/context/AdminAuthContext'
import { ToastProvider } from '@shared/context/ToastContext'
import PatientRoute from '@shared/components/PatientRoute'
import AdminRoute from '@shared/components/AdminRoute'
import ErrorBoundary from '@shared/components/ErrorBoundary'
import LandingPage from '@patient/pages/LandingPage'
import LoginPage from '@patient/pages/LoginPage'
import RegisterPage from '@patient/pages/RegisterPage'
import BookingPage from '@patient/pages/BookingPage'
import MyAppointmentsPage from '@patient/pages/MyAppointmentsPage'
import AdminLoginPage from '@admin/pages/AdminLoginPage'

const AdminDashboard = lazy(() => import('@admin/pages/AdminDashboard'))

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route element={<PatientRoute />}>
            <Route path="/book" element={<BookingPage />} />
            <Route path="/my-appointments" element={<MyAppointmentsPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route
              path="/admin/*"
              element={
                <ErrorBoundary>
                  <Suspense fallback={<div>Loading...</div>}>
                    <AdminDashboard />
                  </Suspense>
                </ErrorBoundary>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
