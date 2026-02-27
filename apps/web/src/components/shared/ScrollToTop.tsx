import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center justify-center rounded-full bg-brand-600 p-3 text-white shadow-lg transition-colors hover:bg-brand-500"
      title="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
