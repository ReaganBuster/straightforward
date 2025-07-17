import { SupabaseMessagesDataSource } from '@application/data-sources/SuperbaseMessagesDataSource';
import MessagesRepository from '@domain/repository/MessagesRepository';

export default class MessagesRepositoryImp extends MessagesRepository {
  constructor() {
    super();
    this.supabase = new SupabaseMessagesDataSource();
  }

  async createMessage(message) {
    const payload = message.toDb();
    const { data, error } = await this.supabase.sendMessage(
      payload.initiator_id,
      payload.recipient_id,
      payload.sender_id,
      payload.content,
      payload.message_type,
      payload.reply_to_message_id,
      payload.rate_per_msg
    );
    if (error) throw error;
    return data;
  }

  async getConversationMessages(initiatorId, recipientId, userId, page = 1, pageSize = 20) {
    const { data, error } = await this.supabase.getConversationMessages(
      initiatorId,
      recipientId,
      userId,
      page,
      pageSize
    );
    if (error) throw error;
    return data;
  }

  async getUserConversations(userId) {
    const { data, error } = await this.supabase.getUserConversations(userId);
    if (error) throw error;
    return data;
  }

    async deleteMessage(chatId, id) {
        const { error } = await this.supabase.deleteMessage(chatId, id);
        if (error) throw error;
    }
}