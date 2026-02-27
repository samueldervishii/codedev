import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, Shield, Pencil } from 'lucide-react';
import { useCommunity, useJoinCommunity, useLeaveCommunity } from '../hooks/useCommunities';
import { useCommunityPosts } from '../hooks/usePosts';
import { useAuthStore } from '../stores/authStore';
import { PostCard } from '../components/post/PostCard';
import { PostSortBar } from '../components/post/PostSortBar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { TimeAgo } from '../components/shared/TimeAgo';
import { formatNumber } from '../lib/utils';
import type { Post } from '@devhub/shared';

export function CommunityPage() {
  const { communityName } = useParams<{ communityName: string }>();
  const [sort, setSort] = useState('hot');
  const communityQuery = useCommunity(communityName!);
  const posts = useCommunityPosts(communityName!, { sort });
  const { user, isAuthenticated } = useAuthStore();
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();

  const community = communityQuery.data;
  const isMember = community ? user?.joinedCommunities?.some((c) => c._id === community._id) : false;
  const isCreator = community?.creator === user?._id;

  if (!community && !communityQuery.isLoading) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Community not found</h1>
        <p className="text-gray-400">c/{communityName} doesn't exist.</p>
      </div>
    );
  }

  if (communityQuery.isLoading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>{community ? `c/${community.name}` : 'Community'} - DevHub</title>
      </Helmet>

      {/* Community header */}
      {community && (
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900">
          {/* Banner */}
          <div className="h-24 rounded-t-xl bg-gradient-to-r from-brand-900 to-brand-700" />

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-900 bg-brand-800 text-2xl font-bold text-brand-300">
                  {community.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">c/{community.name}</h1>
                  {community.displayName && community.displayName !== community.name && (
                    <p className="text-sm text-gray-400">{community.displayName}</p>
                  )}
                </div>
              </div>

              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  {isMember ? (
                    <button
                      onClick={() => leaveCommunity.mutate(community.name)}
                      disabled={leaveCommunity.isPending}
                      className="rounded-full border border-gray-600 px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                    >
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => joinCommunity.mutate(community.name)}
                      disabled={joinCommunity.isPending}
                      className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
                    >
                      Join
                    </button>
                  )}
                </div>
              )}
            </div>

            {community.description && (
              <p className="mt-3 text-sm text-gray-400">{community.description}</p>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {formatNumber(community.memberCount)} members
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created <TimeAgo date={community.createdAt} />
              </span>
              {isCreator && (
                <span className="flex items-center gap-1 text-brand-400">
                  <Shield className="h-3.5 w-3.5" />
                  Creator
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create post prompt */}
      {isAuthenticated && community && (
        <Link
          to={`/c/${community.name}/submit`}
          className="mb-4 flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-400">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-500">
            Create a post...
          </div>
          <Pencil className="h-5 w-5 text-gray-500" />
        </Link>
      )}

      {/* Posts */}
      <PostSortBar sort={sort} onSortChange={setSort} />

      {posts.isLoading && <LoadingSpinner />}

      {posts.data?.data && posts.data.data.length > 0 ? (
        <div className="space-y-3">
          {posts.data.data.map((post: Post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        !posts.isLoading && (
          <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
            <h2 className="mb-2 text-lg font-bold text-white">No posts yet</h2>
            <p className="text-sm text-gray-400">Be the first to post in this community!</p>
          </div>
        )
      )}
    </>
  );
}
