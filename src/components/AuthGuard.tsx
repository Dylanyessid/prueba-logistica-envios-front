import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}