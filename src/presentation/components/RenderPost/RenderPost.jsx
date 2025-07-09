import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Star,
  // Clock,
  Zap,
  X, // Import the X icon for the close button
  ZoomIn, // Optionally for a zoom hint
  ZoomOut,
  Send,
  Clock,
  Verified,
  Eye, // Optionally for a zoom hint
} from 'lucide-react';
import { usePostRatings } from '@presentation/hooks/useOtherHooks';
import RatingStars from '@presentation/components/RatingComponent/RatingComponent';
import MediaOverlay from '../MediaOverlay/MediaOverlay';

// Memoized to prevent unnecessary re-renders for large feeds
const RenderPost = ({ post, user, toggleLike, toggleBookmark, addView }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMediaOverlay, setShowMediaOverlay] = useState(false); // New state for media overlay

  const {
    userRatings,
    rateItem,
    isLoading: isRatingLoading,
  } = usePostRatings(user?.user_id);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikeCount(post.like_count || 0);
    setIsBookmarked(post.is_bookmarked || false);
  }, [post.is_liked, post.like_count, post.is_bookmarked]);

  const handleLike = async postId => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    await toggleLike(postId);
  };

  const handleBookmark = async postId => {
    setIsBookmarked(!isBookmarked);
    await toggleBookmark(postId);
  };

  const handlePostClick = () => {
    // This function handles clicking the general post area to navigate
    addView(post.post_id);
    const author = post.author || {};
    navigate(`/m/${author.user_id}`, {
      state: {
        recipientId: author.user_id,
        recipientName: author.name,
        recipientAvatar: author.avatar_url,
        content: post.content,
        rate: post.dm_fee || 0,
      },
    });
  };

  // New handler for clicking specifically on the media
  const handleMediaClick = e => {
    e.stopPropagation(); // Prevent the parent handlePostClick from triggering
    setShowMediaOverlay(true);
    addView(post.post_id); // Add view when media is opened
  };

  const handleCloseMediaOverlay = () => {
    setShowMediaOverlay(false);
  };

  const handleRatePost = async score => {
    if (!user) {
      alert('Please log in to rate this post');
      setShowRatingModal(false);
      return;
    }
    await rateItem(post.post_id, score);
    setShowRatingModal(false);
  };

  const handleDirectMessage = e => {
    e.stopPropagation();
    const author = post.author || {};
    navigate(`/m/${author.user_id}`, {
      state: {
        recipientId: author.user_id,
        recipientName: author.username,
        rate: post.dm_fee || 0,
      },
    });
  };

  const handleShare = e => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      window.location.origin + `/post/${post.post_id}`
    );
    alert('Link copied to clipboard!');
    setShowMoreMenu(false);
  };

  const handleMoreClick = e => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleReport = () => {
    alert('Report feature is not implemented yet');
    setShowMoreMenu(false);
  };

  const authorInfo = post.author || {};

  // Fetch topics from post_topics if available
  const topics = post.post_topics ? post.post_topics.map(pt => pt.topic) : [];

  return (
    <div className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between">
        <div className="flex">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-2 border border-red-100">
            <img
              src={authorInfo.avatar_url || 'https://via.placeholder.com/40'}
              alt={authorInfo.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-gray-900 mr-1">
                {authorInfo.name || authorInfo.username}
              </h3>
              {/* {authorInfo.is_verified && (
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )} */}
              <span className="text-gray-500 text-sm ml-1">
                @{authorInfo.username}
              </span>
              <span className="text-gray-500 text-sm mx-1">·</span>
              <span className="text-gray-500 text-sm">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center mt-0.5 flex-wrap gap-1">
              {authorInfo.is_verified && (
                // <span className={`text-xs px-2 py-0.5 rounded-full ${
                //   // 'pending' ? 'bg-purple-100 text-purple-800' : 
                //   'verified' ? 'bg-green-100 text-green-800' : 
                //   'bg-red-100 text-red-800'
                // }`}>
                //   <Verified className='h-4 w-4'/>
                //   verified
                // </span>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  authorInfo.is_verified === 'Unverified' ? 'bg-purple-100 text-purple-800' : 
                  authorInfo.is_verified === 'Verified' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  <Verified size={12} />
                  {authorInfo.is_verified}
                </span>
              )}
             
              {/* {getMonetizationBadge()}
              {authorInfo.rating && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                  <Star size={10} className="mr-0.5" fill="currentColor" />
                  {authorInfo.rating.toFixed(1)}
                </span>
              )} */}
              
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleMoreClick}
          >
            <MoreHorizontal size={18} />
          </button>
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                onClick={handleShare}
              >
                Share Post
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                onClick={handleReport}
              >
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      

      <div className="cursor-pointer" onClick={handlePostClick}>
        {/* Content aligned with profile image */}
        <div className="ml-12 mt-2">
          {/* Text content comes first */}
          <p className="text-gray-900">{post.caption}</p>

          
          

          {/* Image comes after text - now with click handler for overlay */}
          {post.thumbnail_url && (
            <div
              className="mt-2 rounded-xl overflow-hidden cursor-pointer" // Added cursor-pointer
              onClick={handleMediaClick} // Click opens overlay
            >
              <img
                src={post.thumbnail_url || 'https://via.placeholder.com/600/400'}
                alt="Post thumbnail"
                className="w-full h-auto max-w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-gray-500 text-xs ml-12">
        <div className="flex items-center space-x-1">
          <Eye size={12} />
          <span>{((post.views || 0) / 1000).toFixed(1)}K</span>
        </div>
        
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>6 days left</span>
          </div>
        
      </div>

      <div className="ml-12 mt-3 flex items-center justify-between space-x-4">
        <button
          className={`flex items-center ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={e => {
            e.stopPropagation();
            handleLike(post.post_id);
          }}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-xs ml-1">{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <button
          className="flex items-center text-gray-500 hover:text-yellow-600"
          onClick={e => {
            e.stopPropagation();
            setShowRatingModal(true);
          }}
        >
          <Star
            size={18}
            fill={userRatings[post.post_id] ? 'currentColor' : 'none'}
          />
        </button>

        <button
          className={`flex items-center ${isBookmarked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={e => {
            e.stopPropagation();
            handleBookmark(post.post_id);
          }}
        >
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>

        <button
          className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-2"
          onClick={handleDirectMessage}
        >
          <Send size={14} className="mr-1" />
          <span> slide</span>
        </button>
      </div>

      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Rate this post
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowRatingModal(false)}
              >
                <X className="w-5 h-5" /> {/* Using Lucide icon for close */}
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

      {/* Media Overlay Component */}
      {showMediaOverlay && (
        <MediaOverlay showMediaOverlay={showMediaOverlay} post={post} authorInfo={authorInfo} handleCloseMediaOverlay={handleCloseMediaOverlay}/>
        
         
      )}
    </div>
  );
};

export default memo(RenderPost);