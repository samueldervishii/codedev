export interface JoinedCommunity {
  _id: string;
  name: string;
  displayName: string;
  iconUrl: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  badges: string[];
  joinedCommunities: JoinedCommunity[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  badges: string[];
  createdAt: string;
}
