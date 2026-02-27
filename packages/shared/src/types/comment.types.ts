export interface Comment {
  _id: string;
  body: string;
  author: string;
  post: string;
  parent: string | null;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  isDeleted: boolean;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  body: string;
  parentId?: string;
}
