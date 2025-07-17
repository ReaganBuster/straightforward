export default class MessageRepository {
    async createMessage(chatId, message, sender, recipient) {
        throw new Error('Method not implemented.');
    }

    async deleteMessage(chatId, id) {
        throw new Error('Method not implemented.');
    }

    async getConversationMessages(initiatorId, recipientId, userId, page = 1, pageSize = 20) {
        throw new Error('Method not implemented.');
    }

    async getUserConversations(userId) {
        throw new Error('Method not implemented.');
    }
    
}