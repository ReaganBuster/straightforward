import { X, Heart, MessageCircle, Share, Download } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const MediaOverlay = ({ 
  showMediaOverlay, 
  handleCloseMediaOverlay, 
  post, 
  authorInfo 
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

  const handleInteraction = () => {
    setShowActions(true);
    // Hide again after 3 seconds
    setTimeout(() => setShowActions(false), 3000);
  };

  if (!showMediaOverlay) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300"
      onClick={handleCloseMediaOverlay}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div
        className="relative bg-black rounded-2xl overflow-hidden flex flex-col max-w-[95vw] max-h-[95vh] shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Controls Bar */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20 transition-all duration-300 ${
          showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          <div className="flex items-center justify-between">
            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 flex-shrink-0">
                <img
                  src={authorInfo.avatar_url || 'https://via.placeholder.com/40'}
                  alt={authorInfo.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{authorInfo.name || authorInfo.username}</h4>
                <span className="text-gray-300 text-xs">@{authorInfo.username}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110"
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

        {/* Action Buttons - Side Panel */}
        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 transition-all duration-300 ${
          showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110">
            <Heart size={20} />
          </button>
          <button className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110">
            <MessageCircle size={20} />
          </button>
          <button className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110">
            <Share size={20} />
          </button>
          <button className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110">
            <Download size={20} />
          </button>
        </div>

        {/* Bottom Caption Area */}
        {post.caption && (
          <div className={`bg-gradient-to-t from-black/90 to-transparent text-white p-6 transition-all duration-300 ${
            showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div className="max-h-[20vh] overflow-y-auto custom-scrollbar">
              <p className="text-sm leading-relaxed">{post.caption}</p>
              
              {/* Engagement Stats */}
              <div className="flex items-center space-x-6 mt-4 text-xs text-gray-300">
                <span className="flex items-center space-x-1">
                  <Heart size={14} />
                  <span>1.2k</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle size={14} />
                  <span>84</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Share size={14} />
                  <span>23</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator (if multiple images) */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs transition-all duration-300 ${
        showActions ? 'opacity-100' : 'opacity-0'
      }`}>
        Press <span className="px-2 py-1 bg-white/20 rounded">ESC</span> to close
      </div>

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
    </div>
  );
};

export default MediaOverlay;