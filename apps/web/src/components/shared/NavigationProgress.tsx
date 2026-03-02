import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

export function NavigationProgress() {
  const location = useLocation();
  const isFetching = useIsFetching();
  const [show, setShow] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setShow(true);
    setWidth(30);

    const t1 = setTimeout(() => setWidth(60), 100);
    const t2 = setTimeout(() => setWidth(80), 300);
    const t3 = setTimeout(() => {
      setWidth(100);
      setTimeout(() => setShow(false), 200);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

  // Also show when React Query is fetching
  useEffect(() => {
    if (isFetching > 0) {
      setShow(true);
      setWidth(60);
    } else if (show) {
      setWidth(100);
      const t = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(t);
    }
  }, [isFetching]);

  if (!show) return null;

  return (
    <div className="fixed left-0 top-0 z-[100] h-0.5 w-full">
      <div
        className="h-full bg-brand-500 transition-all duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
