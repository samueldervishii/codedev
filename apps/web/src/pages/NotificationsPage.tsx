import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, ArrowBigUp, AtSign, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkRead, useMarkAllRead, useUnreadCount } from '../hooks/useNotifications';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { TimeAgo } from '../components/shared/TimeAgo';
import type { Notification } from '@devhub/shared';

const typeIcons: Record<string, React.ReactNode> = {
  comment_reply: <MessageSquare className="h-5 w-5 text-blue-400" />,
  post_comment: <MessageSquare className="h-5 w-5 text-brand-400" />,
  upvote: <ArrowBigUp className="h-5 w-5 text-green-400" />,
  mention: <AtSign className="h-5 w-5 text-yellow-400" />,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const unreadCount = useUnreadCount();

  const items = notifications.data?.pages.flatMap((p) => p.data) ?? [];
  const count = unreadCount.data ?? 0;

  const handleClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n._id);
    navigate(n.link);
  };

  return (
    <>
      <Helmet>
        <title>Notifications - DevHub</title>
      </Helmet>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-400" />
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          {count > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
              {count} unread
            </span>
          )}
        </div>
        {count > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand-400 transition-colors hover:bg-gray-800"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.isLoading && <LoadingSpinner />}

      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((n: Notification) => (
            <button
              key={n._id}
              onClick={() => handleClick(n)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:border-gray-700 ${
                n.read
                  ? 'border-gray-800 bg-gray-900'
                  : 'border-brand-800/30 bg-brand-900/10'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {typeIcons[n.type] || <Bell className="h-5 w-5 text-gray-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-gray-200'}`}>
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  <TimeAgo date={n.createdAt} />
                </p>
              </div>
              {!n.read && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
              )}
            </button>
          ))}
          {notifications.hasNextPage && (
            <LoadMoreButton
              onClick={() => notifications.fetchNextPage()}
              isLoading={notifications.isFetchingNextPage}
            />
          )}
        </div>
      ) : (
        !notifications.isLoading && (
          <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
            <Bell className="mb-3 h-10 w-10 text-gray-700" />
            <h2 className="mb-1 text-lg font-bold text-white">No notifications</h2>
            <p className="text-sm text-gray-400">You're all caught up!</p>
          </div>
        )
      )}
    </>
  );
}
