import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votesApi } from '../api/votes.api';

export function useVotePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, value }: { postId: string; value: 1 | -1 }) =>
      votesApi.votePost(postId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useVoteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, value }: { commentId: string; value: 1 | -1 }) =>
      votesApi.voteComment(commentId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
