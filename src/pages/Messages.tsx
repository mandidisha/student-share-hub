import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { useMessages, useSendMessage, useMarkMessagesAsRead } from '@/hooks/useMessages';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const selectedConvoId = searchParams.get('conversation');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useConversations(user?.id);
  const { data: messages } = useMessages(selectedConvoId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  const selectedConversation = conversations?.find(c => c.id === selectedConvoId);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedConvoId) return;

    const channel = supabase
      .channel(`messages-${selectedConvoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConvoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedConvoId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvoId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!selectedConvoId || !user || !messages) return;

    const unreadMessages = messages.filter(m => m.receiver_id === user.id && !m.is_read);
    if (unreadMessages.length > 0) {
      markAsReadMutation.mutate({ conversationId: selectedConvoId, userId: user.id });
    }
  }, [selectedConvoId, user, messages]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participant_1 === user.id
      ? selectedConversation.participant_2
      : selectedConversation.participant_1;

    sendMessageMutation.mutate(
      {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage.trim(),
      },
      {
        onSuccess: () => {
          setNewMessage('');
        },
      }
    );
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return t('messages.yesterday');
    return format(date, 'MMM d');
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="bg-card rounded-xl shadow-soft border overflow-hidden h-[calc(100vh-10rem)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={cn(
              "w-full md:w-80 border-r flex flex-col",
              selectedConvoId && "hidden md:flex"
            )}>
              <div className="p-4 border-b">
                <h2 className="font-semibold">{t('messages.title')}</h2>
              </div>
              <ScrollArea className="flex-1">
                {conversations && conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => navigate(`/messages?conversation=${conv.id}`)}
                      className={cn(
                        "w-full p-4 flex gap-3 hover:bg-secondary/50 transition-colors text-left",
                        conv.id === selectedConvoId && "bg-secondary"
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={conv.other_user?.avatar_url || ''} />
                        <AvatarFallback>{conv.other_user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{conv.other_user?.full_name || 'User'}</p>
                          {conv.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageDate(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conv.listing_title && (
                          <p className="text-xs text-muted-foreground truncate">Re: {conv.listing_title}</p>
                        )}
                        {conv.last_message && (
                          <p className="text-sm text-muted-foreground truncate">{conv.last_message.content}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>{t('messages.noConversations')}</p>
                    <p className="text-sm mt-1">{t('messages.noConversationsDesc')}</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className={cn(
              "flex-1 flex flex-col",
              !selectedConvoId && "hidden md:flex"
            )}>
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => navigate('/messages')}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                      <AvatarImage src={selectedConversation.other_user?.avatar_url || ''} />
                      <AvatarFallback>{selectedConversation.other_user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConversation.other_user?.full_name || 'User'}</p>
                      {selectedConversation.listing_title && (
                        <p className="text-xs text-muted-foreground">Re: {selectedConversation.listing_title}</p>
                      )}
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages?.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.sender_id === user.id ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              message.sender_id === user.id
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-secondary rounded-bl-md"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              message.sender_id === user.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {format(new Date(message.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                    <Input
                      placeholder={t('messages.typeMessage')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || sendMessageMutation.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <p className="text-muted-foreground">{t('messages.selectConversation')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
