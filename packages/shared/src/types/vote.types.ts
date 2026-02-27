export interface Vote {
  _id: string;
  user: string;
  targetType: 'post' | 'comment';
  target: string;
  value: 1 | -1;
  createdAt: string;
  updatedAt: string;
}

export interface VoteRequest {
  value: 1 | -1;
}

export interface BatchVoteRequest {
  targetType: 'post' | 'comment';
  targetIds: string[];
}

export interface BatchVoteResponse {
  votes: Record<string, 1 | -1>;
}
