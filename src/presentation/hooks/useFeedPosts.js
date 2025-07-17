import { useState, useEffect, useCallback } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';
import { fetchAllPosts } from '@domain/usecases/fetchAllPosts';
import PostRepositoryImp from '@application/repository/PostRepositoryImp';
import { useMemo } from 'react';

//Feed Posts hook
export const useFeedPosts = (userId, initialFeedType = 'discover') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [feedType, setFeedType] = useState(initialFeedType);
  const [hasMore, setHasMore] = useState(true);

  const repo = useMemo(() => new PostRepositoryImp(), []);

  const fetchPosts = 
    async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        const data = await fetchAllPosts(repo)();
        
        
        setPosts(data);
        

        setHasMore(data.length === pageSize);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchPosts();
  }, [feedType, fetchPosts]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
    fetchPosts(page + 1);
  };

  const changeFeedType = newType => {
    if (newType !== feedType) {
      setFeedType(newType);
      setPage(1);
    }
  };

  const toggleLike = async postId => {
    try {
      const result = await supabaseQueries.togglePostLike(userId, postId);

      setPosts(currentPosts =>
        currentPosts.map(post =>
          post.post_id === postId
            ? {
                ...post,
                is_liked: result.is_liked,
                like_count: parseInt(result.like_count),
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

  const toggleBookmark = async postId => {
    try {
      const isBookmarked = await supabaseQueries.togglePostBookmark(
        userId,
        postId
      );

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

  const addView = async postId => {
    try {
      await supabaseQueries.addPostView(postId);

      setPosts(currentPosts =>
        currentPosts.map(post =>
          post.post_id === postId ? { ...post, views: post.views + 1 } : post
        )
      );
    } catch (err) {
      console.error('Error adding view:', err);
    }
  };

  const unlockContent = async (postId, amount) => {
    try {
      const result = await supabaseQueries.unlockPremiumContent(
        userId,
        postId,
        amount
      );

      if (result.success) {
        setPosts(currentPosts =>
          currentPosts.map(post =>
            post.post_id === postId ? { ...post, is_unlocked: true } : post
          )
        );
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addPost = newPost => {
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
    addPost,
  };
};