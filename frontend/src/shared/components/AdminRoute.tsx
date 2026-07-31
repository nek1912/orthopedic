import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@admin/context/AdminAuthContext'

export default function AdminRoute() {
  const { isAuthenticated, checkAuth } = useAdminAuth()
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    checkAuth().then((ok) => {
      setValid(ok)
      setChecking(false)
    })
  }, [checkAuth])

  if (checking) {
    return <div className="page-loading" />
  }

  if (!valid && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
