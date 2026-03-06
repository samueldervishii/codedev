import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { ReactNode } from 'react';

export function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  if (isRestoring) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}
