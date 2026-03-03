import { api } from './client';

export const reportsApi = {
  reportPost: (postId: string, reason: string) =>
    api.post(`/posts/${postId}/report`, { reason }),
  reportComment: (commentId: string, reason: string) =>
    api.post(`/comments/${commentId}/report`, { reason }),
  listByCommunity: (communityName: string, params?: { status?: string; page?: number; limit?: number }) =>
    api.get(`/communities/${communityName}/reports`, { params }),
  resolve: (id: string, action: 'remove' | 'dismiss') =>
    api.patch(`/reports/${id}`, { action }),
};

export const modApi = {
  banUser: (communityName: string, username: string) =>
    api.post(`/communities/${communityName}/ban`, { username }),
  unbanUser: (communityName: string, username: string) =>
    api.post(`/communities/${communityName}/unban`, { username }),
  addModerator: (communityName: string, username: string) =>
    api.post(`/communities/${communityName}/moderators`, { username }),
  removeModerator: (communityName: string, username: string) =>
    api.delete(`/communities/${communityName}/moderators`, { data: { username } }),
  togglePin: (postId: string) => api.patch(`/posts/${postId}/pin`),
  toggleLock: (postId: string) => api.patch(`/posts/${postId}/lock`),
};
