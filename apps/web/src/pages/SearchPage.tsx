import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAllPosts } from '../hooks/usePosts';
import { useCommunities } from '../hooks/useCommunities';
import { PostCard } from '../components/post/PostCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import type { Post, Community } from '@devhub/shared';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { formatNumber } from '../lib/utils';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const posts = useAllPosts({ search: q || undefined });
  const communities = useCommunities({ search: q || undefined });

  if (!q) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Search className="mb-4 h-12 w-12 text-gray-600" />
        <h1 className="mb-2 text-xl font-bold text-white">Search DevHub</h1>
        <p className="text-sm text-gray-400">Use the search bar above to find posts and communities.</p>
      </div>
    );
  }

  const communityResults = communities.data?.data ?? [];
  const allPosts = posts.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      <Helmet>
        <title>Search: {q} - DevHub</title>
      </Helmet>

      <h1 className="mb-4 text-lg font-bold text-white">
        Results for "<span className="text-brand-400">{q}</span>"
      </h1>

      {/* Communities */}
      {communityResults.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Communities</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {communityResults.slice(0, 4).map((c: Community) => (
              <Link
                key={c._id}
                to={`/c/${c.name}`}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800 font-bold text-brand-300">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">c/{c.name}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    {formatNumber(c.memberCount)} members
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Posts</h2>
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
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
            No posts found for "{q}"
          </div>
        )
      )}
    </>
  );
}
