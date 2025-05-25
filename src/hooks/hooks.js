import { useState, useEffect, useRef, useCallback } from 'react';
import * as supabaseQueries from '../services/supabase';
import * as supabaseAuthQueries from '../services/authenticationService';
import { debounce } from 'lodash';

const CHANNEL_NAME = 'presence:global';

// Auth hook
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

// Profile hook
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

//Feed Posts hook
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

// User Posts hook
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

// Online users hook
export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const channelRef = useRef(null);
  const isSubscribed = useRef(false);
  const timeoutRefs = useRef(new Map());

  // Debounced updater to avoid flapping
  const updateOnlineUsers = useRef(
    debounce((state) => {
      const newMap = new Map();

      Object.entries(state).forEach(([presenceKey, presences]) => {
        const firstPresence = presences?.[0];
        if (firstPresence?.user_id) {
          newMap.set(firstPresence.user_id, {
            user_id: firstPresence.user_id,
            name: firstPresence.name,
            avatar_url: firstPresence.avatar_url,
            online_at: firstPresence.online_at,
            presence_key: presenceKey,
          });
        }
      });

      setOnlineUsers((prev) => {
        const isDifferent =
          newMap.size !== prev.size ||
          [...newMap.keys()].some((k) => !prev.has(k));
        return isDifferent ? newMap : prev;
      });
    }, 250)
  ).current;

  useEffect(() => {
    const setupPresence = async () => {
      try {
        const { data, error } = await supabaseQueries.supabase.auth.getUser();
        const user = data?.user;
        if (error || !user) return;

        const channel = supabaseQueries.supabase.channel('presence:global');
        channelRef.current = channel;

        const handlePresenceState = () => {
          if (!channelRef.current || !isSubscribed.current) return;
          const state = channelRef.current.presenceState();
          updateOnlineUsers(state);
        };

        channel
          .on('presence', { event: 'sync' }, handlePresenceState)
          .on('presence', { event: 'join' }, handlePresenceState)
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            // Delay removal in case of reconnect
            leftPresences.forEach((p) => {
              if (!p?.user_id) return;

              const timeout = setTimeout(() => {
                const state = channel.presenceState();
                updateOnlineUsers(state);
              }, 3000); // 3 second grace

              timeoutRefs.current.set(p.user_id, timeout);
            });
          });

        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            isSubscribed.current = true;

            try {
              await channel.track({
                user_id: user.id,
                name: user.user_metadata?.name || user.email || 'Anonymous',
                avatar_url: user.user_metadata?.avatar_url || null,
                online_at: new Date().toISOString(),
              });

              setTimeout(() => {
                handlePresenceState();
              }, 300);
            } catch (trackError) {
              console.error('Error tracking presence:', trackError);
            }
          }
        });
      } catch (err) {
        console.error('Setup presence error:', err);
      }
    };

    setupPresence();

    return () => {
      isSubscribed.current = false;
      if (channelRef.current) {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  return onlineUsers;
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

  const initializeConversation = useCallback(async () => {
    if (!initiatorId || !recipientId || !userId) {
      setError('Missing required user IDs');
      setLoading(false);
      return false;
    }

    try {
      setLoading(true);
      const { conversation_id: convoId } = await supabaseQueries.startConversation(initiatorId, recipientId);
      const access = await supabaseQueries.checkDmAccess(convoId, userId);
      setDmAccess(access);

      const messagesData = await supabaseQueries.getConversationMessages(initiatorId, recipientId, userId, 1, 20);
      setMessages(messagesData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))); // Sort by created_at
      setHasMore(messagesData.length === 20);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initiatorId, recipientId, userId]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      initializeConversation();
    }
    return () => {
      isMounted = false;
    };
  }, [initializeConversation]);

  useEffect(() => {
    if (!initiatorId || !recipientId || !userId) return;

    let subscription;

    const setupRealtimeSubscription = async () => {
      const { conversation_id: conversationId } = await supabaseQueries.startConversation(initiatorId, recipientId);
      console.log(`Attempting to subscribe to channel: messages-${conversationId}`);

      subscription = supabaseQueries.supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new;
            console.log(`New message received: ${newMessage.message_id}`);
            setMessages(prevMessages => {
              // Remove any optimistic message with a temp ID if the real message arrives
              const filteredMessages = prevMessages.filter(msg => !msg.message_id.startsWith('temp-'));
              if (filteredMessages.some(msg => msg.message_id === newMessage.message_id)) {
                return filteredMessages;
              }
              const updatedMessages = [...filteredMessages, {
                message_id: newMessage.message_id,
                sender_id: newMessage.from_user_id,
                content: newMessage.message,
                created_at: newMessage.created_at,
                is_read: newMessage.is_read,
                content_type: 'text',
                reply_to_message_id: newMessage.reply_to_message_id,
                is_current_user: newMessage.from_user_id === userId,
                conversation_id: newMessage.conversation_id,
              }];
              // Sort by created_at to ensure correct order
              return updatedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for ${conversationId}: ${status}`);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to Realtime channel');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Subscription failed, attempting to resubscribe...');
            setTimeout(() => setupRealtimeSubscription(), 2000);
          }
        });
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        // console.log(`Unsubscribing from channel: messages-${conversationId}`);
        supabaseQueries.supabase.removeChannel(subscription);
      }
    };
  }, [initiatorId, recipientId, userId]);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!initiatorId || !recipientId || !userId) return;
    try {
      setLoading(true);
      const pageSize = 20;
      const messagesData = await supabaseQueries.getConversationMessages(initiatorId, recipientId, userId, pageNum, pageSize);
      setMessages(prev => {
        const updatedMessages = [...prev, ...messagesData];
        return updatedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });
      setHasMore(messagesData.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initiatorId, recipientId, userId]);

  const loadMoreMessages = () => {
    if (loading || !hasMore) return Promise.resolve();
    setPage(prev => prev + 1);
    return fetchMessages(page + 1);
  };

  const sendMessage = async (recipientId, content, replyToMessageId = null) => {
    const tempMessageId = `temp-${Date.now()}`
    try {
      
      const optimisticMessage = {
        message_id: tempMessageId,
        sender_id: userId,
        content,
        created_at: new Date().toISOString(),
        is_read: false,
        content_type: 'text',
        reply_to_message_id: replyToMessageId,
        is_current_user: true,
        conversation_id: null,
      };
      // Add optimistic message
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, optimisticMessage];
        return updatedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });

      // Send the message to the server
      await supabaseQueries.sendMessage(initiatorId, recipientId, userId, content, replyToMessageId);
      // The Realtime subscription will handle adding the final message
    } catch (err) {
      // On error, remove the optimistic message
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.message_id !== tempMessageId)
      );
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
            msg.message_id === messageId ? { ...msg, is_paid: true, requires_payment: false } : msg
          )
        );
      }
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const requestDmAccess = async (recipientId, amount = null, postId = null) => {
    try {
      const result = await supabaseQueries.requestDmAccess(userId, recipientId, amount, postId);
      if (result.success) setDmAccess({ has_access: true, paid_amount: amount });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addInitialMessage = (message) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, message];
      return updatedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
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
    initializeConversation,
    refreshMessages: () => fetchMessages(1),
    addInitialMessage,
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