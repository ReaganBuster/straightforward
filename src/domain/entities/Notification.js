class Notification {
    constructor({ id, recipientId, message, type, read = false, createdAt = new Date() }) {
        this.id = id;
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt;
    }

    markAsRead() {
        this.read = true;
    }

    markAsUnread() {
        this.read = false;
    }
}

export default Notification;