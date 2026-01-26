import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  requiredRoles?: string[]
  requiredPermissions?: string[]
  redirectTo?: string
}

const ProtectedRoute = ({
  requiredRoles,
  requiredPermissions,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { user } = useAuthStore()
  const hasRole =
    !requiredRoles || requiredRoles.includes(user?.role?.role || '')
  const hasPermission =
    !requiredPermissions || requiredPermissions.length === 0
      ? true
      : requiredPermissions.every((perm) =>
          user?.role?.permissions.some((p) => p.name === perm)
        )

  if (!user?.token) {
    return <Navigate to={redirectTo} replace />
  }

  if (!hasRole || !hasPermission) {
    return <Navigate to={'/401'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
