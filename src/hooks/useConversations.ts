import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsService } from '@/services/conversations.service';

export const useConversations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['conversations', userId],
    enabled: !!userId,
    queryFn: () => conversationsService.getConversations(userId!),
  });
};

export const useHasConversation = (userId: string | undefined, otherUserId: string | undefined) => {
  return useQuery({
    queryKey: ['has-conversation', otherUserId, userId],
    enabled: !!userId && !!otherUserId && userId !== otherUserId,
    queryFn: () => conversationsService.checkConversationExists(userId!, otherUserId!),
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, otherUserId, listingId }: { userId: string; otherUserId: string; listingId?: string }) =>
      conversationsService.getOrCreateConversation(userId, otherUserId, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['has-conversation'] });
    },
  });
};
