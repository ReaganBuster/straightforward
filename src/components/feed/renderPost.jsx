import React, { useState, useMemo, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Bookmark, Share2, MoreHorizontal, Mail, Star, Activity, Zap
} from 'lucide-react';
import { usePostRatings, useOnlineUsers } from '../../hooks/hooks';
import RatingStars from './ratingComponent';

const RenderPost = ({ post, user, toggleLike, toggleBookmark, addView }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const { userRatings, rateItem, isLoading: isRatingLoading } = usePostRatings(user?.id);
  const onlineUsers = useOnlineUsers();

  const isAuthorOnline = useMemo(() => {
    return onlineUsers.has(post.author?.user_id);
  }, [onlineUsers, post.author?.user_id]);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikeCount(post.like_count || 0);
    setIsBookmarked(post.is_bookmarked || false);
  }, [post.is_liked, post.like_count, post.is_bookmarked]);

  const handleLike = async (postId) => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    await toggleLike(postId);
  };

  const handleBookmark = async (postId) => {
    setIsBookmarked(!isBookmarked);
    await toggleBookmark(postId);
  };

  const handlePostClick = () => {
    addView(post.post_id);
    const author = post.author || {};
    navigate(`/m/${author.user_id}`, {
      state: {
        recipientId: author.user_id,
        recipientName: author.name,
        recipientAvatar: author.avatar_url,
        content: post.content,
        rate: post.dm_fee || 0
      }
    });
  };

  const handleRatePost = async (score) => {
    if (!user) {
      alert('Please log in to rate this post');
      setShowRatingModal(false);
      return;
    }
    await rateItem(post.post_id, score);
    setShowRatingModal(false);
  };

  const handleDirectMessage = (e) => {
    e.stopPropagation();
    const author = post.author || {};
    navigate(`/m/${author.user_id}`, {
      state: {
        recipientId: author.user_id,
        recipientName: author.username,
        rate: post.dm_fee || 0
      }
    });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/post/${post.post_id}`);
    alert('Link copied to clipboard!');
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleReport = () => {
    alert('Report feature is not implemented yet');
    setShowMoreMenu(false);
  };

  const authorInfo = post.author || {};

  const formatCurrency = (amount, currency = 'UGX') => `${amount.toLocaleString()} ${currency}`;

  const getMonetizationBadge = () => {
    if (!post.monetization_model && !post.dm_fee) return null;
    const label = post.monetization_model === 'paid_dm' ? 'DM Fee' : post.monetization_model || 'Premium';
    const fee = post.dm_fee || 0;
    const currency = authorInfo.currency || 'UGX';
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center">
        <Mail size={10} className="mr-0.5" />
        {fee > 0 ? `${formatCurrency(fee, currency)} ${label}` : label}
      </span>
    );
  };

  const topics = post.post_topics ? post.post_topics.map(pt => pt.topic) : [];

  return (
    <div className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between">
        <div className="flex">
          <div className="relative w-10 h-10 mr-2">
            <div className="rounded-full overflow-hidden border border-red-100 w-full h-full">
              <img 
                src={authorInfo.avatar_url || 'https://via.placeholder.com/40'} 
                alt={authorInfo.username} 
                className="w-full h-full object-cover"
              />
            </div>
            {isAuthorOnline && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-gray-900 mr-1">{authorInfo.name || authorInfo.username}</h3>
              {authorInfo.is_verified && (
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              )}
              <span className="text-gray-500 text-sm ml-1">@{authorInfo.username}</span>
              <span className="text-gray-500 text-sm mx-1">·</span>
              <span className="text-gray-500 text-sm">
                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center mt-0.5 flex-wrap gap-1">
              {authorInfo.expertise && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  authorInfo.expertise === 'Consultant' ? 'bg-purple-100 text-purple-800' : 
                  authorInfo.expertise === 'Expert' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {authorInfo.expertise}
                </span>
              )}
              {getMonetizationBadge()}
              {authorInfo.rating && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                  <Star size={10} className="mr-0.5" fill="currentColor" />
                  {authorInfo.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button className="text-gray-400 hover:text-gray-600" onClick={handleMoreClick}>
            <MoreHorizontal size={18} />
          </button>
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                onClick={handleReport}
              >
                Report Post
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                onClick={handleShare}
              >
                Copy Share Link
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        className="mt-2 mb-2 cursor-pointer" 
        onClick={handlePostClick}
      >
        {post.thumbnail_url && (
          <div className="mt-2 rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-200">
            <img 
              src={post.thumbnail_url || 'https://via.placeholder.com/600/400'} 
              alt="Post thumbnail" 
              className="w-full h-auto max-w-full object-contain"
            />
          </div>
        )}
        <p className="text-gray-900 mt-2 line-clamp-2">{post.caption}</p>
        {topics && topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topics.map((topic, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-800">
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 text-gray-500 text-xs">
        <div className="flex items-center space-x-1">
          <Zap size={12} />
          <span>{((post.views || 0) / 1000).toFixed(1)}K</span>
        </div>
        {post.is_trending && post.trending_category && (
          <div className="flex items-center space-x-1">
            <Activity size={12} />
            <span>{post.trending_category}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
        <button 
          className={`flex items-center ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike(post.post_id);
          }}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-xs ml-1">{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <button 
          className="flex items-center text-gray-500 hover:text-yellow-600"
          onClick={(e) => {
            e.stopPropagation();
            setShowRatingModal(true);
          }}
        >
          <Star size={18} fill={userRatings[post.post_id] ? 'currentColor' : 'none'} />
        </button>

        <button 
          className={`flex items-center ${isBookmarked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark(post.post_id);
          }}
        >
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>

        <button 
          className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs"
          onClick={handleDirectMessage}
        >
          <Mail size={14} className="mr-1" />
          <span>{post.dm_fee > 0 ? formatCurrency(post.dm_fee) : 'DM'}</span>
        </button>

        <button 
          className="text-gray-500 hover:text-gray-600"
          onClick={handleShare}
        >
          <Share2 size={18} />
        </button>
      </div>

      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Rate this post</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowRatingModal(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RatingStars 
              postId={post.post_id}
              initialRating={userRatings[post.post_id] || 0}
              onRate={handleRatePost}
            />
            {isRatingLoading && (
              <div className="mt-4 text-sm text-gray-500 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
                Saving rating...
              </div>
            )}
            <button 
              className="mt-4 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full hover:from-red-700 hover:to-red-800"
              onClick={() => setShowRatingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(RenderPost);