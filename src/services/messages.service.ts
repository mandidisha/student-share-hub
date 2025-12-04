import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/database';

export interface SendMessageData {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}

export const messagesService = {
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Message[];
  },

  async sendMessage(data: SendMessageData): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        content: data.content,
      })
      .select()
      .single();
    if (error) throw error;
    return message as Message;
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId);
    if (error) throw error;
  },
};
