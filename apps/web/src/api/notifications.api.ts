import { api } from './client';

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
