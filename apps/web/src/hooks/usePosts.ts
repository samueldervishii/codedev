import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts.api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import type { CreatePostInput } from '@devhub/shared';

export function useCommunityPosts(
  communityName: string,
  params?: { sort?: string; time?: string; page?: number },
) {
  return useQuery({
    queryKey: ['posts', 'community', communityName, params],
    queryFn: () => postsApi.listByCommunity(communityName, params),
    select: (res) => res.data,
    enabled: !!communityName,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => postsApi.getById(id),
    select: (res) => res.data.data,
    enabled: !!id,
  });
}

export function useAllPosts(params?: { sort?: string; time?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['posts', 'all', params],
    queryFn: () => postsApi.listAll(params),
    select: (res) => res.data,
  });
}

export function useHomeFeed(params?: { sort?: string; page?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['feed', 'home', params],
    queryFn: () => postsApi.getHomeFeed(params),
    select: (res) => res.data,
    enabled: isAuthenticated,
  });
}

export function useCreatePost(communityName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.create(communityName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'community', communityName] });
      toast.success('Post created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create post'),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete post'),
  });
}
