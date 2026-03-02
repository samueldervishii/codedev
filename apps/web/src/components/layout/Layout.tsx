import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useRestoreSession } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ScrollToTop } from '../shared/ScrollToTop';
import { NavigationProgress } from '../shared/NavigationProgress';

export function Layout() {
  const restore = useRestoreSession();
  const isRestoring = useAuthStore((s) => s.isRestoring);

  useEffect(() => {
    restore.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <NavigationProgress />
      <Header />
      <Sidebar />
      <main className="px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
