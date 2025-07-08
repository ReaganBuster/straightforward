import { NavLink } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Bell,
  Plus,
} from 'lucide-react';
import React, { useState } from 'react';
import NewPost from '@presentation/components/NewPost/NewPost';

const BottomNav = ({ user, unreadMessages = 3, unreadNotifications = 5 }) => {
  const [isFormOverlayVisible, setIsFormOverlayVisible] = useState(false);

  const handleFabClick = () => {
    setIsFormOverlayVisible(true);
  };

  const handleCloseFormOverlay = () => {
    setIsFormOverlayVisible(false);
  };

   const handlePostCreated = () => {
    setIsFormOverlayVisible(false);
  };

  const navItems = [
    {
      to: '/',
      icon: <Home size={24} />,
      label: 'Home',
      badge: null,
      type: 'link',
    },
    {
      to: '/chat',
      icon: <MessageCircle size={24} />,
      label: 'Messages',
      badge: unreadMessages > 0 ? unreadMessages : null,
      type: 'link',
    },
    {
      to: '/notifications',
      icon: <Bell size={24} />,
      label: 'Notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      type: 'link',
    },
    {
      icon: <Plus size={28} />,
      label: 'Post', // Label kept for key/internal reference, not rendered
      action: handleFabClick,
      type: 'button',
    },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 flex md:hidden z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="flex w-full justify-around items-center">
          {navItems.map(item => (
            item.type === 'link' ? (
              // Render NavLink for regular navigation items
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-200 hover:text-red-600 ${
                    isActive ? 'text-red-600' : 'text-gray-600'
                  }`
                }
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== null && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">{item.label}</span>
              </NavLink>
            ) : (
              // Render the rounded red button, now wrapped for alignment
              <div
                key={item.label} // Key applies to the outer wrapper now
                className="flex flex-col items-center justify-center flex-1 py-1" // These classes ensure it aligns like other NavLinks
              >
                <button
                  onClick={item.action}
                  className="flex items-center justify-center h-10 w-10
                             bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-lg
                             transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  {item.icon}
                </button>
              </div>
            )
          ))}
        </div>
      </nav>

      {/* Post Form Overlay */}
      {isFormOverlayVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="p-3 overflow-y-auto max-h-[80vh]">
              <NewPost
                user={user}
                onPostCreated={handlePostCreated}
                onClose={() => handleCloseFormOverlay}
              />
            </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;