import type { PostType } from '../constants/postTypes.js';

export interface CodeSnippet {
  code: string;
  language: string;
  fileName?: string;
}

export interface PostFlair {
  name: string;
  color: string;
}

export interface CrosspostFrom {
  postId: string;
  communityName: string;
}

export interface Post {
  _id: string;
  title: string;
  type: PostType;
  body?: string;
  url?: string;
  codeSnippet?: CodeSnippet;
  flair?: PostFlair;
  crosspostFrom?: CrosspostFrom;
  isPinned: boolean;
  isLocked: boolean;
  author: string;
  community: string;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  commentCount: number;
  hotScore: number;
  isDeleted: boolean;
  authorUsername: string;
  communityName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTextPostRequest {
  title: string;
  type: 'text';
  body: string;
}

export interface CreateLinkPostRequest {
  title: string;
  type: 'link';
  url: string;
}

export interface CreateCodePostRequest {
  title: string;
  type: 'code';
  codeSnippet: CodeSnippet;
}

export type CreatePostRequest =
  | CreateTextPostRequest
  | CreateLinkPostRequest
  | CreateCodePostRequest;
