export class Message {
  constructor(data) {
    this.message_id = data.message_id;
    this.from_user_id = data.from_user_id;
    this.to_user_id = data.to_user_id;
    this.message = data.message || null;
    this.is_read = data.is_read || false;
    this.is_view_once = data.is_view_once || false;
    this.created_at = data.created_at;
    this.conversation_id = data.conversation_id;
    this.reply_to_message_id = data.reply_to_message_id || null;
    this.content_id = data.content_id || null;
    this.message_type = data.message_type;
    this.view_status = data.view_status || 'not_viewed'
  }

  toDb() {
    return {
      from_user_id: this.from_user_id,
      to_user_id: this.to_user_id,
      message: this.message,
      is_read: this.is_read,
      is_view_once: this.is_view_once,
      conversation_id: this.conversation_id,
      reply_to_message_id: this.reply_to_message_id,
      content_id: this.content_id,
      message_type: this.message_type,
      view_status: this.view_status
    };
  }
}
