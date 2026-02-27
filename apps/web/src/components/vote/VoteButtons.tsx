import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatNumber } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface VoteButtonsProps {
  score: number;
  userVote?: 1 | -1 | null;
  onVote: (value: 1 | -1) => void;
  horizontal?: boolean;
}

export function VoteButtons({ score, userVote, onVote, horizontal }: VoteButtonsProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const handleVote = (value: 1 | -1) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onVote(value);
  };

  if (horizontal) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-gray-800">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1); }}
          className={cn(
            'cursor-pointer rounded-l-full p-1.5 transition-colors hover:bg-gray-700',
            userVote === 1 ? 'text-upvote' : 'text-gray-400 hover:text-upvote',
          )}
        >
          <ArrowBigUp className="h-5 w-5" fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={cn(
          'min-w-[2ch] text-center text-xs font-bold',
          userVote === 1 ? 'text-upvote' : userVote === -1 ? 'text-downvote' : 'text-gray-300',
        )}>
          {formatNumber(score)}
        </span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(-1); }}
          className={cn(
            'cursor-pointer rounded-r-full p-1.5 transition-colors hover:bg-gray-700',
            userVote === -1 ? 'text-downvote' : 'text-gray-400 hover:text-downvote',
          )}
        >
          <ArrowBigDown className="h-5 w-5" fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1); }}
        className={cn(
          'cursor-pointer rounded p-0.5 transition-colors hover:bg-gray-700',
          userVote === 1 ? 'text-upvote' : 'text-gray-400 hover:text-upvote',
        )}
      >
        <ArrowBigUp className="h-6 w-6" fill={userVote === 1 ? 'currentColor' : 'none'} />
      </button>
      <span className={cn(
        'text-xs font-bold',
        userVote === 1 ? 'text-upvote' : userVote === -1 ? 'text-downvote' : 'text-gray-300',
      )}>
        {formatNumber(score)}
      </span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(-1); }}
        className={cn(
          'cursor-pointer rounded p-0.5 transition-colors hover:bg-gray-700',
          userVote === -1 ? 'text-downvote' : 'text-gray-400 hover:text-downvote',
        )}
      >
        <ArrowBigDown className="h-6 w-6" fill={userVote === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
