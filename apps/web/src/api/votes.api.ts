import { api } from './client';

export const votesApi = {
  votePost: (postId: string, value: 1 | -1) => api.post(`/posts/${postId}/vote`, { value }),
  removePostVote: (postId: string) => api.delete(`/posts/${postId}/vote`),
  getPostVote: (postId: string) => api.get(`/posts/${postId}/vote`),
  voteComment: (commentId: string, value: 1 | -1) =>
    api.post(`/comments/${commentId}/vote`, { value }),
  removeCommentVote: (commentId: string) => api.delete(`/comments/${commentId}/vote`),
  batchGetVotes: (targetType: 'post' | 'comment', targetIds: string[]) =>
    api.post('/votes/batch', { targetType, targetIds }),
};
