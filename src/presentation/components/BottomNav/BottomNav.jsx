import {
  Home,
  MessageSquare,
  Bell,
  Plus,
  X
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Mock NavLink component for demo purposes
const NavLink = ({ to, children, className }) => {
  const [isActive, setIsActive] = useState(to === '/');
  
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        setIsActive(true);
        // Reset other active states (simple demo logic)
        setTimeout(() => setIsActive(false), 2000);
      }}
      className={typeof className === 'function' ? className({ isActive }) : className}
    >
      {typeof children === 'function' ? children({ isActive }) : children}
    </a>
  );
};

const BottomNav = ({ unreadMessages = 3, unreadNotifications = 5 }) => {
  const [isFormOverlayVisible, setIsFormOverlayVisible] = useState(false);
  const [postContent, setPostContent] = useState('');

  const handleFabClick = () => {
    setIsFormOverlayVisible(true);
  };

  const handleCloseFormOverlay = () => {
    setIsFormOverlayVisible(false);
    setPostContent('');
  };

  const handlePost = () => {
    // Handle post submission logic here
    console.log('Posting:', postContent);
    handleCloseFormOverlay();
  };

  const navItems = [
    {
      to: '/',
      icon: <Home size={22} />,
      label: 'Home',
      badge: null,
      type: 'link',
    },
    {
      to: '/chat',
      icon: <MessageSquare size={22} />,
      label: 'Messages',
      badge: unreadMessages > 0 ? unreadMessages : null,
      type: 'link',
    },
    {
      to: '/notifications',
      icon: <Bell size={22} />,
      label: 'Notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      type: 'link',
    },
    {
      icon: <Plus size={24} />,
      label: 'Post',
      action: handleFabClick,
      type: 'button',
    },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg flex md:hidden z-50"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
          paddingTop: '8px'
        }}
      >
        <div className="flex w-full justify-around items-center px-2">
          {navItems.map((item, index) => (
            item.type === 'link' ? (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-2 px-3 transition-all duration-300 ease-out rounded-xl ${
                    isActive
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50 active:scale-95'
                  }`
                }
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== null && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </NavLink>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center justify-center h-12 w-12 
                           bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg 
                           transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl 
                           active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/30
                           relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  {item.icon}
                </div>
              </button>
            )
          ))}
        </div>
      </nav>

      {/* Post Form Overlay with improved animations */}
      {isFormOverlayVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300"
          onClick={handleCloseFormOverlay}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl relative mx-4 max-w-lg w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
              <button
                onClick={handleCloseFormOverlay}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close form"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                rows="6"
                placeholder="What's on your mind?"
                maxLength={500}
                autoFocus
              />
              
              {/* Character count */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Be authentic and engaging</span>
                <span className={postContent.length > 450 ? 'text-red-500' : ''}>
                  {postContent.length}/500
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseFormOverlay}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!postContent.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;