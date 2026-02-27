import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function LoadMoreButton({ onClick, isLoading }: LoadMoreButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onClick();
        }
      },
      { threshold: 0, rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onClick, isLoading]);

  return (
    <div ref={ref} className="flex justify-center py-6">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more...
        </div>
      )}
    </div>
  );
}
