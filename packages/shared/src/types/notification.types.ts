export interface Notification {
  _id: string;
  user: string;
  type: 'comment_reply' | 'post_comment' | 'upvote' | 'mention' | 'community_join' | 'new_post';
  message: string;
  link: string;
  read: boolean;
  actor: string;
  actorUsername: string;
  relatedPost?: string;
  relatedComment?: string;
  createdAt: string;
  updatedAt: string;
}
