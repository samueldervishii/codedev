export interface Report {
  _id: string;
  reporter: string;
  targetType: 'post' | 'comment';
  target: string;
  reason: string;
  community: string;
  communityName: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}
