import { useInfiniteQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';

export function useSearchUsers(query: string) {
  return useInfiniteQuery({
    queryKey: ['users', 'search', query],
    queryFn: ({ pageParam = 1 }) =>
      usersApi.search({ q: query, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    enabled: !!query,
  });
}
