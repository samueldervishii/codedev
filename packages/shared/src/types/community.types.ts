export interface CommunityRule {
  title: string;
  description: string;
}

export interface Community {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  rules: CommunityRule[];
  iconUrl: string;
  bannerUrl: string;
  creator: string;
  moderators: string[];
  memberCount: number;
  postCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityRequest {
  name: string;
  displayName?: string;
  description: string;
  tags?: string[];
}
