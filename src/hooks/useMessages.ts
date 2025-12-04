import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesService, SendMessageData } from '@/services/messages.service';
import { conversationsService } from '@/services/conversations.service';

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    enabled: !!conversationId,
    queryFn: () => messagesService.getMessages(conversationId!),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      const message = await messagesService.sendMessage(data);
      await conversationsService.updateLastMessageAt(data.conversation_id);
      return message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      messagesService.markMessagesAsRead(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
