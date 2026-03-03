import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api/comments.api';
import toast from 'react-hot-toast';
import type { CreateCommentInput } from '@devhub/shared';

export function useSearchComments(query: string) {
  return useInfiniteQuery({
    queryKey: ['comments', 'search', query],
    queryFn: ({ pageParam = 1 }) =>
      commentsApi.search({ q: query, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    enabled: !!query,
  });
}

export function useComments(postId: string, sort?: string) {
  return useQuery({
    queryKey: ['comments', postId, sort],
    queryFn: () => commentsApi.listByPost(postId, sort),
    select: (res) => res.data.data,
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) => commentsApi.create(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to post comment'),
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      toast.success('Comment deleted');
    },
  });
}
