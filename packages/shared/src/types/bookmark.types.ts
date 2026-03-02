export interface Bookmark {
  _id: string;
  user: string;
  post: string;
  createdAt: string;
}

export interface BatchBookmarkResponse {
  bookmarks: Record<string, boolean>;
}
