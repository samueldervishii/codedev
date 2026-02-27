import { api } from './client';
import type { CreatePostInput } from '@devhub/shared';

export const postsApi = {
  listAll: (params?: { sort?: string; time?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/posts', { params }),
  listByCommunity: (name: string, params?: { sort?: string; time?: string; page?: number; limit?: number }) =>
    api.get(`/communities/${name}/posts`, { params }),
  getById: (id: string) => api.get(`/posts/${id}`),
  create: (communityName: string, data: CreatePostInput) =>
    api.post(`/communities/${communityName}/posts`, data),
  update: (id: string, body: string) => api.patch(`/posts/${id}`, { body }),
  delete: (id: string) => api.delete(`/posts/${id}`),
  getHomeFeed: (params?: { sort?: string; page?: number; limit?: number }) =>
    api.get('/users/me/feed', { params }),
  getUserPosts: (username: string, params?: { page?: number; limit?: number }) =>
    api.get(`/users/${username}/posts`, { params }),
};
