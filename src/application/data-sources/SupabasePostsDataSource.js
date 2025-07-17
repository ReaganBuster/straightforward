import { supabase } from '@infrastructure/config/supabase';

export class SupabasePostsDataSource {
  async createPost(
    userId,
    caption,
    thumbnailUrl = null,
    isPremium = false,
    monetizationModel = null,
    dmFee = null,
    requiresSubscription = false,
    mediaType = null,
    durationDays = 7,
    isExtended = false,
    isMonetized = false,
    isDownloadable = false,
    isPermanent = false,
    isVerifiedPost = false
  ) {
    try {
      // Step 1: Extract unique hashtags from caption
      const hashtagRegex = /#(\w+)/g;
      const matches = [...caption.matchAll(hashtagRegex)];
      const topics = [...new Set(matches.map(match => match[1].toLowerCase()))];

      // Step 2: Insert into 'posts' table
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          caption,
          thumbnail_url: thumbnailUrl,
          is_premium: isPremium,
          monetization_model: monetizationModel,
          dm_fee: dmFee,
          requires_subscription: requiresSubscription,
          media_type: mediaType,
          duration_days: durationDays,
          is_extended: isExtended,
          is_monetized: isMonetized,
          is_downloadable: isDownloadable,
          is_permanent: isPermanent,
          is_verified_post: isVerifiedPost
        })
        .select('post_id')
        .single();

      if (postError) {
        console.error('Error inserting post:', postError);
        throw postError;
      }

      const postId = postData.post_id;

      // Step 3: Insert topics into 'post_topics' table
      if (topics.length > 0) {
        const topicRows = topics.map(topic => ({
          post_id: postId,
          topic
        }));

        const { error: topicError } = await supabase
          .from('post_topics')
          .insert(topicRows);

        if (topicError) {
          console.error('Error inserting topics:', topicError);
          throw topicError;
        }
      }

      return postId;
    } catch (err) {
      console.error('createPost failed:', err);
      throw err;
    }
  }

  // Fetch all posts with author details
  async fetchAllPosts(page = 1, pageSize = 10) {
    const startIndex = (page - 1) * pageSize;
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:users(*)
      `
      )
      .range(startIndex, startIndex + pageSize - 1)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    return data || [];
  }

  // Fetch posts by post_id
  async fetchPostsById(postId) {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:users(*)
        `
      )
      .eq('post_id', postId)
      .single();
    if (error) throw error;
    return data;
  }


  // Fetch all posts for a specific user
  async fetchPostsByUserId(userId) {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:users(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Update a post using post_id (not id)
  async updatePost(postId, updates) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString() // ensure updated_at is refreshed
      })
      .eq('post_id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a post by post_id
  async deletePost(postId) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('post_id', postId);

    if (error) throw error;
  }

  // Increment post views
  async incrementPostViews(postId, userId) {
    const { data, error } = await supabase
      .from('post_views')
      .insert({ post_id: postId, user_id: userId })
      .onConflict('post_id, user_id') // respects the unique constraint
      .ignore()
      .select()
      .single();

    if (error) throw error;
    return data; // data will be null if duplicate
  }

  // Toggle like on a post
   async togglePostLike (userId, postId) {
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
        const { error: insertError } = await supabase.from('post_likes').insert({
          post_id: postId,
          user_id: userId,
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
        like_count: count || 0,
      };
    } catch (error) {
      console.error('Error toggling post like:', error);
      throw error;
    }
  };

  // Toggle bookmark on a post
  async togglePostBookmark (userId, postId) {
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
        const { error: insertError } = await supabase.from('bookmarks').insert({
          post_id: postId,
          user_id: userId,
        });
  
        if (insertError) throw insertError;
        return true;
      }
    } catch (error) {
      console.error('Error toggling post bookmark:', error);
      throw error;
    }
  };


  async ratePost(postId, userId, score, comment = null) {
    // Sanitize score (optional safety check)
    const rating = Math.max(0, Math.min(5, parseFloat(score.toFixed(1))));

    const { data, error } = await supabase
      .from('ratings')
      .upsert(
        {
          rated_id: postId,
          rater_id: userId,
          score: rating,
          comment: comment
        },
        {
          onConflict: ['post_id', 'user_id'] // ensures update if rating already exists
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Rating failed:', error);
      throw error;
    }

    return data;
  }

}