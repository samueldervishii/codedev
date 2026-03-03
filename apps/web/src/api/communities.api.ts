import { api } from './client';
import type { CreateCommunityInput, UpdateCommunityInput } from '@devhub/shared';

export const communitiesApi = {
  list: (params?: { search?: string; tag?: string; page?: number; limit?: number }) =>
    api.get('/communities', { params }),
  trending: (limit?: number) => api.get('/communities/trending/top', { params: { limit } }),
  getByName: (name: string) => api.get(`/communities/${name}`),
  create: (data: CreateCommunityInput) => api.post('/communities', data),
  update: (name: string, data: UpdateCommunityInput) => api.patch(`/communities/${name}`, data),
  delete: (name: string) => api.delete(`/communities/${name}`),
  join: (name: string) => api.post(`/communities/${name}/join`),
  leave: (name: string) => api.post(`/communities/${name}/leave`),
};
