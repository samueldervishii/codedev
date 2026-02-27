import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useAllPosts } from '../hooks/usePosts';
import { PostCard } from '../components/post/PostCard';
import { PostSortBar } from '../components/post/PostSortBar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { Flame } from 'lucide-react';
import type { Post } from '@devhub/shared';

export function TrendingPage() {
  const [sort, setSort] = useState('hot');
  const posts = useAllPosts({ sort });

  const allPosts = posts.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      <Helmet>
        <title>Trending - DevHub</title>
      </Helmet>

      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-brand-400" />
        <h1 className="text-xl font-bold text-white">Trending Posts</h1>
      </div>

      <PostSortBar sort={sort} onSortChange={setSort} />

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
