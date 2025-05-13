import { useState, useEffect, useCallback } from 'react';
import * as supabaseQueries from '../services/supabase';
import * as supabaseAuthQueries from '../services/authenticationService';

// Auth hook - Keep as is
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await supabaseAuthQueries.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      const result = await supabaseAuthQueries.signUpUser(email, password, fullName);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await supabaseAuthQueries.signInUser(email, password);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabaseAuthQueries.signOutUser();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signUp, signIn, signOut };
};

// Profile hook - Keep as is
export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const profileData = await supabaseAuthQueries.getUserProfile(userId);
        setProfile(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const updatedProfile = await supabaseQueries.updateUserProfile(userId, profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
};

// Updated Feed Posts hook to include content unlocking
export const useFeedPosts = (userId, initialFeedType = 'discover') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [feedType, setFeedType] = useState(initialFeedType);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchPosts = useCallback(async (pageNum = 1, type = feedType) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const pageSize = 10;
      const postsData = await supabaseQueries.getFeedPosts(userId, pageNum, pageSize, type);
      
      if (pageNum === 1) {
        setPosts(postsData);
      } else {
        setPosts(prev => [...prev, ...postsData]);
      }
      
      setHasMore(postsData.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, feedType]);

  useEffect(() => {
    fetchPosts(1, feedType);
  }, [userId, feedType, fetchPosts]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
    fetchPosts(page + 1);
  };

  const changeFeedType = (newType) => {
    if (newType !== feedType) {
      setFeedType(newType);
      setPage(1);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const result = await supabaseQueries.togglePostLike(userId, postId);
      
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.post_id === postId 
            ? { 
                ...post, 
                is_liked: result.is_liked, 
                like_count: parseInt(result.like_count) 
              } 
            : post
        )
      );
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleBookmark = async (postId) => {
    try {
      const isBookmarked = await supabaseQueries.togglePostBookmark(userId, postId);
      
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.post_id === postId 
            ? { ...post, is_bookmarked: isBookmarked } 
            : post
        )
      );
      
      return isBookmarked;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addView = async (postId) => {
    try {
      await supabaseQueries.addPostView(postId);
      
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.post_id === postId 
            ? { ...post, views: post.views + 1 } 
            : post
        )
      );
    } catch (err) {
      console.error('Error adding view:', err);
    }
  };

  // New method to unlock premium content
  const unlockContent = async (postId, amount) => {
    try {
      const result = await supabaseQueries.unlockPremiumContent(userId, postId, amount);
      
      if (result.success) {
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.post_id === postId 
              ? { ...post, is_unlocked: true } 
              : post
          )
        );
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return { 
    posts, 
    loading, 
    error, 
    hasMore,
    loadMore, 
    changeFeedType,
    toggleLike,
    toggleBookmark,
    addView,
    unlockContent,
    addPost
  };
};

export const useUserPosts = (userId, initialContentType = 'media') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contentType, setContentType] = useState(initialContentType);
  const [totalCount, setTotalCount] = useState(0);
  
  // Fetch posts function
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      const currentPage = reset ? 1 : page;
      const { posts: newPosts, count } = await supabaseQueries.getUserPosts(userId, currentPage, 12, contentType);
      
      setTotalCount(count);
      setHasMore(currentPage * 12 < count);
      
      if (reset) {
        setPosts(newPosts);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, page, contentType]);
  
  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchPosts(true);
    }
  }, [userId, contentType, fetchPosts]);
  
  // Function to change content type
  const changeContentType = (type) => {
    if (type !== contentType) {
      setContentType(type);
    }
  };
  
  // Function to load more posts
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);
  
  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPosts();
    }
  }, [fetchPosts, page]);
  
  // Subscription to real-time updates for the user's posts
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabaseQueries.supabase
      .channel(`user-posts-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Refresh posts on any change
        fetchPosts(true);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchPosts]);
  
  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    changeContentType,
    totalCount
  };
};

// Conversations hooks - Keep as is
export const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const conversationsData = await supabaseQueries.getUserConversations(userId);
        setConversations(conversationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  const refreshConversations = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const conversationsData = await supabaseQueries.getUserConversations(userId);
      setConversations(conversationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { conversations, loading, error, refreshConversations };
};

// Update conversation messages hook for DM access checking
export const useConversationMessages = (conversationId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dmAccess, setDmAccess] = useState(null);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!conversationId || !userId) return;
    
    try {
      setLoading(true);
      const pageSize = 20;
      const messagesData = await supabaseQueries.getConversationMessages(
        conversationId, 
        userId,
        pageNum,
        pageSize
      );
      
      if (pageNum === 1) {
        setMessages(messagesData);
      } else {
        setMessages(prev => [...messagesData, ...prev]);
      }
      
      setHasMore(messagesData.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    fetchMessages(1);
    
    // Check DM access
    if (conversationId) {
      supabaseQueries.checkDmAccess(conversationId, userId)
        .then(access => setDmAccess(access))
        .catch(err => console.error("Error checking DM access:", err));
    }
  }, [conversationId, userId, fetchMessages]);

  const loadMoreMessages = () => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
    fetchMessages(page + 1);
  };

  const sendMessage = async (recipientId, content, postId = null) => {
    try {
      let activeConversationId = conversationId;
      
      if (!activeConversationId) {
        // Start a new conversation if needed
        activeConversationId = await supabaseQueries.startConversation(userId, recipientId, 0);
      }
      
      const result = await supabaseQueries.sendMessage(
        activeConversationId, 
        userId, 
        recipientId, 
        content,
        postId
      );
      
      if (result) {
        setMessages(prevMessages => [{
          message_id: result.message_id,
          sender_id: userId,
          content,
          created_at: result.created_at,
          is_read: false,
          is_paid: result.is_paid,
          requires_payment: result.requires_payment,
          is_current_user: true,
          amount: result.amount,
          related_post_id: postId
        }, ...prevMessages]);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const processPayment = async (messageId) => {
    try {
      const success = await supabaseQueries.processMessagePayment(messageId, userId);
      
      if (success) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.message_id === messageId 
              ? { ...msg, is_paid: true, requires_payment: false } 
              : msg
          )
        );
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const requestDmAccess = async (recipientId, postId = null, amount = null) => {
    try {
      const result = await supabaseQueries.requestDmAccess(userId, recipientId, amount, postId);
      if (result.success) {
        setDmAccess({ has_access: true, paid_amount: amount });
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    messages, 
    loading, 
    error,
    hasMore,
    dmAccess,
    loadMoreMessages,
    sendMessage,
    processPayment,
    requestDmAccess,
    refreshMessages: () => fetchMessages(1)
  };
};

// Update wallet hook to handle content unlocks and DM payments
export const useWallet = (userId) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const profileData = await supabaseQueries.getUserProfile(userId);
        if (profileData) {
          setBalance(profileData.balance);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const fetchTransactions = useCallback(async (pageNum = 1) => {
    if (!userId) return;
    
    try {
      setTransactionsLoading(true);
      const pageSize = 20;
      const transactionsData = await supabaseQueries.getUserTransactions(
        userId,
        pageNum,
        pageSize
      );
      
      if (pageNum === 1) {
        setTransactions(transactionsData);
      } else {
        setTransactions(prev => [...prev, ...transactionsData]);
      }
      
      setHasMore(transactionsData.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setTransactionsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions(1);
  }, [userId, fetchTransactions]);

  const loadMoreTransactions = () => {
    if (transactionsLoading || !hasMore) return;
    setPage(prev => prev + 1);
    fetchTransactions(page + 1);
  };

  const addFunds = async (amount, description = 'Deposit') => {
    try {
      const success = await supabaseQueries.addUserFunds(userId, amount, description);
      
      if (success) {
        setBalance(prev => prev + amount);
        fetchTransactions(1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const withdrawFunds = async (amount, description = 'Withdrawal') => {
    try {
      const success = await supabaseQueries.withdrawUserFunds(userId, amount, description);
      
      if (success) {
        setBalance(prev => prev - amount);
        fetchTransactions(1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const payForContent = async (postId, amount, creatorId) => {
    try {
      const success = await supabaseQueries.payForContent(userId, postId, amount, creatorId);
      
      if (success) {
        setBalance(prev => prev - amount);
        fetchTransactions(1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const payForSubscription = async (creatorId, amount, duration = 30) => {
    try {
      const success = await supabaseQueries.createSubscription(userId, creatorId, amount, duration);
      
      if (success) {
        setBalance(prev => prev - amount);
        fetchTransactions(1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    balance, 
    transactions, 
    loading, 
    transactionsLoading, 
    error,
    hasMore,
    loadMoreTransactions,
    addFunds,
    withdrawFunds,
    payForContent,
    payForSubscription,
    refreshBalance: async () => {
      try {
        const profileData = await supabaseQueries.getUserProfile(userId);
        if (profileData) {
          setBalance(profileData.balance);
        }
        return profileData;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    refreshTransactions: () => fetchTransactions(1)
  };
};

// Adjust useCreatePost to include monetization options
export const useCreatePost = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const create = async (
    userId, 
    content, 
    imageUrl, 
    isPremium, 
    topics = [], 
    monetizationModel = null, 
    contentFee = null, 
    dmFee = null, 
    requiresSubscription = false
  ) => {
    try {
      setCreating(true);
      const postId = await supabaseQueries.createPost(
        userId, 
        content, 
        imageUrl, 
        isPremium, 
        topics, 
        monetizationModel,
        contentFee,
        dmFee,
        requiresSubscription
      );
      return postId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
};

// Add subscription management hook
export const useSubscriptions = (userId) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const [userSubs, userSubscribers] = await Promise.all([
          supabaseQueries.getUserSubscriptions(userId),
          supabaseQueries.getUserSubscribers(userId)
        ]);
        
        setSubscriptions(userSubs);
        setSubscribers(userSubscribers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  const checkSubscription = async (creatorId) => {
    try {
      return await supabaseQueries.checkActiveSubscription(userId, creatorId);
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { 
    subscriptions, 
    subscribers, 
    loading, 
    error, 
    checkSubscription,
    refresh: async () => {
      try {
        setLoading(true);
        const [userSubs, userSubscribers] = await Promise.all([
          supabaseQueries.getUserSubscriptions(userId),
          supabaseQueries.getUserSubscribers(userId)
        ]);
        
        setSubscriptions(userSubs);
        setSubscribers(userSubscribers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };
};

// Keep other hooks as is
export const useUserStats = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const statsData = await supabaseQueries.getUserStats(userId);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const refreshStats = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const statsData = await supabaseQueries.getUserStats(userId);
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refreshStats };
};

export const useTopExperts = (limit = 5) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const expertsData = await supabaseQueries.getTopEarningExperts(limit);
        setExperts(expertsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [limit]);

  return { experts, loading, error };
};

export const useTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await supabaseQueries.getTopics();
        setTopics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { topics, loading, error };
};

// Custom hook for managing post ratings
export const usePostRatings = () => {
  const [userRatings, setUserRatings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's existing ratings
  const fetchUserRatings = async (userId) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseQueries.supabase
        .from('ratings')
        .select('rated_id, score')
        .eq('rater_id', userId);
        
      if (error) throw error;
      
      // Convert to a map of post_id -> rating score for easy lookup
      const ratingsMap = {};
      data.forEach(rating => {
        ratingsMap[rating.rated_id] = rating.score;
      });
      
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error('Error fetching user ratings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Rate a post (create or update rating)
  const ratePost = async (userId, postId, authorId, score, comment = null) => {
    if (!userId || !postId || !authorId || !score) {
      setError('Missing required parameters for rating');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user has already rated this post
      const { data: existingRatings, error: fetchError } = await supabaseClient
        .from('ratings')
        .select('rating_id, score')
        .eq('rater_id', userId)
        .eq('rated_id', postId);
        
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingRatings && existingRatings.length > 0) {
        // Update existing rating
        const { data, error } = await supabaseClient
          .from('ratings')
          .update({ 
            score,
            comment: comment,
            created_at: new Date().toISOString()
          })
          .eq('rating_id', existingRatings[0].rating_id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new rating
        const { data, error } = await supabaseClient
          .from('ratings')
          .insert({
            rater_id: userId,
            rated_id: postId,
            score,
            comment
          })
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      // Update local state
      setUserRatings(prev => ({
        ...prev,
        [postId]: score
      }));
      
      // Update the post's average rating
      await updatePostRating(postId);
      
      // Update the author's average rating
      await updateAuthorRating(authorId);
      
      return result;
    } catch (err) {
      console.error('Error rating post:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate and update the average rating for a post
  const updatePostRating = async (postId) => {
    try {
      // Calculate average rating from ratings table
      const { data, error } = await supabaseClient
        .rpc('calculate_post_average_rating', { post_id_param: postId });
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error updating post average rating:', err);
      setError(err.message);
      return null;
    }
  };
  
  // Calculate and update the average rating for an author
  const updateAuthorRating = async (authorId) => {
    try {
      // Calculate average user rating from ratings table
      const { data, error } = await supabaseClient
        .rpc('calculate_user_average_rating', { user_id_param: authorId });
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error updating author average rating:', err);
      setError(err.message);
      return null;
    }
  };

  return {
    userRatings,
    isLoading,
    error,
    fetchUserRatings,
    ratePost,
    updatePostRating,
    updateAuthorRating
  };
};