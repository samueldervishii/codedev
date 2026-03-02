import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi } from '../api/bookmarks.api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) =>
      isBookmarked
        ? bookmarksApi.removeBookmark(postId)
        : bookmarksApi.addBookmark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update bookmark';
      if (!msg.includes('Already')) toast.error(msg);
    },
  });
}

export function useUserBookmarks() {
  return useInfiniteQuery({
    queryKey: ['bookmarks', 'user'],
    queryFn: ({ pageParam = 1 }) =>
      bookmarksApi.getUserBookmarks({ page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useBatchBookmarks(postIds: string[]) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['bookmarks', 'batch', postIds],
    queryFn: () => bookmarksApi.batchGetBookmarks(postIds).then((r) => r.data.data),
    enabled: isAuthenticated && postIds.length > 0,
    staleTime: 1000 * 60,
  });
}
