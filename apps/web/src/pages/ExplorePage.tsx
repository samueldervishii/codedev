import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Plus, Hash } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { formatNumber } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import type { Community } from '@devhub/shared';

export function ExplorePage() {
  const [search, setSearch] = useState('');
  const { isAuthenticated } = useAuthStore();
  const communities = useCommunities({ search: search || undefined });

  return (
    <>
      <Helmet>
        <title>Explore Communities - DevHub</title>
      </Helmet>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Explore Communities</h1>
        {isAuthenticated && (
          <Link
            to="/create-community"
            className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            Create
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities..."
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
        />
      </div>

      {communities.isLoading && <LoadingSpinner />}

      {communities.data?.data && communities.data.data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {communities.data.data.map((community: Community) => (
            <CommunityCard key={community._id} community={community} />
          ))}
        </div>
      ) : (
        !communities.isLoading && (
          <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
            <Users className="mb-4 h-12 w-12 text-gray-600" />
            <h2 className="mb-2 text-lg font-bold text-white">
              {search ? 'No communities found' : 'No communities yet'}
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              {search
                ? `No communities match "${search}"`
                : 'Be the first to create a community!'}
            </p>
          </div>
        )
      )}
    </>
  );
}

function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      to={`/c/${community.name}`}
      className="flex gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-800 text-lg font-bold text-brand-300">
        {community.name[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white">c/{community.name}</h3>
        {community.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-400">{community.description}</p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(community.memberCount)} members
          </span>
          {community.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              {community.tags.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
