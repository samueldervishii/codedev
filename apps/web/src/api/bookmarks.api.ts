import { api } from './client';

export const bookmarksApi = {
  addBookmark: (postId: string) =>
    api.post(`/posts/${postId}/bookmark`),
  removeBookmark: (postId: string) =>
    api.delete(`/posts/${postId}/bookmark`),
  getUserBookmarks: (params?: { page?: number; limit?: number }) =>
    api.get('/users/me/bookmarks', { params }),
  batchGetBookmarks: (postIds: string[]) =>
    api.post('/bookmarks/batch', { postIds }),
};
