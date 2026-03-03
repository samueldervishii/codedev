import { useState } from 'react';
import { X, Repeat2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCrosspost } from '../../hooks/usePosts';
import type { JoinedCommunity } from '@devhub/shared';

interface CrosspostModalProps {
  postId: string;
  currentCommunity: string;
  open: boolean;
  onClose: () => void;
}

export function CrosspostModal({ postId, currentCommunity, open, onClose }: CrosspostModalProps) {
  const { user } = useAuthStore();
  const crosspost = useCrosspost();
  const [selected, setSelected] = useState('');

  if (!open) return null;

  const communities = (user?.joinedCommunities ?? []).filter(
    (c: JoinedCommunity) => c.name !== currentCommunity,
  );

  const handleCrosspost = () => {
    if (!selected) return;
    crosspost.mutate(
      { postId, communityName: selected },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Repeat2 className="h-4 w-4" />
            Cross-post to another community
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto p-4">
          {communities.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No other communities to crosspost to. Join more communities first.
            </p>
          ) : (
            <div className="space-y-1">
              {communities.map((c: JoinedCommunity) => (
                <button
                  key={c._id}
                  onClick={() => setSelected(c.name)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected === c.name
                      ? 'bg-brand-600/20 text-brand-400 ring-1 ring-brand-500'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-brand-300">
                    {c.name[0].toUpperCase()}
                  </div>
                  <span>c/{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-800 px-4 py-3">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleCrosspost}
            disabled={!selected || crosspost.isPending}
            className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {crosspost.isPending ? 'Crossposting...' : 'Crosspost'}
          </button>
        </div>
      </div>
    </div>
  );
}
