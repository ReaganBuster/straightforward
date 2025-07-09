class Message {
    constructor({ id, senderId, receiverId, content, sentAt, readAt = null }) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.sentAt = sentAt || new Date();
        this.readAt = readAt;
    }

    markAsRead() {
        this.readAt = new Date();
    }

    isRead() {
        return this.readAt !== null;
    }
}

module.exports = Message;