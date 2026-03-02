import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts.api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import type { CreatePostInput } from '@devhub/shared';

export function useCommunityPosts(
  communityName: string,
  params?: { sort?: string; time?: string },
) {
  return useInfiniteQuery({
    queryKey: ['posts', 'community', communityName, params],
    queryFn: ({ pageParam = 1 }) =>
      postsApi.listByCommunity(communityName, { ...params, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
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

export function useAllPosts(params?: { sort?: string; time?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: ['posts', 'all', params],
    queryFn: ({ pageParam = 1 }) =>
      postsApi.listAll({ ...params, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useHomeFeed(params?: { sort?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useInfiniteQuery({
    queryKey: ['feed', 'home', params],
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getHomeFeed({ ...params, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    enabled: isAuthenticated,
  });
}

export function useCreatePost(communityName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.create(communityName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'community', communityName] });
      queryClient.invalidateQueries({ queryKey: ['communities', communityName] });
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
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete post'),
  });
}
