import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



/**
 * Posts Functions
 */

// Create a new post
export const createPost = async (userId, content, imageUrl, isPremium, topics = []) => {
  try {
    // Step 1: Insert the post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content: content,
        image_url: imageUrl,
        is_premium: isPremium
      })
      .select('post_id')
      .single();
    
    if (postError) throw postError;
    
    // Step 2: Insert topics if available
    if (topics && topics.length > 0) {
      const topicInserts = topics.map(topic => ({
        post_id: postData.post_id,
        topic: topic
      }));
      
      const { error: topicError } = await supabase
        .from('post_topics')
        .insert(topicInserts);
        
      if (topicError) throw topicError;
    }
    
    return postData.post_id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// fetching all topics
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
    
    // Base query - select posts and join with users table
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
        )
      `)
      .range(startIndex, startIndex + pageSize - 1)
      .order('created_at', { ascending: false });
    
    // Apply feed type filters
    if (feedType === 'trending') {
      query = query.eq('is_trending', true);
    } else if (feedType === 'following' && userId) {
      // Get posts from users that the current user follows
      const { data: followingData } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', userId);
      
      const followingIds = followingData?.map(follow => follow.followed_id) || [];
      
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      } else {
        // Return empty array if not following anyone
        return [];
      }
    }
    
    // Execute the query
    const { data: posts, error } = await query;
    
    if (error) throw error;
    if (!posts) return [];
    
    // Format the author data
    const postsWithFormattedAuthors = posts.map(post => ({
      ...post,
      // author: post.author && post.author.length > 0 ? post.author[0] : null
    }));
    
    // If user is logged in, add liked/bookmarked status
    if (userId) {
      // Get user's likes
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postsWithFormattedAuthors.map(post => post.post_id));
      
      // Get user's bookmarks
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postsWithFormattedAuthors.map(post => post.post_id));
      
      const likedPostIds = new Set(likesData?.map(like => like.post_id) || []);
      const bookmarkedPostIds = new Set(bookmarksData?.map(bookmark => bookmark.post_id) || []);
      
      // Add like and bookmark status
      postsWithFormattedAuthors.forEach(post => {
        post.is_liked = likedPostIds.has(post.post_id);
        post.is_bookmarked = bookmarkedPostIds.has(post.post_id);
      });
    }
    
   // Get like counts - using count with filter instead of group by
  const likeCountsMap = {};
  for (const post of postsWithFormattedAuthors) {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.post_id);
    
    likeCountsMap[post.post_id] = count || 0;
  }

  // Add like counts
  postsWithFormattedAuthors.forEach(post => {
    post.like_count = likeCountsMap[post.post_id] || 0;
  });
    
    
    return postsWithFormattedAuthors;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
};

/**
 * Get user posts with filtering by type (media, premium, videos)
 * @param {string} userId - The user ID to fetch posts for
 * @param {number} page - Page number (starting at 1)
 * @param {number} pageSize - Number of items per page
 * @param {string} contentType - Filter type: 'media', 'premium', or 'videos'
 * @returns {Object} - Object containing posts array and total count
 */
export const getUserPosts = async (userId, page = 1, pageSize = 12, contentType = 'media') => {
  try {
    if (!userId) return { posts: [], count: 0 };
    
    const startIndex = (page - 1) * pageSize;
    
    // Base query - select posts with likes and comments count
    let query = supabase
      .from('posts')
      .select(`
        *
       
      `, { count: 'exact' })
      .eq('user_id', userId)
      .range(startIndex, startIndex + pageSize - 1)
      .order('created_at', { ascending: false });
    
    // Apply content type filters based on schema
    switch (contentType) {
      case 'media':
        // Get posts with images (non-video)
        // Assuming videos have URLs ending with common video extensions
        query = query.not('image_url', 'is', null)
                     .not('image_url', 'ilike', '%.mp4')
                     .not('image_url', 'ilike', '%.mov')
                     .not('image_url', 'ilike', '%.avi')
                     .not('image_url', 'ilike', '%.webm');
        break;
      
      case 'premium':
        // Get premium content - could be subscription-based or pay-per-view
        query = query.or('is_premium.eq.true,requires_subscription.eq.true,content_fee.gt.0');
        break;
      
      case 'videos':
        // Get only video posts by extension
        query = query.or('image_url.ilike.%.mp4,image_url.ilike.%.mov,image_url.ilike.%.avi,image_url.ilike.%.webm');
        break;
      
      default:
        // No filter
        break;
    }
    
    // Execute the query
    const { data: posts, error, count } = await query;
    
    if (error) throw error;
    if (!posts) return { posts: [], count: 0 };
    
    // Process the counts for each post
    const formattedPosts = posts.map(post => ({
      ...post,
      likes_count: post.likes_count?.[0]?.count || 0,
      comments_count: post.comments_count?.[0]?.count || 0
    }));
    
    // Check if current user has unlocked premium content
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    if (currentUserId && (contentType === 'premium' || formattedPosts.some(post => post.is_premium || post.requires_subscription || post.content_fee > 0))) {
      // Get user's unlocked posts
      const { data: unlocksData } = await supabase
        .from('content_unlocks')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', formattedPosts.map(post => post.post_id));
      
      // Get user's subscriptions
      const { data: subscriptionsData } = await supabase
        .from('user_subscriptions')
        .select('creator_id')
        .eq('subscriber_id', currentUserId)
        .eq('status', 'active');
      
      const unlockedPostIds = new Set(unlocksData?.map(unlock => unlock.post_id) || []);
      const subscribedCreatorIds = new Set(subscriptionsData?.map(sub => sub.creator_id) || []);
      
      // Add unlocked status to each post
      formattedPosts.forEach(post => {
        // Post is unlocked if:
        // 1. It's directly unlocked via content_unlocks
        // 2. User is subscribed to creator AND post requires subscription
        // 3. Post is not premium, doesn't require subscription, and has no content fee
        post.is_unlocked = 
          unlockedPostIds.has(post.post_id) || 
          (subscribedCreatorIds.has(post.user_id) && post.requires_subscription) ||
          (!post.is_premium && !post.requires_subscription && !post.content_fee);
      });
    } else {
      // If not premium content or no current user, mark all as unlocked
      formattedPosts.forEach(post => {
        post.is_unlocked = true;
      });
    }
    
    return { 
      posts: formattedPosts, 
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
    // Check if the user has already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    let action;
    
    if (existingLike) {
      // Unlike - delete the record
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
      action = 'unliked';
    } else {
      // Like - insert new record
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (insertError) throw insertError;
      action = 'liked';
    }
    
    // Get updated like count
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
    // Check if the user has already bookmarked this post
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
        
      if (deleteError) throw deleteError;
      return false; // Not bookmarked anymore
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (insertError) throw insertError;
      return true; // Now bookmarked
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
      .update({ 
        views: supabase.rpc('increment', { inc: 1 }) // Using RPC for atomic increment
      })
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

// Start or get a conversation
export const startConversation = async (initiatorId, recipientId, ratePerMsg) => {
  try {
    // Check if conversation already exists
    const { data: existingConvo, error: checkError } = await supabase
      .from('conversations')
      .select('conversation_id')
      .or(`initiator_id.eq.${initiatorId},recipient_id.eq.${initiatorId}`)
      .or(`initiator_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingConvo) {
      return existingConvo.conversation_id;
    }
    
    // Create new conversation
    const newConvoId = crypto.randomUUID();
    
    const { error: insertError } = await supabase
      .from('conversations')
      .insert({
        conversation_id: newConvoId,
        initiator_id: initiatorId,
        recipient_id: recipientId,
        rate_per_msg: ratePerMsg
      });
      
    if (insertError) throw insertError;
    
    return newConvoId;
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (conversationId, senderId, recipientId, content) => {
  try {
    const messageId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        message_id: messageId,
        conversation_id: conversationId,
        sender_id: senderId,
        recipient_id: recipientId,
        content: content
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Also update the conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date() })
      .eq('conversation_id', conversationId);
    
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Process payment for a message
export const processMessagePayment = async (messageId, payerId) => {
  try {
    // 1. Get message details including recipient and conversation rate
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select(`
        recipient_id,
        conversation:conversation_id (rate_per_msg)
      `)
      .eq('message_id', messageId)
      .single();
    
    if (msgError) throw msgError;
    
    const amount = message.conversation.rate_per_msg;
    const recipientId = message.recipient_id;
    
    // 2. Check if user has sufficient balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', payerId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance to make this payment');
    }
    
    // 3. Calculate platform fee (15%)
    const platformFee = amount * 0.15;
    const recipientAmount = amount - platformFee;
    
    // Start a transaction with multiple operations
    // Since Supabase doesn't support native transactions, we handle each step carefully
    
    // 3a. Create the transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: payerId,
        amount: -amount, // Negative for payer
        transaction_type: 'message_payment',
        status: 'completed',
        reference_id: messageId,
        description: `Payment for message ${messageId}`
      });
      
    if (txError) throw txError;
    
    // 3b. Deduct from payer's balance
    const { error: payerError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - amount 
      })
      .eq('user_id', payerId);
      
    if (payerError) throw payerError;
    
    // 3c. Add to recipient's balance
    const { error: recipientError } = await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { inc: recipientAmount }) 
      })
      .eq('user_id', recipientId);
      
    if (recipientError) throw recipientError;
    
    // 3d. Mark message as paid
    const { error: msgUpdateError } = await supabase
      .from('messages')
      .update({ is_paid: true })
      .eq('message_id', messageId);
      
    if (msgUpdateError) throw msgUpdateError;
    
    // 3e. Create payment record
    const paymentId = crypto.randomUUID();
    const { error: paymentError } = await supabase
      .from('message_payments')
      .insert({
        payment_id: paymentId,
        message_id: messageId,
        transaction_id: transactionId,
        amount: amount,
        platform_fee: platformFee
      });
      
    if (paymentError) throw paymentError;
    
    // Update user stats (earnings)
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { inc: recipientAmount }),
        current_month_earnings: supabase.rpc('increment', { inc: recipientAmount })
      })
      .eq('user_id', recipientId);
    
    return true;
  } catch (error) {
    console.error('Error processing message payment:', error);
    throw error;
  }
};

// Get user conversations
export const getUserConversations = async (userId) => {
  try {
    // Get all conversations where the user is either initiator or recipient
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
        initiator:initiator_id (
          user_id, 
          username, 
          name, 
          avatar_url
        ),
        recipient:recipient_id (
          user_id, 
          username, 
          name, 
          avatar_url
        )
      `)
      .or(`initiator_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the conversations for easier consumption
    const formattedConversations = await Promise.all(data.map(async conv => {
      // Determine the other user (not the current user)
      const otherUser = conv.initiator_id === userId ? conv.recipient : conv.initiator;
      
      // Get the last message
      const { data: lastMessage, error: msgError } = await supabase
        .from('messages')
        .select('content, created_at, sender_id, is_read')
        .eq('conversation_id', conv.conversation_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (msgError && msgError.code !== 'PGRST116') { // Not found is ok
        throw msgError;
      }
      
      // Count unread messages
      const { count: unreadCount, error: countError } = await supabase
        .from('messages')
        .select('message_id', { count: 'exact', head: true })
        .eq('conversation_id', conv.conversation_id)
        .eq('recipient_id', userId)
        .eq('is_read', false);
        
      if (countError) throw countError;
      
      return {
        conversation_id: conv.conversation_id,
        other_user: {
          user_id: otherUser.user_id,
          username: otherUser.username,
          name: otherUser.name,
          avatar_url: otherUser.avatar_url
        },
        last_message: lastMessage || null,
        unread_count: unreadCount || 0,
        updated_at: conv.updated_at,
        rate_per_msg: conv.rate_per_msg,
        status: conv.status
      };
    }));
    
    return formattedConversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationId, userId, page = 1, pageSize = 20) => {
  try {
    // Calculate pagination
    const startRow = (page - 1) * pageSize;
    
    // Get messages
    const { data, error } = await supabase
      .from('messages')
      .select(`
        message_id,
        sender_id,
        recipient_id,
        content,
        created_at,
        is_read,
        is_paid,
        sender:sender_id (
          username,
          name,
          avatar_url
        ),
        recipient:recipient_id (
          username,
          name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(startRow, startRow + pageSize - 1);
    
    if (error) throw error;
    
    // Mark retrieved messages as read if recipient is current user
    const messagesToMark = data
      .filter(msg => msg.recipient_id === userId && !msg.is_read)
      .map(msg => msg.message_id);
      
    if (messagesToMark.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('message_id', messagesToMark);
    }
    
    return data.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting conversation messages:', error);
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
    
    // Format response
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

// Rate a user
export const rateUser = async (raterId, ratedId, score, comment = null) => {
  try {
    const ratingId = crypto.randomUUID();
    
    // Check if rating already exists
    const { data: existingRating, error: checkError } = await supabase
      .from('ratings')
      .select('rating_id')
      .eq('rater_id', raterId)
      .eq('rated_id', ratedId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingRating) {
      // Update existing rating
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
      // Create new rating
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          rating_id: ratingId,
          rater_id: raterId,
          rated_id: ratedId,
          score: score,
          comment: comment
        });
        
      if (insertError) throw insertError;
    }
    
    // Update user's average rating
    const { data: ratings, error: avgError } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_id', ratedId);
      
    if (avgError) throw avgError;
    
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
      
      // Update user ratings
      await supabase
        .from('users')
        .update({ rating: avgRating })
        .eq('user_id', ratedId);
        
      // Update user stats
      await supabase
        .from('user_stats')
        .update({ avg_rating: avgRating })
        .eq('user_id', ratedId);
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
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        amount: amount,
        transaction_type: 'deposit',
        status: 'completed',
        description: description
      });
      
    if (txError) throw txError;
    
    // Update user balance
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { inc: amount }) 
      })
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
    // Check if user has sufficient balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance to make this withdrawal');
    }
    
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        amount: -amount,
        transaction_type: 'withdraw',
        status: 'completed',
        description: description
      });
      
    if (txError) throw txError;
    
    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - amount 
      })
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
    // Calculate pagination
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
    // Check if stats exist
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      return data;
    } else {
      // Create stats if they don't exist
      const statId = crypto.randomUUID();
      
      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({
          stat_id: statId,
          user_id: userId
        })
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
    const referralId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referral_id: referralId,
        referrer_id: referrerId,
        referred_email: referredEmail,
        bonus_amount: 10000, // Fixed bonus amount
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
    // Get post and creator info
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`user_id, content_fee`)
      .eq('post_id', postId)
      .single();
    
    if (postError) throw postError;
    
    const creatorId = post.user_id;
    const actualAmount = amount || post.content_fee;
    
    // Check if already unlocked
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
    
    // Check user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < actualAmount) {
      throw new Error('Insufficient balance to unlock content');
    }
    
    // Calculate platform fee (15%)
    const platformFee = actualAmount * 0.15;
    const creatorAmount = actualAmount - platformFee;
    
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        amount: -actualAmount,
        transaction_type: 'content_unlock',
        status: 'completed',
        reference_id: postId,
        to_user_id: creatorId,
        related_post_id: postId,
        description: `Unlocked premium content for post ${postId}`
      });
      
    if (txError) throw txError;
    
    // Deduct from user balance
    const { error: deductError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - actualAmount 
      })
      .eq('user_id', userId);
      
    if (deductError) throw deductError;
    
    // Add to creator balance
    const { error: creatorError } = await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { inc: creatorAmount }) 
      })
      .eq('user_id', creatorId);
      
    if (creatorError) throw creatorError;
    
    // Create unlock record
    const unlockId = crypto.randomUUID();
    const { error: unlockError } = await supabase
      .from('content_unlocks')
      .insert({
        unlock_id: unlockId,
        user_id: userId,
        post_id: postId,
        amount_paid: actualAmount
      });
      
    if (unlockError) throw unlockError;
    
    // Update user stats (earnings)
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { inc: creatorAmount }),
        current_month_earnings: supabase.rpc('increment', { inc: creatorAmount })
      })
      .eq('user_id', creatorId);
    
    return { success: true, unlock_id: unlockId };
  } catch (error) {
    console.error('Error unlocking premium content:', error);
    throw error;
  }
};

// Pay for content (generalized function that can handle different payment types)
export const payForContent = async (userId, postId, amount, creatorId) => {
  try {
    // Similar to unlockPremiumContent but more generic
    // Check user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance for this payment');
    }
    
    // Calculate platform fee (15%)
    const platformFee = amount * 0.15;
    const creatorAmount = amount - platformFee;
    
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        amount: -amount,
        transaction_type: 'content_payment',
        status: 'completed',
        reference_id: postId,
        to_user_id: creatorId,
        related_post_id: postId,
        description: `Payment for content ${postId}`
      });
      
    if (txError) throw txError;
    
    // Deduct from user balance
    const { error: deductError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - amount 
      })
      .eq('user_id', userId);
      
    if (deductError) throw deductError;
    
    // Add to creator balance
    const { error: creatorError } = await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { inc: creatorAmount }) 
      })
      .eq('user_id', creatorId);
      
    if (creatorError) throw creatorError;
    
    // Update user stats (earnings)
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { inc: creatorAmount }),
        current_month_earnings: supabase.rpc('increment', { inc: creatorAmount })
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
    // First find the other user in the conversation
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('initiator_id, recipient_id')
      .eq('conversation_id', conversationId)
      .single();
    
    if (convoError) throw convoError;
    
    const otherUserId = convo.initiator_id === userId ? convo.recipient_id : convo.initiator_id;
    
    // Check if there's dm access
    const { data: access, error: accessError } = await supabase
      .from('dm_access')
      .select('*')
      .eq('from_user_id', userId)
      .eq('to_user_id', otherUserId)
      .maybeSingle();
    
    if (accessError) throw accessError;
    
    if (!access) {
      // Also check if the other user requires payment for DMs
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

// Request DM access (pay for access)
export const requestDmAccess = async (fromId, toId, amount, postId = null) => {
  try {
    // Check user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', fromId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance for DM access');
    }
    
    // Calculate platform fee (15%)
    const platformFee = amount * 0.15;
    const recipientAmount = amount - platformFee;
    
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: fromId,
        amount: -amount,
        transaction_type: 'dm_access',
        status: 'completed',
        to_user_id: toId,
        reference_id: toId,
        related_post_id: postId,
        description: `DM access fee for ${toId}`
      });
      
    if (txError) throw txError;
    
    // Deduct from user balance
    const { error: deductError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - amount 
      })
      .eq('user_id', fromId);
      
    if (deductError) throw deductError;
    
    // Add to recipient balance
    const { error: recipientError } = await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { inc: recipientAmount }) 
      })
      .eq('user_id', toId);
      
    if (recipientError) throw recipientError;
    
    // Create or update DM access record
    const { data: existingAccess, error: checkError } = await supabase
      .from('dm_access')
      .select('access_id')
      .eq('from_user_id', fromId)
      .eq('to_user_id', toId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingAccess) {
      // Update existing access
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
      // Create new access
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
    
    // Update user stats (earnings)
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { inc: recipientAmount }),
        current_month_earnings: supabase.rpc('increment', { inc: recipientAmount })
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
export const createSubscription = async (subscriberId, creatorId, amount, duration = 30) => {
  try {
    // Check user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', subscriberId)
      .single();
      
    if (userError) throw userError;
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance for subscription');
    }
    
    // Calculate platform fee (15%)
    const platformFee = amount * 0.15;
    const creatorAmount = amount - platformFee;
    
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: subscriberId,
        amount: -amount,
        transaction_type: 'subscription',
        status: 'completed',
        to_user_id: creatorId,
        description: `${duration}-day subscription to ${creatorId}`
      });
      
    if (txError) throw txError;
    
    // Deduct from subscriber balance
    const { error: deductError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - amount 
      })
      .eq('user_id', subscriberId);
      
    if (deductError) throw deductError;
    
    // Add to creator balance
    const { error: creatorError } = await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { inc: creatorAmount }) 
      })
      .eq('user_id', creatorId);
      
    if (creatorError) throw creatorError;
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    
    // Check if subscription already exists
    const { data: existingSub, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('subscription_id')
      .eq('subscriber_user_id', subscriberId)
      .eq('creator_user_id', creatorId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          start_date: new Date(),
          end_date: endDate,
          subscription_amount: amount,
          is_active: true
        })
        .eq('subscription_id', existingSub.subscription_id);
        
      if (updateError) throw updateError;
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          subscriber_user_id: subscriberId,
          creator_user_id: creatorId,
          subscription_amount: amount,
          start_date: new Date(),
          end_date: endDate,
          is_active: true
        });
        
      if (insertError) throw insertError;
    }
    
    // Update user stats (earnings)
    await supabase
      .from('user_stats')
      .update({ 
        total_earnings: supabase.rpc('increment', { inc: creatorAmount }),
        current_month_earnings: supabase.rpc('increment', { inc: creatorAmount })
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