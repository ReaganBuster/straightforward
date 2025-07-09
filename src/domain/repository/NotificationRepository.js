class NotificationRepository {
    /**
     * Create a new notification.
     * @param {Object} notificationData
     * @returns {Promise<Object>}
     */
    async create(notificationData) {
        throw new Error('Method not implemented.');
    }

    /**
     * Find a notification by its ID.
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented.');
    }

    /**
     * Get all notifications for a user.
     * @param {string} userId
     * @param {Object} [options]
     * @returns {Promise<Array<Object>>}
     */
    async findByUserId(userId, options = {}) {
        throw new Error('Method not implemented.');
    }

    /**
     * Mark a notification as read.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async markAsRead(id) {
        throw new Error('Method not implemented.');
    }

    /**
     * Delete a notification by its ID.
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method not implemented.');
    }

    /**
     * Delete all notifications for a user.
     * @param {string} userId
     * @returns {Promise<void>}
     */
    async deleteAllByUserId(userId) {
        throw new Error('Method not implemented.');
    }
}

module.exports = NotificationRepository;