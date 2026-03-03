import { useState } from 'react';
import { X, Shield, Flag, UserX, Trash2, CheckCircle } from 'lucide-react';
import { useReports, useResolveReport, useBanUser, useUnbanUser } from '../../hooks/useModTools';
import { TimeAgo } from '../shared/TimeAgo';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { cn } from '../../lib/utils';
import type { Report, Community } from '@devhub/shared';

interface ModPanelProps {
  community: Community;
  open: boolean;
  onClose: () => void;
}

const TABS = ['Reports', 'Banned Users'] as const;
type Tab = (typeof TABS)[number];

export function ModPanel({ community, open, onClose }: ModPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Reports');
  const [banInput, setBanInput] = useState('');
  const reports = useReports(community.name);
  const resolveReport = useResolveReport(community.name);
  const banUser = useBanUser(community.name);
  const unbanUser = useUnbanUser(community.name);

  if (!open) return null;

  const reportList: Report[] = reports.data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl border border-gray-800 bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Mod Tools — c/{community.name}</h2>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'cursor-pointer border-b-2 px-5 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {activeTab === 'Reports' && (
            <>
              {reports.isLoading && <LoadingSpinner />}
              {reportList.length === 0 && !reports.isLoading && (
                <div className="py-8 text-center text-sm text-gray-500">
                  <Flag className="mx-auto mb-2 h-8 w-8 text-gray-700" />
                  No pending reports
                </div>
              )}
              <div className="space-y-2">
                {reportList.map((r: Report) => (
                  <div key={r._id} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                    <div className="mb-1.5 flex items-center gap-2 text-xs text-gray-400">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        r.targetType === 'post' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400',
                      )}>
                        {r.targetType}
                      </span>
                      <TimeAgo date={r.createdAt} />
                    </div>
                    <p className="mb-2 text-sm text-gray-300">
                      <span className="font-medium text-gray-200">Reason:</span> {r.reason}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveReport.mutate({ id: r._id, action: 'remove' })}
                        disabled={resolveReport.isPending}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/30"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove Content
                      </button>
                      <button
                        onClick={() => resolveReport.mutate({ id: r._id, action: 'dismiss' })}
                        disabled={resolveReport.isPending}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'Banned Users' && (
            <>
              {/* Ban form */}
              <div className="mb-4 flex gap-2">
                <input
                  value={banInput}
                  onChange={(e) => setBanInput(e.target.value)}
                  placeholder="Username to ban..."
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-brand-500"
                />
                <button
                  onClick={() => {
                    if (banInput.trim()) {
                      banUser.mutate(banInput.trim());
                      setBanInput('');
                    }
                  }}
                  disabled={!banInput.trim() || banUser.isPending}
                  className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ban
                </button>
              </div>

              {/* Banned users list */}
              {(community.bannedUsers ?? []).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <UserX className="mx-auto mb-2 h-8 w-8 text-gray-700" />
                  No banned users
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="mb-2 text-xs text-gray-500">
                    {community.bannedUsers.length} banned user(s) — IDs shown below. Use username to unban.
                  </p>
                  {community.bannedUsers.map((id: string) => (
                    <div key={id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
                      <span className="text-sm text-gray-400">{id}</span>
                      <button
                        onClick={() => {
                          const username = prompt('Enter username to unban:');
                          if (username) unbanUser.mutate(username);
                        }}
                        className="cursor-pointer text-xs text-brand-400 hover:text-brand-300"
                      >
                        Unban
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
