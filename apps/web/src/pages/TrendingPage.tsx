import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllPosts } from '../hooks/usePosts';
import { useTrendingCommunities } from '../hooks/useCommunities';
import { PostCard } from '../components/post/PostCard';
import { PostSortBar } from '../components/post/PostSortBar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { Flame, Users, ChevronRight } from 'lucide-react';
import { formatNumber } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Post, Community } from '@devhub/shared';

const TIME_FILTERS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
] as const;

export function TrendingPage() {
  const [sort, setSort] = useState('hot');
  const [time, setTime] = useState<string>('week');
  const posts = useAllPosts({ sort, time: sort === 'top' ? time : undefined });
  const trendingCommunities = useTrendingCommunities(10);

  const allPosts = posts.data?.pages.flatMap((p) => p.data) ?? [];
  const communities = trendingCommunities.data ?? [];

  return (
    <>
      <Helmet>
        <title>Trending - DevHub</title>
      </Helmet>

      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-brand-400" />
        <h1 className="text-xl font-bold text-white">Trending</h1>
      </div>

      {/* Trending Communities */}
      {communities.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Trending Communities
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {communities.map((c: Community) => (
              <Link
                key={c._id}
                to={`/c/${c.name}`}
                className="flex min-w-[180px] shrink-0 items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-brand-300">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">c/{c.name}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    {formatNumber(c.memberCount)}
                  </p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-600" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sort + Time Filters */}
      <PostSortBar sort={sort} onSortChange={setSort} />

      {sort === 'top' && (
        <div className="mb-3 flex items-center gap-1">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTime(f.value)}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                time === f.value
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {posts.isLoading && <LoadingSpinner />}

      {allPosts.length > 0 ? (
        <div className="space-y-3">
          {allPosts.map((post: Post) => (
            <PostCard key={post._id} post={post} />
          ))}
          {posts.hasNextPage && (
            <LoadMoreButton onClick={() => posts.fetchNextPage()} isLoading={posts.isFetchingNextPage} />
          )}
        </div>
      ) : (
        !posts.isLoading && (
          <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
            <h2 className="mb-2 text-lg font-bold text-white">No posts yet</h2>
            <p className="text-sm text-gray-400">Be the first to create a post!</p>
          </div>
        )
      )}
    </>
  );
}
