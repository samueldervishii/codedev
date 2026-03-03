import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  // Don't redirect while session restore is still in progress
  if (isRestoring) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
