import { useState, useEffect, useRef, useCallback } from 'react';
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

// Updated Feed Posts hook
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

// Updated User Posts hook
export const useUserPosts = (userId, initialContentType = 'all') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contentType, setContentType] = useState(initialContentType);
  const [totalCount, setTotalCount] = useState(0);
  
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
  
  useEffect(() => {
    if (userId) {
      fetchPosts(true);
    }
  }, [userId, contentType, fetchPosts]);
  
  const changeContentType = (type) => {
    if (['all', 'monetized', 'free'].includes(type) && type !== contentType) {
      setContentType(type);
    }
  };
  
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);
  
  useEffect(() => {
    if (page > 1) {
      fetchPosts();
    }
  }, [fetchPosts, page]);
  
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabaseQueries.supabase
      .channel(`user-posts-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${userId}`
      }, () => {
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

// Conversations hooks
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

// Conversation messages hook
export const useConversationMessages = (initiatorId, recipientId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dmAccess, setDmAccess] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Use refs to avoid stale closures and dependency loops
  const wsRef = useRef(null);
  const conversationIdRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection function
  const connectWebSocket = useCallback(async (conversationId, token) => {
    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      const websocket = new WebSocket(`wss://kontentapi-qpu8.onrender.com/ws/${conversationId}?token=${token}`);
      wsRef.current = websocket;
      setConnectionStatus('connecting');

      websocket.onopen = () => {
        console.log('Connected to WebSocket server');
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      websocket.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          if (type === 'message') {
            setMessages((prev) => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => msg.message_id === data.message_id);
              if (exists) return prev;
              
              return [{
                message_id: data.message_id,
                sender_id: data.sender_id,
                content: data.content,
                created_at: data.created_at,
                is_read: data.is_read,
                content_type: data.content_type || 'text',
                reply_to_message_id: data.reply_to_message_id,
                is_current_user: data.sender_id === userId,
              }, ...prev];
            });
          } else if (type === 'error') {
            setError(data.message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setError('WebSocket connection failed');
      };

      websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket(conversationId, token);
          }, delay);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError('Failed to establish WebSocket connection');
      setConnectionStatus('error');
    }
  }, [userId]);

  const initializeConversation = useCallback(async () => {
    if (!initiatorId || !recipientId || !userId) {
      setError('Missing required user IDs');
      setLoading(false);
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Get Supabase session for JWT token
      const { data: { session } } = await supabaseQueries.supabase.auth.getSession();
      if (!session) {
        setError('User not authenticated');
        return false;
      }

      // Get or create conversation
      const { conversation_id: convoId } = await supabaseQueries.startConversation(initiatorId, recipientId);
      conversationIdRef.current = convoId;
      
      // Check DM access (for paid messaging)
      const access = await supabaseQueries.checkDmAccess(convoId, userId);
      setDmAccess(access);

      // Fetch initial messages using backend polling endpoint
      const response = await fetch(
        `https://kontentapi-qpu8.onrender.com/messages/${convoId}?limit=20&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const { messages: initialMessages } = await response.json();
      const formattedMessages = initialMessages.map(msg => ({
        message_id: msg.message_id,
        sender_id: msg.from_user_id,
        content: msg.message,
        created_at: msg.created_at,
        is_read: msg.is_read,
        content_type: msg.content_type || 'text',
        reply_to_message_id: msg.reply_to_message_id,
        is_current_user: msg.from_user_id === userId,
      }));
      
      setMessages(formattedMessages);
      setHasMore(initialMessages.length === 20);

      // Initialize WebSocket connection
      await connectWebSocket(convoId, session.access_token);

      return true;
    } catch (err) {
      console.error('Error initializing conversation:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initiatorId, recipientId, userId, connectWebSocket]);

  // Initialize conversation on mount
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (isMounted) {
        await initializeConversation();
      }
    };
    
    init();

    // Cleanup function
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeConversation]);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!conversationIdRef.current || !userId) return;
    
    try {
      setLoading(true);
      const offset = (pageNum - 1) * 20;
      const { data: { session } } = await supabaseQueries.supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(
        `https://kontentapi-qpu8.onrender.com/messages/${conversationIdRef.current}?limit=20&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const { messages: newMessages } = await response.json();
      const formattedMessages = newMessages.map(msg => ({
        message_id: msg.message_id,
        sender_id: msg.from_user_id,
        content: msg.message,
        created_at: msg.created_at,
        is_read: msg.is_read,
        content_type: msg.content_type || 'text',
        reply_to_message_id: msg.reply_to_message_id,
        is_current_user: msg.from_user_id === userId,
      }));
      
      setMessages(prev => pageNum === 1 ? formattedMessages : [...prev, ...formattedMessages]);
      setHasMore(newMessages.length === 20);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadMoreMessages = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage);
  }, [loading, hasMore, page, fetchMessages]);

  const sendMessage = useCallback(async (recipientId, content, replyToMessageId = null) => {
    try {
      // Check WebSocket connection
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected. Please check your connection.');
      }

      // Send via WebSocket only - let the backend handle database insertion and broadcasting
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content,
        to_user_id: recipientId,
        reply_to_message_id: replyToMessageId,
      }));

      return { success: true };
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const processPayment = useCallback(async (messageId) => {
    try {
      const success = await supabaseQueries.processMessagePayment(messageId, userId);
      if (success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.message_id === messageId ? { ...msg, is_paid: true, requires_payment: false } : msg
          )
        );
      }
      return success;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const requestDmAccess = useCallback(async (recipientId, amount = null, postId = null) => {
    try {
      const result = await supabaseQueries.requestDmAccess(userId, recipientId, amount, postId);
      if (result.success) {
        setDmAccess({ has_access: true, paid_amount: amount });
      }
      return result;
    } catch (err) {
      console.error('Error requesting DM access:', err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const addInitialMessage = useCallback((message) => {
    setMessages(prev => [message, ...prev]);
  }, []);

  // Retry connection function
  const retryConnection = useCallback(() => {
    if (conversationIdRef.current) {
      reconnectAttemptsRef.current = 0;
      supabaseQueries.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          connectWebSocket(conversationIdRef.current, session.access_token);
        }
      });
    }
  }, [connectWebSocket]);

  return {
    messages,
    loading,
    error,
    hasMore,
    dmAccess,
    connectionStatus,
    loadMoreMessages,
    sendMessage,
    processPayment,
    requestDmAccess,
    initializeConversation,
    refreshMessages: () => fetchMessages(1),
    addInitialMessage,
    retryConnection,
  };
};

// Wallet hook
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
        const profileData = await supabaseAuthQueries.getUserProfile(userId);
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

  const payForSubscription = async (creatorId, amount, duration = 30, tierId = null) => {
    try {
      const success = await supabaseQueries.createSubscription(userId, creatorId, amount, duration, tierId);
      
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
        const profileData = await supabaseAuthQueries.getUserProfile(userId);
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

// Create post hook
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
    dmFee = null,
    requiresSubscription = false,
    contentType,
    articleTitle,
    articlePreview,
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
      setCreating(true);
      setError(null);
      const postId = await supabaseQueries.createPost(
        userId,
        content,
        imageUrl,
        isPremium,
        topics,
        monetizationModel,
        dmFee,
        requiresSubscription,
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
      );
      return { post_id: postId };
    } catch (err) {
      setError(err.message || 'Failed to create post');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
};

// Subscriptions hook
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

// Other hooks
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

// Post ratings hook (completed)
export const usePostRatings = (userId) => {
  const [userRatings, setUserRatings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserRatings = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabaseQueries.supabase
        .from('ratings')
        .select('rated_id, score')
        .eq('rater_id', userId);

      if (fetchError) throw fetchError;

      const ratingsMap = {};
      data.forEach(rating => {
        ratingsMap[rating.rated_id] = rating.score;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserRatings();
  }, [fetchUserRatings]);

  const rateItem = async (ratedId, score, comment = null) => {
    try {
      setIsLoading(true);
      await supabaseQueries.rateUser(userId, ratedId, score, comment);
      await fetchUserRatings(); // Refresh ratings after rating
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { userRatings, isLoading, error, rateItem, refreshRatings: fetchUserRatings };
};