import { Flame, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PostSortBarProps {
  sort: string;
  onSortChange: (sort: string) => void;
}

const sorts = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: TrendingUp },
];

export function PostSortBar({ sort, onSortChange }: PostSortBarProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {sorts.map((s) => (
        <button
          key={s.value}
          onClick={() => onSortChange(s.value)}
          className={cn(
            'flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            sort === s.value
              ? 'bg-gray-800 text-white'
              : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300',
          )}
        >
          <s.icon className={cn('h-4 w-4', sort === s.value && 'text-brand-400')} />
          {s.label}
        </button>
      ))}
    </div>
  );
}
