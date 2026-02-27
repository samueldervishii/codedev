import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import type { LoginInput, RegisterInput } from '@devhub/shared';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome to DevHub, ${user.username}!`);
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/');
      toast.success('Logged out');
    },
    onError: () => {
      // Still clear locally even if server fails
      clearAuth();
      queryClient.clear();
      navigate('/');
    },
  });
}

export function useRestoreSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRestoring = useAuthStore((s) => s.setRestoring);

  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken); // also sets isRestoring to false
    },
    onError: () => {
      setRestoring(false); // No session to restore, stop loading
    },
  });
}
