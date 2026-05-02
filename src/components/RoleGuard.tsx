import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const isAuth = authService.isAuthenticated();
  const hasAccess = authService.hasRole(allowedRoles);


  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
}