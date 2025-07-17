import { supabase } from '@infrastructure/config/supabase';
import { v5 as uuidv5 } from 'uuid';

export default class SupabaseMessagesDataSource {
    constructor() {
        this.MY_NAMESPACE = 'd9b1f8c0-2f3e-4b5a-8c6d-7e8f9a0b1c2d'; // Replace with your actual namespace UUID
    }

    // Helper function to get or create a conversation_id (already exists as startConversation)
    async startConversation (
      initiatorId,
      recipientId,
    ){
      try {
        // Sort the IDs to ensure the conversation_id is deterministic
        const sortedIds = [initiatorId, recipientId].sort();
        const conversationIdString = `${sortedIds[0]}-${sortedIds[1]}`;
    
        // Generate a UUID v5 based on the sorted IDs
        const conversationId = uuidv5(conversationIdString, this.MY_NAMESPACE);
    
        // Determine initiator and recipient based on sorted order
        const [firstId, secondId] = sortedIds;
        const isInitiatorFirst = initiatorId === firstId;
        const isRecipientFirst = recipientId === secondId;
    
        // Use upsert to handle concurrent creation
        const { data, error } = await supabase
          .from('conversations')
          .upsert(
            {
              conversation_id: conversationId,
              initiator_id: isInitiatorFirst ? initiatorId : recipientId,
              recipient_id: isRecipientFirst ? recipientId : initiatorId,
              created_at: new Date().toISOString(), // Ensure created_at is set
              updated_at: new Date().toISOString(), // Ensure updated_at is set
            },
            {
              onConflict: 'conversation_id', // Specify the conflict target (primary key)
              ignoreDuplicates: false, // Ensure we get the existing record on conflict
            }
          )
          .select('conversation_id')
          .single();
    
        if (error) throw error;
    
        return {
          conversation_id: data.conversation_id,
          rate_per_msg: data.rate_per_msg,
        };
      } catch (error) {
        console.error('Error starting conversation:', error);
        throw error;
      }
    };
    
    // Send a message
    async sendMessage (
      initiatorId,
      recipientId,
      senderId,
      content,
      isRead,
      messageType,
      replyToMessageId = null,
    ) {
      try {
        // Get or create the conversation
        const { conversation_id: conversationId } =
          await startConversation(initiatorId, recipientId);
    
        // Determine if message requires payment
        const requiresPayment = ratePerMsgFromDb > 0;
        const amount = ratePerMsgFromDb;
    
        const { data, error } = await supabase
          .from('direct_messages')
          .insert({
            conversation_id: conversationId,
            from_user_id: senderId,
            to_user_id: recipientId,
            message: content,
            is_read: isRead,
            message_type: messageType, // Ensure messageType is defined in the context
            reply_to_message_id: replyToMessageId,
          })
          .select()
          .single();
    
        if (error) throw error;
    
        await supabase
          .from('conversations')
          .update({ updated_at: new Date() })
          .eq('conversation_id', conversationId);
    
        return {
          message_id: data.message_id,
          created_at: data.created_at,
          is_paid: !requiresPayment,
          requires_payment: requiresPayment,
          amount: amount,
          reply_to_message_id: replyToMessageId,
          conversation_id: conversationId, // Optionally return for reference
        };
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    };
    
    // Fetch messages for a conversation
    async getConversationMessages (
      initiatorId,
      recipientId,
      userId,
    ) {
      try {
        // Get or create the conversation
        const { conversation_id: conversationId } = await startConversation(
          initiatorId,
          recipientId
        );
    
        const { data, error } = await supabase
          .from('direct_messages')
          .select(
            `
            *
          `
          )
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
    
        if (error) throw error;
    
        return data
          .map(msg => ({
            message_id: msg.message_id,
            sender_id: msg.from_user_id,
            content: msg.message,
            created_at: msg.created_at,
            is_read: msg.is_read,
            message_type: msg.message_type,
            reply_to_message_id: msg.reply_to_message_id,
            is_current_user: msg.from_user_id === userId,
            conversation_id: conversationId, // Optionally include for reference
          }))
          .reverse(); // Reverse to show oldest first
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    };
    
    // Fetch user conversations (unchanged, already handles conversation_id internally)
    async getUserConversations (userId){
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(
            `*`
          )
          .or(`initiator_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('updated_at', { ascending: false });
    
        if (error) throw error;
    
        return data.map(convo => ({
          conversation_id: convo.conversation_id,
          other_user:
            convo.initiator_id === userId ? convo.recipient : convo.initiator,
          created_at: convo.created_at,
          updated_at: convo.updated_at,
          rate_per_msg: convo.rate_per_msg,
          status: convo.status,
        }));
      } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
    };
}