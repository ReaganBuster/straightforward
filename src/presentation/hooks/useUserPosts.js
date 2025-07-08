import { useState, useEffect, useCallback } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';

// User Posts hook
export const useUserPosts = (userId, initialContentType = 'all') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contentType, setContentType] = useState(initialContentType);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPosts = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);

        const currentPage = reset ? 1 : page;
        const { posts: newPosts, count } = await supabaseQueries.getUserPosts(
          userId,
          currentPage,
          12,
          contentType
        );

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
    },
    [userId, page, contentType]
  );

  useEffect(() => {
    if (userId) {
      fetchPosts(true);
    }
  }, [userId, contentType, fetchPosts]);

  const changeContentType = type => {
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchPosts(true);
        }
      )
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
    totalCount,
  };
};