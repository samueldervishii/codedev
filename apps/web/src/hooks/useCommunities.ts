import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesApi } from '../api/communities.api';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import type { CreateCommunityInput, UpdateCommunityInput } from '@devhub/shared';

export function useTrendingCommunities(limit: number = 10) {
  return useQuery({
    queryKey: ['communities', 'trending', limit],
    queryFn: () => communitiesApi.trending(limit),
    select: (res) => res.data.data,
  });
}

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

export function useUpdateCommunity(name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCommunityInput) => communitiesApi.update(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', name] });
      toast.success('Community updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update community'),
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (name: string) => communitiesApi.join(name),
    onMutate: async (name) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['communities', name] });

      const cached: any = queryClient.getQueryData(['communities', name]);
      const community = cached?.data?.data;
      if (!community) return;

      const previousJoined = user.joinedCommunities;
      const previousCommunity = cached;

      // Optimistic: update joinedCommunities
      updateUser({
        joinedCommunities: [
          ...previousJoined,
          { _id: community._id, name: community.name, displayName: community.displayName || '', iconUrl: community.iconUrl || '' },
        ],
      });

      // Optimistic: bump memberCount in community cache
      queryClient.setQueryData(['communities', name], {
        ...cached,
        data: {
          ...cached.data,
          data: { ...community, memberCount: (community.memberCount ?? 0) + 1 },
        },
      });

      return { previousJoined, previousCommunity };
    },
    onError: (err: any, name, context) => {
      if (context?.previousJoined) {
        updateUser({ joinedCommunities: context.previousJoined });
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(['communities', name], context.previousCommunity);
      }
      toast.error(err.response?.data?.message || 'Failed to join');
    },
    onSettled: async (_data, _error, name) => {
      queryClient.invalidateQueries({ queryKey: ['communities', name] });
      try {
        const res = await authApi.getMe();
        updateUser(res.data.data);
      } catch {}
    },
    onSuccess: () => toast.success('Joined community!'),
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (name: string) => communitiesApi.leave(name),
    onMutate: async (name) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      await queryClient.cancelQueries({ queryKey: ['communities', name] });

      const cached: any = queryClient.getQueryData(['communities', name]);
      const community = cached?.data?.data;
      if (!community) return;

      const previousJoined = user.joinedCommunities;
      const previousCommunity = cached;

      // Optimistic: remove from joinedCommunities
      updateUser({
        joinedCommunities: previousJoined.filter((c) => c._id !== community._id),
      });

      // Optimistic: decrement memberCount in community cache
      queryClient.setQueryData(['communities', name], {
        ...cached,
        data: {
          ...cached.data,
          data: { ...community, memberCount: Math.max(0, (community.memberCount ?? 1) - 1) },
        },
      });

      return { previousJoined, previousCommunity };
    },
    onError: (err: any, name, context) => {
      if (context?.previousJoined) {
        updateUser({ joinedCommunities: context.previousJoined });
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(['communities', name], context.previousCommunity);
      }
      toast.error(err.response?.data?.message || 'Failed to leave');
    },
    onSettled: async (_data, _error, name) => {
      queryClient.invalidateQueries({ queryKey: ['communities', name] });
      try {
        const res = await authApi.getMe();
        updateUser(res.data.data);
      } catch {}
    },
    onSuccess: () => toast.success('Left community'),
  });
}
