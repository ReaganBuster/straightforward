import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Bookmark, Share2, MoreHorizontal, Lock, 
  Activity, Mail, 
  DollarSign, Zap, Star, CreditCard, Wallet
} from 'lucide-react';

const RenderPost = ({ post, toggleLike, toggleBookmark, addView, unlockContent }) => {
  const navigate = useNavigate();
  
  // Local state to optimize UI updates before the hook state updates
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  
  // Update local state when post props change (e.g., after API updates)
  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikeCount(post.like_count || 0);
    setIsBookmarked(post.is_bookmarked || false);
  }, [post.is_liked, post.like_count, post.is_bookmarked]);
  
  const handleLike = async (postId) => {
    // Update local state immediately
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    // Call the API function from the hook
    await toggleLike(postId);
  };
  
  const handleBookmark = async (postId) => {
    // Update local state immediately
    setIsBookmarked(!isBookmarked);
    
    // Call the API function from the hook
    await toggleBookmark(postId);
  };
  
  const handleViewPost = (postId) => {
    addView(postId);
  };
  
  const handleDirectMessage = (userId, username, dmFee) => {
    navigate(`/m/${userId}`, { 
      state: { 
        recipientId: userId, 
        recipientName: username, 
        rate: dmFee
      }
    });
  };
  
  const handleUnlockContent = (postId, contentFee) => {
    unlockContent(postId, contentFee);
  };
  
  const authorInfo = post.author || {};
  
  // Determine monetization display
  const getMonetizationBadge = () => {
    if (post.monetization_model === 'content_fee' && post.content_fee) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
          <CreditCard size={10} className="mr-0.5" />
          {post.content_fee.toLocaleString()} {authorInfo.currency || 'UGX'} unlock
        </span>
      );
    } else if (post.monetization_model === 'subscription' && post.requires_subscription) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center">
          <Wallet size={10} className="mr-0.5" />
          Subscription
        </span>
      );
    } else if (post.monetization_model === 'dm' && post.dm_fee) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center">
          <Mail size={10} className="mr-0.5" />
          DM fee
        </span>
      );
    }
    return null;
  };
  
  return (
    <div className="p-3 border-b border-gray-100" onClick={() => handleViewPost(post.post_id)}>
      <div className="flex justify-between">
        <div className="flex">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-2 border border-red-100">
            <img src={authorInfo.avatar_url || "/api/placeholder/40/40"} alt={authorInfo.username} className="w-full h-full object-cover" />
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
              <span className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
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
              
              {/* Show DM rate if available */}
              {post.dm_fee && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                  <DollarSign size={10} className="mr-0.5" />
                  {post.dm_fee.toLocaleString()} {authorInfo.currency || 'UGX'}
                </span>
              )}
              
              {/* Show monetization badge */}
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
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className="mt-2 mb-2">
        <p className="text-gray-900">{post.content}</p>
        
        {/* Premium content - show appropriate lock based on monetization model */}
        {post.is_premium && (
          <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center text-gray-500">
              <Lock size={16} className="mr-2" />
              <p className="text-sm font-medium">
                {post.monetization_model === 'content_fee' ? 
                  `Premium content - Unlock for ${post.content_fee.toLocaleString()} ${authorInfo.currency || 'UGX'}` :
                  post.monetization_model === 'subscription' ?
                  "Premium content - Subscribe to access" :
                  "Premium content - DM to unlock"}
              </p>
              
              {post.monetization_model === 'content_fee' && post.content_fee && (
                <button 
                  className="ml-auto text-xs bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlockContent(post.post_id, post.content_fee);
                  }}
                >
                  Unlock
                </button>
              )}
            </div>
          </div>
        )}
        
        {post.image_url && !post.is_premium && (
          <div className="mt-2 rounded-xl overflow-hidden">
            <img src={post.image_url || "/api/placeholder/600/400"} alt="Post" className="w-full h-auto object-cover" />
          </div>
        )}
        
        {/* Display post topics as tags */}
        {post.topics && post.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.topics.map((topic, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-800">#{topic}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1 text-gray-500 text-xs">
        <div className="flex items-center space-x-1">
          <Zap size={12} />
          <span>{((post.views || 0) / 1000).toFixed(1)}K</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{authorInfo.response_rate || 95}% response</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{authorInfo.avg_response_time || "< 1h"}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
        <button 
          className={`flex items-center ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike(post.post_id);
          }}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          <span className="text-xs ml-1">{likeCount > 0 ? likeCount : ""}</span>
        </button>
        
        <button className="flex items-center text-gray-500 hover:text-red-600">
          <Star size={18} />
        </button>
        
        <button 
          className={`flex items-center ${isBookmarked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark(post.post_id);
          }}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        
        <button 
          className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleDirectMessage(authorInfo.user_id, authorInfo.username, post.dm_fee || authorInfo.rate_per_msg);
          }}
        >
          <Mail size={14} className="mr-1" />
          <span>
            {post.dm_fee ? 
              `${post.dm_fee.toLocaleString()} ${authorInfo.currency || 'UGX'}` : 
              authorInfo.rate_per_msg ? 
              `${authorInfo.rate_per_msg.toLocaleString()} ${authorInfo.currency || 'UGX'}` : 
              'DM'}
          </span>
        </button>
        
        <button onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-gray-600">
          <Share2 size={18} />
        </button>
      </div>
      
      {/* Show trending info if applicable */}
      {post.is_trending && post.trending_category && (
        <div className="mt-2 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full inline-flex items-center">
          <Activity size={12} className="mr-1" />
          {post.trending_category}
        </div>
      )}
    </div>
  );
}

export default RenderPost;