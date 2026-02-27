import { api } from './client';
import type { LoginInput, RegisterInput } from '@devhub/shared';

export const authApi = {
  register: (data: RegisterInput) => api.post('/auth/register', data),
  login: (data: LoginInput) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};
