import { api } from './client';
import type { UpdateProfileInput, ChangePasswordInput } from '@devhub/shared';

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: UpdateProfileInput) => api.patch('/users/me', data),
  changePassword: (data: ChangePasswordInput) => api.post('/users/me/password', data),
};
