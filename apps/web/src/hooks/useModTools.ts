import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, modApi } from '../api/reports.api';
import toast from 'react-hot-toast';

export function useReports(communityName: string, status: string = 'pending') {
  return useQuery({
    queryKey: ['reports', communityName, status],
    queryFn: () => reportsApi.listByCommunity(communityName, { status }),
    select: (res) => res.data,
    enabled: !!communityName,
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      reportsApi.reportPost(postId, reason),
    onSuccess: () => toast.success('Report submitted'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to report'),
  });
}

export function useReportComment() {
  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: string; reason: string }) =>
      reportsApi.reportComment(commentId, reason),
    onSuccess: () => toast.success('Report submitted'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to report'),
  });
}

export function useResolveReport(communityName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'remove' | 'dismiss' }) =>
      reportsApi.resolve(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', communityName] });
      toast.success('Report resolved');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to resolve report'),
  });
}

export function useBanUser(communityName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => modApi.banUser(communityName, username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', communityName] });
      toast.success('User banned');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to ban user'),
  });
}

export function useUnbanUser(communityName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => modApi.unbanUser(communityName, username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', communityName] });
      toast.success('User unbanned');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to unban user'),
  });
}
