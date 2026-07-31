import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'

export default function PatientRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
