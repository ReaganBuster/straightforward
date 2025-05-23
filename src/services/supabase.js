import { createClient } from '@supabase/supabase-js';
import { v5 as uuidv5 } from 'uuid';

const MY_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Use a fixed UUID namespace

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Posts Functions
 */

// Create a new post
export const createPost = async (
  userId,
  content,
  imageUrl,
  isPremium,
  topics = [],
  monetizationModel = null,
  dmFee = null,
  requiresSubscription = false,
  contentType,
  articleTitle,
  // articlePreview,
  articleContent,
  articlePages,
  articleFormat,
  articleFileUrl,
  audioTitle,
  audioTracks,
  videoTitle,
  videoThumbnailUrl,
  videoUrl,
  videoDuration,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  productTitle,
  productPrice,
  productImageUrl,
  productVariants,
  productStockStatus,
  galleryTitle,
  galleryTotalImages,
  galleryImages,
  monetizationRequired
) => {
  try {
    let fullContentId = null;

    // Log all content-related fields to see what’s being passed
    console.log('Content-related fields:', {
      contentType,
      articleTitle,
      articleContent,
      articlePages,
      articleFormat,
      articleFileUrl,
      audioTitle,
      audioTracks,
      videoTitle,
      videoThumbnailUrl,
      videoUrl,
      videoDuration,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      productTitle,
      productPrice,
      productImageUrl,
      productVariants,
      productStockStatus,
      galleryTitle,
      galleryTotalImages,
      galleryImages,
      monetizationRequired
    });

    // Always insert into the content table if there's relevant content data
    const hasContentData = contentType || articleTitle || articleContent || articlePages ||
      articleFormat || articleFileUrl || audioTitle || audioTracks || videoTitle || videoThumbnailUrl ||
      videoUrl || videoDuration || eventTitle || eventDate || eventTime || eventLocation || productTitle ||
      productPrice || productImageUrl || productVariants || productStockStatus || galleryTitle ||
      galleryTotalImages || galleryImages;

    console.log('hasContentData:', hasContentData);

    if (hasContentData) {
      const contentDataToInsert = {
        content_type: contentType || null,
        article_title: articleTitle || null,
        // article_preview: articlePreview || null,
        article_content: articleContent || null,
        article_pages: articlePages || 0,
        article_format: articleFormat || null,
        article_file_url: articleFileUrl || null,
        audio_title: audioTitle || null,
        audio_tracks: audioTracks || null,
        video_title: videoTitle || null,
        video_thumbnail_url: videoThumbnailUrl || null,
        video_url: videoUrl || null,
        video_duration: videoDuration || null,
        event_title: eventTitle || null,
        event_date: eventDate || null,
        event_time: eventTime || null,
        event_location: eventLocation || null,
        product_title: productTitle || null,
        product_price: productPrice || null,
        product_image_url: productImageUrl || null,
        product_variants: productVariants || null,
        product_stock_status: productStockStatus || null,
        gallery_title: galleryTitle || null,
        gallery_total_images: galleryTotalImages || null,
        gallery_images: galleryImages || null,
        monetization_required: monetizationRequired !== undefined ? monetizationRequired : !!monetizationModel
      };

      console.log('Inserting into content table:', contentDataToInsert);

      const contentResponse = await supabase
        .from('content')
        .insert(contentDataToInsert)
        .select('content_id')
        .single();

      if (contentResponse.error) {
        console.error('Content insertion error:', contentResponse.error);
        throw contentResponse.error;
      }
      fullContentId = contentResponse.data.content_id;
      console.log('Content inserted, fullContentId:', fullContentId);
    } else {
      console.log('No content data to insert into content table.');
    }

    const postResponse = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        caption: content,
        thumbnail_url: imageUrl,
        is_premium: isPremium,
        monetization_model: monetizationModel,
        dm_fee: dmFee || null,
        requires_subscription: requiresSubscription,
        full_content_id: fullContentId
      })
      .select('post_id')
      .single();
    
    if (postResponse.error) {
      console.error('Post insertion error:', postResponse.error);
      throw postResponse.error;
    }
    
    if (topics && topics.length > 0) {
      const topicInserts = topics.map(topic => ({
        post_id: postResponse.data.post_id,
        topic: topic
      }));
      
      const topicResponse = await supabase
        .from('post_topics')
        .insert(topicInserts);
        
      if (topicResponse.error) {
        console.error('Topic insertion error:', topicResponse.error);
        throw topicResponse.error;
      }
    }
    
    return postResponse.data.post_id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Fetching all topics
export const getTopics = async () => {
  try {
    const { data, error } = await supabase
      .from('post_topics')
      .select('topic')
      .order('topic')
      .limit(20);
    
    if (error) throw error;
    
    // Extract unique topics
    const uniqueTopics = [...new Set(data.map(item => item.topic))];
    return uniqueTopics;
  } catch (error) {
    console.error('Error getting topics:', error);
    throw error;
  }
};

// Get feed posts (discover, premium, or trending)
export const getFeedPosts = async (userId, page = 1, pageSize = 10, feedType = 'discover') => {
  try {
    const startIndex = (page - 1) * pageSize;
    
    // Base query - select posts and join with users and content tables
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(
          user_id, 
          username, 
          name, 
          avatar_url, 
          is_verified, 
          expertise, 
          rate_per_msg, 
          response_rate, 
          avg_response_time, 
          rating,
          currency
        ),
        content:full_content_id( 
          content_id, 
          content_type, 
          article_title, 
          article_content, 
          article_pages, 
          article_format, 
          article_file_url, 
          audio_title, 
          audio_tracks, 
          video_title, 
          video_duration, 
          video_thumbnail_url, 
          video_url, 
          event_title, 
          event_date, 
          event_time, 
          event_location, 
          event_confirmation_code, 
          event_qr_code_url, 
          product_title, 
          product_price, 
          product_image_url, 
          product_variants, 
          product_stock_status, 
          gallery_title, 
          gallery_total_images, 
          gallery_images, 
          poll_question, 
          poll_ends_at, 
          poll_options, 
          poll_total_votes, 
          subscription_title, 
          subscription_price, 
          subscription_billing_frequency, 
          subscription_benefits, 
          monetization_required )
      `)
      .range(startIndex, startIndex + pageSize - 1)
      .order('created_at', { ascending: false });
    
    // Apply feed type filters
    if (feedType === 'trending') {
      query = query.eq('is_trending', true);
    } else if (feedType === 'following' && userId) {
      // Get posts from users that the current user follows (assumes a follows table exists)
      const { data: followingData } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', userId);
      
      const followingIds = followingData?.map(follow => follow.followed_id) || [];
      
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      } else {
        return [];
      }
    }
    
    // Execute the query
    const { data: posts, error } = await query;
    
    if (error) throw error;
    if (!posts) return [];
    
    // If user is logged in, add liked/bookmarked status
    if (userId) {
      // Get user's likes
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', posts.map(post => post.post_id));
      
      // Get user's bookmarks
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', posts.map(post => post.post_id));
      
      const likedPostIds = new Set(likesData?.map(like => like.post_id) || []);
      const bookmarkedPostIds = new Set(bookmarksData?.map(bookmark => bookmark.post_id) || []);
      
      // Add like and bookmark status
      posts.forEach(post => {
        post.is_liked = likedPostIds.has(post.post_id);
        post.is_bookmarked = bookmarkedPostIds.has(post.post_id);
      });
    }
    
    // Get like counts
    const likeCountsMap = {};
    for (const post of posts) {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.post_id);
    
      likeCountsMap[post.post_id] = count || 0;
    }

    // Add like counts
    posts.forEach(post => {
      post.like_count = likeCountsMap[post.post_id] || 0;
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
};

// Get user posts with filtering by type (media, premium, videos)
export const getUserPosts = async (userId, page = 1, pageSize = 12, contentType = 'all') => {
  try {
    if (!userId) return { posts: [], count: 0 };
    
    const startIndex = (page - 1) * pageSize;
    
    // Base query - select posts with content details
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(
          user_id, 
          username, 
          name, 
          avatar_url, 
          is_verified, 
          expertise, 
          rate_per_msg, 
          response_rate, 
          avg_response_time, 
          rating,
          currency
        ),
        content:full_content_id (
          content_id, 
          content_type, 
          article_title, 
          article_content, 
          article_pages, 
          article_format, 
          article_file_url, 
          audio_title, 
          audio_tracks, 
          video_title, 
          video_duration, 
          video_thumbnail_url, 
          video_url, 
          event_title, 
          event_date, 
          event_time, 
          event_location, 
          event_confirmation_code, 
          event_qr_code_url, 
          product_title, 
          product_price, 
          product_image_url, 
          product_variants, 
          product_stock_status, 
          gallery_title, 
          gallery_total_images, 
          gallery_images, 
          poll_question, 
          poll_ends_at, 
          poll_options, 
          poll_total_votes, 
          subscription_title, 
          subscription_price, 
          subscription_billing_frequency, 
          subscription_benefits, 
          monetization_required 
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .range(startIndex, startIndex + pageSize - 1)
      .order('created_at', { ascending: false });
    
    // Apply content type filters based on new schema
    switch (contentType) {
      case 'monetized':
        query = query.gt('dm_fee', 0);
        break;
      case 'free':
        query = query.eq('dm_fee', 0)
                     .or('dm_fee.is.null');
        break;
      case 'all':
      default:
        // No additional filter for 'all'
        break;
    }
    
    // Execute the query
    const { data: posts, error, count } = await query;
    
    if (error) throw error;
    if (!posts) return { posts: [], count: 0 };
    
    // Check if current user has unlocked premium content
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    if (currentUserId && posts.some(post => post.dm_fee > 0 || post.requires_subscription || post.content?.monetization_required)) {
      // Get user's unlocked posts
      const { data: unlocksData } = await supabase
        .from('content_unlocks')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', posts.map(post => post.post_id));
      
      // Get user's subscriptions
      const { data: subscriptionsData } = await supabase
        .from('user_subscriptions')
        .select('creator_user_id')
        .eq('subscriber_user_id', currentUserId)
        .eq('is_active', true);
      
      const unlockedPostIds = new Set(unlocksData?.map(unlock => unlock.post_id) || []);
      const subscribedCreatorIds = new Set(subscriptionsData?.map(sub => sub.creator_user_id) || []);
      
      // Add unlocked status to each post
      posts.forEach(post => {
        post.is_unlocked = 
          unlockedPostIds.has(post.post_id) || 
          (subscribedCreatorIds.has(post.user_id) && post.requires_subscription) ||
          (post.dm_fee === null && !post.requires_subscription && !post.content?.monetization_required);
      });
    } else {
      posts.forEach(post => {
        post.is_unlocked = true;
      });
    }
    
    return { 
      posts, 
      count,
      hasMore: count > (page * pageSize)
    };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new Error('Failed to fetch user posts');
  }
};

// Toggle like on a post
export const togglePostLike = async (userId, postId) => {
  try {
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    let action;
    
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
      action = 'unliked';
    } else {
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (insertError) throw insertError;
      action = 'liked';
    }
    
    const { count, error: countError } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (countError) throw countError;
    
    return {
      is_liked: action === 'liked',
      like_count: count || 0
    };
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Toggle bookmark on a post
export const togglePostBookmark = async (userId, postId) => {
  try {
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingBookmark) {
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
        
      if (deleteError) throw deleteError;
      return false;
    } else {
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (insertError) throw insertError;
      return true;
    }
  } catch (error) {
    console.error('Error toggling post bookmark:', error);
    throw error;
  }
};

// Add view to a post
export const addPostView = async (postId) => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ views: supabase.rpc('increment', { x: 1, row: 'views' }) })
      .eq('post_id', postId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding post view:', error);
    throw error;
  }
};

/**
 * Messaging Functions
 */

// Helper function to get or create a conversation_id (already exists as startConversation)
export const startConversation = async (initiatorId, recipientId, ratePerMsg = 0) => {
  try {
    // Sort the IDs to ensure the conversation_id is deterministic
    const sortedIds = [initiatorId, recipientId].sort();
    const conversationIdString = `${sortedIds[0]}-${sortedIds[1]}`;
    
    // Generate a UUID v5 based on the sorted IDs
    const conversationId = uuidv5(conversationIdString, MY_NAMESPACE);

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
          rate_per_msg: ratePerMsg,
          created_at: new Date().toISOString(), // Ensure created_at is set
          updated_at: new Date().toISOString(), // Ensure updated_at is set
        },
        {
          onConflict: 'conversation_id', // Specify the conflict target (primary key)
          ignoreDuplicates: false, // Ensure we get the existing record on conflict
        }
      )
      .select('conversation_id, rate_per_msg')
      .single();

    if (error) throw error;

    return { conversation_id: data.conversation_id, rate_per_msg: data.rate_per_msg };
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (initiatorId, recipientId, senderId, content, replyToMessageId = null, ratePerMsg = 0) => {
  try {
    // Get or create the conversation
    const { conversation_id: conversationId, rate_per_msg: ratePerMsgFromDb } = await startConversation(initiatorId, recipientId, ratePerMsg);

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
export const getConversationMessages = async (initiatorId, recipientId, userId, page = 1, pageSize = 20) => {
  try {
    // Get or create the conversation
    const { conversation_id: conversationId } = await startConversation(initiatorId, recipientId);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('direct_messages')
      .select(`
        message_id,
        from_user_id,
        to_user_id,
        message,
        created_at,
        is_read,
        content_type,
        reply_to_message_id,
        conversation_id
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return data.map(msg => ({
      message_id: msg.message_id,
      sender_id: msg.from_user_id,
      content: msg.message,
      created_at: msg.created_at,
      is_read: msg.is_read,
      content_type: msg.content_type,
      reply_to_message_id: msg.reply_to_message_id,
      is_current_user: msg.from_user_id === userId,
      conversation_id: conversationId, // Optionally include for reference
    })).reverse(); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Fetch user conversations (unchanged, already handles conversation_id internally)
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        conversation_id,
        initiator_id,
        recipient_id,
        created_at,
        updated_at,
        rate_per_msg,
        status,
        initiator:initiator_id (user_id, username, name, avatar_url),
        recipient:recipient_id (user_id, username, name, avatar_url)
      `)
      .or(`initiator_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map(convo => ({
      conversation_id: convo.conversation_id,
      other_user: convo.initiator_id === userId ? convo.recipient : convo.initiator,
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

/**
 * Experts & Rating Functions
 */

// Get top earning experts
export const getTopEarningExperts = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        total_earnings,
        avg_rating,
        users:user_id (
          username,
          name,
          avatar_url,
          expertise,
          rate_per_msg,
          response_rate
        )
      `)
      .order('total_earnings', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(expert => ({
      user_id: expert.user_id,
      username: expert.users.username,
      name: expert.users.name,
      avatar_url: expert.users.avatar_url,
      expertise: expert.users.expertise,
      rate_per_msg: expert.users.rate_per_msg,
      response_rate: expert.users.response_rate,
      total_earnings: expert.total_earnings,
      avg_rating: expert.avg_rating
    }));
  } catch (error) {
    console.error('Error getting top experts:', error);
    throw error;
  }
};

// Rate a user or post
export const rateUser = async (raterId, ratedId, score, comment = null) => {
  try {
    const { data: existingRating, error: checkError } = await supabase
      .from('ratings')
      .select('rating_id')
      .eq('rater_id', raterId)
      .eq('rated_id', ratedId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingRating) {
      const { error: updateError } = await supabase
        .from('ratings')
        .update({
          score: score,
          comment: comment,
          created_at: new Date()
        })
        .eq('rating_id', existingRating.rating_id);
        
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          rater_id: raterId,
          rated_id: ratedId,
          score: score,
          comment: comment
        });
        
      if (insertError) throw insertError;
    }
    
    const { data: ratings, error: avgError } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_id', ratedId);
      
    if (avgError) throw avgError;
    
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
      
      // Check if rated_id is a user or post (assuming rated_id matches user_id or post_id)
      const { data: userCheck } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', ratedId)
        .maybeSingle();
      
      if (userCheck) {
        await supabase
          .from('users')
          .update({ rating: avgRating })
          .eq('user_id', ratedId);
        
        await supabase
          .from('user_stats')
          .update({ avg_rating: avgRating })
          .eq('user_id', ratedId);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error rating user:', error);
    throw error;
  }
};

/**
 * Wallet & Transactions Functions
 */

// Add funds to user balance
export const addUserFunds = async (userId, amount, description = 'Deposit') => {
  try {
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: 'deposit',
        status: 'completed',
        description: description
      });
      
    if (txError) throw txError;
    
    const { error: userError } = await supabase
      .from('users')
      .update({ balance: supabase.rpc('increment', { x: amount, row: 'balance' }) })
      .eq('user_id', userId);
      
    if (userError) throw userError;
    
    return true;
  } catch (error) {
    console.error('Error adding funds:', error);
    throw error;
  }
};

// Withdraw funds from user balance
export const withdrawUserFunds = async (userId, amount, description = 'Withdrawal') => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance to make this withdrawal');
    }
    
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: 'withdraw',
        status: 'completed',
        description: description
      });
      
    if (txError) throw txError;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: user.balance - amount })
      .eq('user_id', userId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
};

// Get user transactions
export const getUserTransactions = async (userId, page = 1, pageSize = 20) => {
  try {
    const startRow = (page - 1) * pageSize;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(startRow, startRow + pageSize - 1);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      return data;
    } else {
      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({ user_id: userId })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return newStats;
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

/**
 * Referral Functions
 */

// Create a referral
export const createReferral = async (referrerId, referredEmail) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredEmail, // Adjust based on actual schema
        bonus_amount: 10000,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data.referral_id;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
};

/**
 * Premium Content Functions
 */

// Unlock premium content
export const unlockPremiumContent = async (userId, postId, amount) => {
  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('post_id', postId)
      .single();
    
    if (postError) throw postError;
    
    const creatorId = post.user_id;
    
    const { data: existingUnlock, error: checkError } = await supabase
      .from('content_unlocks')
      .select('unlock_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingUnlock) {
      return { success: true, already_unlocked: true };
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance to unlock content');
    }
    
    const platformFee = amount * 0.15;
    const creatorAmount = amount - platformFee;
    
    const { error: txError } = await supabase
      .from('monetization_transactions')
      .insert({
        from_user_id: userId,
        to_user_id: creatorId,
        monetization_type_id: 2, // Assuming type_id 2 is for content unlock
        amount: amount,
        platform_fee: platformFee,
        reference_id: postId,
        reference_type: 'content_unlock'
      });
      
    if (txError) throw txError;
    
    const { error: deductError } = await supabase
      .from('users')
      .update({ balance: user.balance - amount })
      .eq('user_id', userId);
      
    if (deductError) throw deductError;
    
    const { error: creatorError } = await supabase
      .from('users')
      .update({ balance: supabase.rpc('increment', { x: creatorAmount, row: 'balance' }) })
      .eq('user_id', creatorId);
      
    if (creatorError) throw creatorError;
    
    const { error: unlockError } = await supabase
      .from('content_unlocks')
      .insert({
        user_id: userId,
        post_id: postId,
        amount_paid: amount
      });
      
    if (unlockError) throw unlockError;
    
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { x: creatorAmount, row: 'total_earnings' }),
        current_month_earnings: supabase.rpc('increment', { x: creatorAmount, row: 'current_month_earnings' })
      })
      .eq('user_id', creatorId);
    
    return { success: true };
  } catch (error) {
    console.error('Error unlocking premium content:', error);
    throw error;
  }
};

// Pay for content
export const payForContent = async (userId, postId, amount, creatorId) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance for this payment');
    }
    
    const platformFee = amount * 0.15;
    const creatorAmount = amount - platformFee;
    
    const { error: txError } = await supabase
      .from('monetization_transactions')
      .insert({
        from_user_id: userId,
        to_user_id: creatorId,
        monetization_type_id: 3, // Assuming type_id 3 is for content payment
        amount: amount,
        platform_fee: platformFee,
        reference_id: postId,
        reference_type: 'content_payment'
      });
      
    if (txError) throw txError;
    
    const { error: deductError } = await supabase
      .from('users')
      .update({ balance: user.balance - amount })
      .eq('user_id', userId);
      
    if (deductError) throw deductError;
    
    const { error: creatorError } = await supabase
      .from('users')
      .update({ balance: supabase.rpc('increment', { x: creatorAmount, row: 'balance' }) })
      .eq('user_id', creatorId);
      
    if (creatorError) throw creatorError;
    
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { x: creatorAmount, row: 'total_earnings' }),
        current_month_earnings: supabase.rpc('increment', { x: creatorAmount, row: 'current_month_earnings' })
      })
      .eq('user_id', creatorId);
    
    return true;
  } catch (error) {
    console.error('Error processing content payment:', error);
    throw error;
  }
};

/**
 * DM Access Functions
 */

// Check if user has DM access to another user
export const checkDmAccess = async (conversationId, userId) => {
  try {
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('initiator_id, recipient_id')
      .eq('conversation_id', conversationId)
      .single();
    
    if (convoError) throw convoError;
    
    const otherUserId = convo.initiator_id === userId ? convo.recipient_id : convo.initiator_id;
    
    const { data: access, error: accessError } = await supabase
      .from('dm_access')
      .select('has_access, paid_amount')
      .eq('from_user_id', userId)
      .eq('to_user_id', otherUserId)
      .maybeSingle();
    
    if (accessError) throw accessError;
    
    if (!access) {
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('requires_payment_for_dm, dm_fee')
        .eq('user_id', otherUserId)
        .maybeSingle();
      
      if (settingsError) throw settingsError;
      
      return { 
        has_access: !settings?.requires_payment_for_dm, 
        required_fee: settings?.requires_payment_for_dm ? settings.dm_fee : 0
      };
    }
    
    return {
      has_access: access.has_access,
      paid_amount: access.paid_amount
    };
  } catch (error) {
    console.error('Error checking DM access:', error);
    throw error;
  }
};

// Request DM access
export const requestDmAccess = async (fromId, toId, amount, postId = null) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', fromId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance for DM access');
    }
    
    const platformFee = amount * 0.15;
    const recipientAmount = amount - platformFee;
    
    const { error: txError } = await supabase
      .from('monetization_transactions')
      .insert({
        from_user_id: fromId,
        to_user_id: toId,
        monetization_type_id: 4, // Assuming type_id 4 is for DM access
        amount: amount,
        platform_fee: platformFee,
        reference_id: toId,
        reference_type: 'dm_access'
      });
      
    if (txError) throw txError;
    
    const { error: deductError } = await supabase
      .from('users')
      .update({ balance: user.balance - amount })
      .eq('user_id', fromId);
      
    if (deductError) throw deductError;
    
    const { error: recipientError } = await supabase
      .from('users')
      .update({ balance: supabase.rpc('increment', { x: recipientAmount, row: 'balance' }) })
      .eq('user_id', toId);
      
    if (recipientError) throw recipientError;
    
    const { data: existingAccess, error: checkError } = await supabase
      .from('dm_access')
      .select('access_id')
      .eq('from_user_id', fromId)
      .eq('to_user_id', toId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingAccess) {
      const { error: updateError } = await supabase
        .from('dm_access')
        .update({
          has_access: true,
          paid_amount: amount,
          post_id: postId
        })
        .eq('access_id', existingAccess.access_id);
        
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('dm_access')
        .insert({
          from_user_id: fromId,
          to_user_id: toId,
          has_access: true,
          paid_amount: amount,
          post_id: postId
        });
        
      if (insertError) throw insertError;
    }
    
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { x: recipientAmount, row: 'total_earnings' }),
        current_month_earnings: supabase.rpc('increment', { x: recipientAmount, row: 'current_month_earnings' })
      })
      .eq('user_id', toId);
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting DM access:', error);
    throw error;
  }
};

/**
 * Subscription Functions
 */

// Create a subscription
export const createSubscription = async (subscriberId, creatorId, amount, duration = 30, tierId = null) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', subscriberId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance for subscription');
    }
    
    const platformFee = amount * 0.15;
    const creatorAmount = amount - platformFee;
    
    const { error: txError } = await supabase
      .from('monetization_transactions')
      .insert({
        from_user_id: subscriberId,
        to_user_id: creatorId,
        monetization_type_id: 5, // Assuming type_id 5 is for subscription
        amount: amount,
        platform_fee: platformFee,
        reference_id: creatorId,
        reference_type: 'subscription'
      });
      
    if (txError) throw txError;
    
    const { error: deductError } = await supabase
      .from('users')
      .update({ balance: user.balance - amount })
      .eq('user_id', subscriberId);
      
    if (deductError) throw deductError;
    
    const { error: creatorError } = await supabase
      .from('users')
      .update({ balance: supabase.rpc('increment', { x: creatorAmount, row: 'balance' }) })
      .eq('user_id', creatorId);
      
    if (creatorError) throw creatorError;
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    
    const { data: existingSub, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('subscription_id')
      .eq('subscriber_user_id', subscriberId)
      .eq('creator_user_id', creatorId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingSub) {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          start_date: new Date(),
          end_date: endDate,
          subscription_amount: amount,
          is_active: true,
          tier_id: tierId
        })
        .eq('subscription_id', existingSub.subscription_id);
        
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          subscriber_user_id: subscriberId,
          creator_user_id: creatorId,
          subscription_amount: amount,
          start_date: new Date(),
          end_date: endDate,
          is_active: true,
          tier_id: tierId
        });
        
      if (insertError) throw insertError;
    }
    
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { x: creatorAmount, row: 'total_earnings' }),
        current_month_earnings: supabase.rpc('increment', { x: creatorAmount, row: 'current_month_earnings' })
      })
      .eq('user_id', creatorId);
    
    return true;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get user's active subscriptions
export const getUserSubscriptions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_id,
        subscription_amount,
        start_date,
        end_date,
        is_active,
        creator:creator_user_id (
          user_id,
          username,
          name,
          avatar_url,
          expertise
        ),
        tier:tier_id (
          tier_name,
          tier_level,
          benefits
        )
      `)
      .eq('subscriber_user_id', userId)
      .eq('is_active', true)
      .order('end_date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    throw error;
  }
};

// Get user's subscribers
export const getUserSubscribers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_id,
        subscription_amount,
        start_date,
        end_date,
        is_active,
        subscriber:subscriber_user_id (
          user_id,
          username,
          name,
          avatar_url
        ),
        tier:tier_id (
          tier_name,
          tier_level,
          benefits
        )
      `)
      .eq('creator_user_id', userId)
      .eq('is_active', true)
      .order('end_date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user subscribers:', error);
    throw error;
  }
};

// Check if user has active subscription to a creator
export const checkActiveSubscription = async (userId, creatorId) => {
  try {
    const now = new Date();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('subscription_id')
      .eq('subscriber_user_id', userId)
      .eq('creator_user_id', creatorId)
      .eq('is_active', true)
      .gt('end_date', now.toISOString())
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
};

/**
 * New Queries
 */

// Get detailed content for a post
export const getPostContent = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        full_content_id,
        content:full_content_id (*)
      `)
      .eq('post_id', postId)
      .single();
    
    if (error) throw error;
    return data.content;
  } catch (error) {
    console.error('Error fetching post content:', error);
    throw error;
  }
};

// Get subscription tiers for a creator
export const getSubscriptionTiers = async (creatorId) => {
  try {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('creator_user_id', creatorId)
      .eq('is_active', true)
      .order('tier_level', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    throw error;
  }
};

// Get monetization analytics for a user
export const getMonetizationAnalytics = async (userId, datePeriod) => {
  try {
    const { data, error } = await supabase
      .from('monetization_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date_period', datePeriod)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching monetization analytics:', error);
    throw error;
  }
};