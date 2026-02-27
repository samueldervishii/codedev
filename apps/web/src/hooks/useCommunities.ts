import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesApi } from '../api/communities.api';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import type { CreateCommunityInput } from '@devhub/shared';

export function useCommunities(params?: { search?: string; tag?: string; page?: number }) {
  return useQuery({
    queryKey: ['communities', params],
    queryFn: () => communitiesApi.list(params),
    select: (res) => res.data,
  });
}

export function useCommunity(name: string) {
  return useQuery({
    queryKey: ['communities', name],
    queryFn: () => communitiesApi.getByName(name),
    select: (res) => res.data.data,
    enabled: !!name,
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: CreateCommunityInput) => communitiesApi.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      // Re-fetch user to update joinedCommunities in sidebar
      try {
        const res = await authApi.getMe();
        updateUser(res.data.data);
      } catch {}
      toast.success('Community created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create community'),
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (name: string) => communitiesApi.join(name),
    onSuccess: async (_res, name) => {
      queryClient.invalidateQueries({ queryKey: ['communities', name] });
      // Re-fetch user to update joinedCommunities in sidebar
      try {
        const res = await authApi.getMe();
        updateUser(res.data.data);
      } catch {}
      toast.success('Joined community!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to join'),
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (name: string) => communitiesApi.leave(name),
    onSuccess: async (_res, name) => {
      queryClient.invalidateQueries({ queryKey: ['communities', name] });
      // Re-fetch user to update joinedCommunities in sidebar
      try {
        const res = await authApi.getMe();
        updateUser(res.data.data);
      } catch {}
      toast.success('Left community');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to leave'),
  });
}
