import { useEffect, useRef } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { useAuthStore } from '../stores/authStore';

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useInfiniteQuery({
    queryKey: ['notifications', 'list'],
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.list({ page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    enabled: isAuthenticated,
  });
}

export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data.data.count),
    enabled: isAuthenticated,
    // No polling — SSE pushes updates. Only refetch on window focus as fallback.
    refetchOnWindowFocus: true,
  });
}

/** SSE hook — listens for real-time notification events and updates the query cache */
export function useNotificationStream() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    const es = new EventSource(`/api/v1/notifications/stream?token=${encodeURIComponent(accessToken)}`);
    esRef.current = es;

    es.addEventListener('notification', (e) => {
      try {
        const { notification, unreadCount } = JSON.parse(e.data);
        // Update unread badge instantly
        queryClient.setQueryData(['notifications', 'unread-count'], unreadCount);
        // Refetch the notifications list
        queryClient.refetchQueries({ queryKey: ['notifications', 'list'] });
        // If someone joined/left or posted, refresh community data so counts stay in sync
        if (notification?.type === 'community_join' || notification?.type === 'new_post') {
          queryClient.invalidateQueries({ queryKey: ['communities'] });
        }
      } catch {}
    });

    es.onerror = () => {
      // Browser will auto-reconnect EventSource
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [isAuthenticated, accessToken, queryClient]);
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(['notifications', 'unread-count'], 0);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });
}
