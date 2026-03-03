import { api } from './client';
import type { CreateCommentInput, UpdateCommentInput } from '@devhub/shared';

export const commentsApi = {
  search: (params: { q: string; page?: number; limit?: number }) =>
    api.get('/comments/search', { params }),
  listByPost: (postId: string, sort?: string) =>
    api.get(`/posts/${postId}/comments`, { params: { sort } }),
  create: (postId: string, data: CreateCommentInput) =>
    api.post(`/posts/${postId}/comments`, data),
  update: (id: string, data: UpdateCommentInput) => api.patch(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
  getUserComments: (username: string, params?: { page?: number; limit?: number }) =>
    api.get(`/users/${username}/comments`, { params }),
};
