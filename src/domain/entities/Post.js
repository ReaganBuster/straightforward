export default class Post {
  constructor({
    userId,
    caption,
    thumbnailUrl = null,
    isPremium = false,
    monetizationModel = null,
    dmFee = null,
    requiresSubscription = false,
    mediaType = null,
    durationDays = 6,
    isExtended = false,
    isMonetized = false,
    isDownloadable = false,
    isPermanent = false,
    isVerifiedPost = false
  }) {
    this.user_id = userId;
    this.caption = caption;
    this.thumbnail_url = thumbnailUrl;
    this.is_premium = isPremium;
    this.monetization_model = monetizationModel;
    this.dm_fee = dmFee;
    this.requires_subscription = requiresSubscription;
    this.media_type = mediaType;
    this.duration_days = durationDays;
    this.is_extended = isExtended;
    this.is_monetized = isMonetized;
    this.is_downloadable = isDownloadable;
    this.is_permanent = isPermanent;
    this.is_verified_post = isVerifiedPost;

    this.views = 0;
    this.like_count = 0;
    this.comment_count = 0;
    this.tokens_earned = 0;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.expires_at = this.calculateExpiration();
  }

  // Extract hashtags from caption
  extractTopics() {
    const hashtagRegex = /#(\w+)/g;
    const matches = [...this.caption.matchAll(hashtagRegex)];
    const uniqueTopics = [...new Set(matches.map(m => m[1].toLowerCase()))];
    return uniqueTopics;
  }

  // Calculate expiration timestamp
  calculateExpiration() {
    const now = new Date();
    now.setDate(now.getDate() + this.duration_days);
    return now.toISOString();
  }

  // Generate the payload to insert into 'posts' table
  toInsertPayload() {
    return {
      user_id: this.user_id,
      caption: this.caption,
      thumbnail_url: this.thumbnail_url,
      is_premium: this.is_premium,
      monetization_model: this.monetization_model,
      dm_fee: this.dm_fee,
      requires_subscription: this.requires_subscription,
      media_type: this.media_type,
      duration_days: this.duration_days,
      is_extended: this.is_extended,
      is_monetized: this.is_monetized,
      is_downloadable: this.is_downloadable,
      is_permanent: this.is_permanent,
      is_verified_post: this.is_verified_post,
      views: this.views,
      like_count: this.like_count,
      comment_count: this.comment_count,
      tokens_earned: this.tokens_earned,
      created_at: this.created_at,
      updated_at: this.updated_at,
      expires_at: this.expires_at
    };
  }
}
