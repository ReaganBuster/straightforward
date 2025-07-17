class Notification {
  constructor({
    notification_id,
    user_id,
    sender_id = null,
    notification_type,
    content,
    reference_id = null,
    reference_table = null,
    metadata = null,
    is_read = false,
    created_at = new Date(),
  }) {
    this.notification_id = notification_id;
    this.user_id = user_id;
    this.sender_id = sender_id;
    this.notification_type = notification_type;
    this.content = content;
    this.reference_id = reference_id;
    this.reference_table = reference_table;
    this.metadata = metadata;
    this.is_read = is_read;
    this.created_at = new Date(created_at);
  }

  static fromDb(row) {
    return new Notification(row);
  }

  toDb() {
    return {
      notification_id: this.notification_id,
      user_id: this.user_id,
      sender_id: this.sender_id,
      notification_type: this.notification_type,
      content: this.content,
      reference_id: this.reference_id,
      reference_table: this.reference_table,
      metadata: this.metadata,
      is_read: this.is_read,
      created_at: this.created_at,
    };
  }
}
