import { X, Heart, MessageCircle } from 'lucide-react'; // Only necessary icons
import React, { useState, useEffect } from 'react';

const MediaOverlay = ({
  showMediaOverlay,
  handleCloseMediaOverlay,
  post,
  authorInfo,
  // You might need to pass in actual handlers for like and message, e.g.:
  // onLike,
  // onMessage,
  // isLiked, // if MediaOverlay needs to know this state directly
  // likeCount, // if MediaOverlay needs to know this state directly
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(true);

  // Auto-hide actions after 3 seconds, show on interaction
  useEffect(() => {
    if (showMediaOverlay) {
      setShowActions(true);
      const timer = setTimeout(() => setShowActions(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMediaOverlay]);

  // Handle interaction to show actions and reset timer
  const handleInteraction = () => {
    setShowActions(true);
    // Clear any existing timeout to prevent immediate re-hide
    clearTimeout(window._mediaOverlayHideTimer);
    window._mediaOverlayHideTimer = setTimeout(() => setShowActions(false), 3000);
  };

  // Handle keyboard events, specifically ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showMediaOverlay) {
        handleCloseMediaOverlay();
      }
    };
    if (showMediaOverlay) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Clean up the timer if component unmounts or overlay closes
      clearTimeout(window._mediaOverlayHideTimer);
    };
  }, [showMediaOverlay, handleCloseMediaOverlay]);


  if (!showMediaOverlay) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300"
      onClick={handleCloseMediaOverlay}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      // Added tabIndex to make the div focusable for keyboard events
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div
        className="relative bg-black rounded-2xl overflow-hidden flex flex-col max-w-[95vw] max-h-[95vh] shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()} // Prevent clicks on content from closing overlay
      >
        {/* Top Controls Bar (Author Info + Close Button) */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20 transition-all duration-300 ${
          showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full' // Use -translate-y-full to hide completely
        }`}>
          <div className="flex items-center justify-between">
            {/* Author Info */}
            <div className="flex items-center space-x-3 flex-grow min-w-0"> {/* flex-grow min-w-0 for long names */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 flex-shrink-0">
                <img
                  src={authorInfo.avatar_url || 'https://via.placeholder.com/40'}
                  alt={authorInfo.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0"> {/* Ensures text truncates if needed */}
                <h4 className="font-bold text-white text-sm truncate">{authorInfo.name || authorInfo.username}</h4>
                <span className="text-gray-300 text-xs truncate">@{authorInfo.username}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110 flex-shrink-0 ml-4"
              onClick={handleCloseMediaOverlay}
              aria-label="Close media view"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image/Media Display Area */}
        <div className="flex-grow flex items-center justify-center relative min-h-[400px]">
          {/* Loading State */}
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt="Post media"
              className={`max-h-[85vh] max-w-[95vw] object-contain transition-opacity duration-300 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
            />
          )}
        </div>

        {/* Action Buttons - Side Panel (Like and Message only) */}
        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 transition-all duration-300 ${
          showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full' // Hide to the right
        }`}>
          {/* Like Button */}
          <button
            className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110"
            // onClick={() => onLike(post.post_id)} // Connect to actual like handler from props
            aria-label="Like post"
          >
            <Heart size={20} />
            {/* <span className="text-xs mt-1">{likeCount > 0 ? likeCount : ''}</span> If you want count here */}
          </button>
          {/* Message Button */}
          <button
            className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110"
            // onClick={() => onMessage(authorInfo.user_id)} // Connect to actual message handler from props
            aria-label="Send direct message"
          >
            <MessageCircle size={20} />
          </button>
        </div>

        {/* Bottom Caption Area */}
        {post.caption && (
          <div className={`bg-gradient-to-t from-black/90 to-transparent text-white p-6 transition-all duration-300 ${
            showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full' // Hide to the bottom
          }`}>
            <div className="max-h-[20vh] overflow-y-auto custom-scrollbar">
              <p className="text-sm leading-relaxed">{post.caption}</p>
            </div>
          </div>
        )}

        {/* Removed Progress Indicator and Keyboard Hint (as it's replaced by general ESC functionality) */}
      </div>

      {/* Replaced Keyboard Hint with proper accessibility for ESC */}
    </div>)

    {/* Custom Scrollbar Style (kept for long captions) */}
    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #ef4444;
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #dc2626;
      }
    `}</style>
  
};

export default MediaOverlay;