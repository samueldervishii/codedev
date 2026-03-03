import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, FileText, MessageSquare, Hash } from 'lucide-react';
import { useAllPosts } from '../hooks/usePosts';
import { useCommunities } from '../hooks/useCommunities';
import { useSearchUsers } from '../hooks/useUsers';
import { useSearchComments } from '../hooks/useComments';
import { PostCard } from '../components/post/PostCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { TimeAgo } from '../components/shared/TimeAgo';
import { formatNumber } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Post, Community } from '@devhub/shared';

const TABS = [
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'communities', label: 'Communities', icon: Hash },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const posts = useAllPosts({ search: q || undefined });
  const communities = useCommunities({ search: q || undefined });
  const users = useSearchUsers(q);
  const comments = useSearchComments(q);

  if (!q) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Search className="mb-4 h-12 w-12 text-gray-600" />
        <h1 className="mb-2 text-xl font-bold text-white">Search DevHub</h1>
        <p className="text-sm text-gray-400">Use the search bar above to find posts, communities, users, and comments.</p>
      </div>
    );
  }

  const communityResults = communities.data?.data ?? [];
  const allPosts = posts.data?.pages.flatMap((p) => p.data) ?? [];
  const allUsers = users.data?.pages.flatMap((p) => p.data) ?? [];
  const allComments = comments.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      <Helmet>
        <title>Search: {q} - DevHub</title>
      </Helmet>

      <h1 className="mb-4 text-lg font-bold text-white">
        Results for "<span className="text-brand-400">{q}</span>"
      </h1>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-brand-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <>
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
      )}

      {/* Communities Tab */}
      {activeTab === 'communities' && (
        <>
          {communities.isLoading && <LoadingSpinner />}
          {communityResults.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {communityResults.map((c: Community) => (
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
                    {c.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">{c.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !communities.isLoading && (
              <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
                No communities found for "{q}"
              </div>
            )
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {users.isLoading && <LoadingSpinner />}
          {allUsers.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {allUsers.map((u: any) => (
                <Link
                  key={u._id}
                  to={`/u/${u.username}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800 font-bold text-brand-300">
                      {u.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">u/{u.username}</p>
                    {u.displayName && (
                      <p className="text-xs text-gray-400">{u.displayName}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatNumber(u.karma)} karma</p>
                  </div>
                </Link>
              ))}
              {users.hasNextPage && (
                <div className="sm:col-span-2">
                  <LoadMoreButton onClick={() => users.fetchNextPage()} isLoading={users.isFetchingNextPage} />
                </div>
              )}
            </div>
          ) : (
            !users.isLoading && (
              <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
                No users found for "{q}"
              </div>
            )
          )}
        </>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <>
          {comments.isLoading && <LoadingSpinner />}
          {allComments.length > 0 ? (
            <div className="space-y-2">
              {allComments.map((c: any) => (
                <Link
                  key={c._id}
                  to={`/c/_/posts/${c.post}`}
                  className="block rounded-lg border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
                >
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="font-medium text-gray-300">u/{c.authorUsername}</span>
                    <span className="text-gray-600">&middot;</span>
                    <TimeAgo date={c.createdAt} />
                    <span className="text-gray-600">&middot;</span>
                    <span>{formatNumber(c.score)} points</span>
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-300">{c.body}</p>
                </Link>
              ))}
              {comments.hasNextPage && (
                <LoadMoreButton onClick={() => comments.fetchNextPage()} isLoading={comments.isFetchingNextPage} />
              )}
            </div>
          ) : (
            !comments.isLoading && (
              <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
                No comments found for "{q}"
              </div>
            )
          )}
        </>
      )}
    </>
  );
}
