import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, MessageSquare, ArrowBigUp, AtSign } from 'lucide-react';
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications';
import { TimeAgo } from '../shared/TimeAgo';
import type { Notification } from '@devhub/shared';

const typeIcons: Record<string, React.ReactNode> = {
  comment_reply: <MessageSquare className="h-4 w-4 text-blue-400" />,
  post_comment: <MessageSquare className="h-4 w-4 text-brand-400" />,
  upvote: <ArrowBigUp className="h-4 w-4 text-green-400" />,
  mention: <AtSign className="h-4 w-4 text-yellow-400" />,
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const notifications = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const count = unreadCount.data ?? 0;
  const items = notifications.data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n._id);
    setOpen(false);
    navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex cursor-pointer items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="cursor-pointer text-xs text-brand-400 hover:text-brand-300"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="cursor-pointer text-xs text-gray-400 hover:text-white"
              >
                View all
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              items.slice(0, 10).map((n: Notification) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-800/50 ${
                    !n.read ? 'bg-brand-900/10' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {typeIcons[n.type] || <Bell className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-gray-200'}`}>
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      <TimeAgo date={n.createdAt} />
                    </p>
                  </div>
                  {!n.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
