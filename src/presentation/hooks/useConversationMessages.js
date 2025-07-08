import { useState, useEffect, useCallback } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';

// Conversation messages hook
export const useConversationMessages = (initiatorId, recipientId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const [dmAccess, setDmAccess] = useState(null);

  const initializeConversation = useCallback(async () => {
    if (!initiatorId || !recipientId || !userId) {
      setError('Missing required user IDs');
      setLoading(false);
      return false;
    }

    try {
      setLoading(true);
      // const { conversation_id: convoId } = await supabaseQueries.startConversation(initiatorId, recipientId);
      // const access = await supabaseQueries.checkDmAccess(convoId, userId);
      // setDmAccess(access);

      const messagesData = await supabaseQueries.getConversationMessages(
        initiatorId,
        recipientId,
        userId,
        1,
        20
      );
      setMessages(
        messagesData.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )
      ); // Sort by created_at
      setHasMore(messagesData.length === 20);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initiatorId, recipientId, userId]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      initializeConversation();
    }
    return () => {
      isMounted = false;
    };
  }, [initializeConversation]);

  useEffect(() => {
    if (!initiatorId || !recipientId || !userId) return;

    let subscription;

    const setupRealtimeSubscription = async () => {
      const { conversation_id: conversationId } =
        await supabaseQueries.startConversation(initiatorId, recipientId);
      console.log(
        `Attempting to subscribe to channel: messages-${conversationId}`
      );

      subscription = supabaseQueries.supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          payload => {
            const newMessage = payload.new;
            console.log(`New message received: ${newMessage.message_id}`);
            setMessages(prevMessages => {
              // Remove any optimistic message with a temp ID if the real message arrives
              const filteredMessages = prevMessages.filter(
                msg => !msg.message_id.startsWith('temp-')
              );
              if (
                filteredMessages.some(
                  msg => msg.message_id === newMessage.message_id
                )
              ) {
                return filteredMessages;
              }
              const updatedMessages = [
                ...filteredMessages,
                {
                  message_id: newMessage.message_id,
                  sender_id: newMessage.from_user_id,
                  content: newMessage.message,
                  created_at: newMessage.created_at,
                  is_read: newMessage.is_read,
                  message_type: 'text',
                  reply_to_message_id: newMessage.reply_to_message_id,
                  is_current_user: newMessage.from_user_id === userId,
                  conversation_id: newMessage.conversation_id,
                },
              ];
              // Sort by created_at to ensure correct order
              return updatedMessages.sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
              );
            });
          }
        )
        .subscribe(status => {
          console.log(`Subscription status for ${conversationId}: ${status}`);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to Realtime channel');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Subscription failed, attempting to resubscribe...');
            setTimeout(() => setupRealtimeSubscription(), 2000);
          }
        });
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        // console.log(`Unsubscribing from channel: messages-${conversationId}`);
        supabaseQueries.supabase.removeChannel(subscription);
      }
    };
  }, [initiatorId, recipientId, userId]);

  const fetchMessages = useCallback(
    async (pageNum = 1) => {
      if (!initiatorId || !recipientId || !userId) return;
      try {
        setLoading(true);
        const pageSize = 20;
        const messagesData = await supabaseQueries.getConversationMessages(
          initiatorId,
          recipientId,
          userId,
          pageNum,
          pageSize
        );
        setMessages(prev => {
          const updatedMessages = [...prev, ...messagesData];
          return updatedMessages.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        });
        setHasMore(messagesData.length === pageSize);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [initiatorId, recipientId, userId]
  );

  const loadMoreMessages = () => {
    if (loading || !hasMore) return Promise.resolve();
    setPage(prev => prev + 1);
    return fetchMessages(page + 1);
  };

  const sendMessage = async (recipientId, content, replyToMessageId = null) => {
    const tempMessageId = `temp-${Date.now()}`;
    try {
      const optimisticMessage = {
        message_id: tempMessageId,
        sender_id: userId,
        content,
        created_at: new Date().toISOString(),
        is_read: false,
        content_type: 'text',
        reply_to_message_id: replyToMessageId,
        is_current_user: true,
        conversation_id: null,
      };
      // Add optimistic message
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, optimisticMessage];
        return updatedMessages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      });

      // Send the message to the server
      await supabaseQueries.sendMessage(
        initiatorId,
        recipientId,
        userId,
        content,
        replyToMessageId
      );
      // The Realtime subscription will handle adding the final message
    } catch (err) {
      // On error, remove the optimistic message
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.message_id !== tempMessageId)
      );
      setError(err.message);
      throw err;
    }
  };

  const processPayment = async messageId => {
    try {
      const success = await supabaseQueries.processMessagePayment(
        messageId,
        userId
      );
      if (success) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.message_id === messageId
              ? { ...msg, is_paid: true, requires_payment: false }
              : msg
          )
        );
      }
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // const requestDmAccess = async (recipientId, amount = null, postId = null) => {
  //   try {
  //     const result = await supabaseQueries.requestDmAccess(userId, recipientId, amount, postId);
  //     if (result.success) setDmAccess({ has_access: true, paid_amount: amount });
  //     return result;
  //   } catch (err) {
  //     setError(err.message);
  //     throw err;
  //   }
  // };

  const addInitialMessage = message => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, message];
      return updatedMessages.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    });
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    // dmAccess,
    loadMoreMessages,
    sendMessage,
    processPayment,
    // requestDmAccess,
    initializeConversation,
    refreshMessages: () => fetchMessages(1),
    addInitialMessage,
  };
};