export class Content {
  constructor(data) {
    this.content_id = data.content_id;
    this.conversation_id = data.conversation_id;
    this.user_id = data.user_id;
    this.media_type = data.media_type;
    this.media_url = data.media_url;
    this.thumbnail_url = data.thumbnail_url || null;
    this.metadata = data.metadata || {};
    this.created_at = data.created_at;
  }

  toDb() {
    return {
      content_id: this.content_id,
      conversation_id: this.conversation_id,
      user_id: this.user_id,
      media_type: this.media_type,
      media_url: this.media_url,
      thumbnail_url: this.thumbnail_url,
      metadata: this.metadata,
    };
  }
}
