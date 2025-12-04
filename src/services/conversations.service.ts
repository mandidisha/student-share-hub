import { supabase } from '@/integrations/supabase/client';
import { Conversation, Profile, Message } from '@/types/database';

export interface ConversationWithDetails extends Conversation {
  other_user: Profile;
  listing_title?: string;
  last_message?: Message;
}

export const conversationsService = {
  async getConversations(userId: string): Promise<ConversationWithDetails[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    const enriched = await Promise.all(
      data.map(async (conv: Conversation) => {
        const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .maybeSingle();

        let listing_title;
        if (conv.listing_id) {
          const { data: listing } = await supabase
            .from('listings')
            .select('title')
            .eq('id', conv.listing_id)
            .maybeSingle();
          listing_title = listing?.title;
        }

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...conv,
          other_user: profile as Profile,
          listing_title,
          last_message: lastMessage as Message,
        };
      })
    );

    return enriched as ConversationWithDetails[];
  },

  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    listingId?: string
  ): Promise<{ id: string; isNew: boolean }> {
    // Check for existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
      .eq('listing_id', listingId || '')
      .maybeSingle();

    if (existing) {
      return { id: existing.id, isNew: false };
    }

    // Create new conversation
    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: userId,
        participant_2: otherUserId,
        listing_id: listingId,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: newConvo.id, isNew: true };
  },

  async checkConversationExists(userId: string, otherUserId: string): Promise<boolean> {
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
      .maybeSingle();
    return !!data;
  },

  async updateLastMessageAt(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    if (error) throw error;
  },
};
