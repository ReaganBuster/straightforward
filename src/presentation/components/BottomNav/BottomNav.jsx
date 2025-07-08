import { NavLink } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Bell,
  PlusCircle, // Import PlusCircle for the add button
} from 'lucide-react';
import React, { useState } from 'react'; // Import React and useState

// Assume your PostForm component is defined elsewhere, e.g., in './PostForm'
// const PostForm = ({ onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg relative">
//         <h2 className="text-xl font-bold mb-4">Create New Post</h2>
//         {/* Your form content goes here */}
//         <p>This is where your post creation form will be.</p>
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
//         >
//           &times;
//         </button>
//       </div>
//     </div>
//   );
// };

const BottomNav = ({ unreadMessages = 3, unreadNotifications = 5 }) => {
  const [isFormOverlayVisible, setIsFormOverlayVisible] = useState(false); // State to control form overlay visibility

  const navItems = [
    {
      to: '/',
      icon: <Home size={24} />,
      label: 'Home',
      badge: null,
    },
    {
      to: '/chat',
      icon: <MessageSquare size={24} />,
      label: 'Messages',
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      to: '/notifications',
      icon: <Bell size={24} />,
      label: 'Notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
  ];

  const handleFabClick = () => {
    setIsFormOverlayVisible(true);
  };

  const handleCloseFormOverlay = () => {
    setIsFormOverlayVisible(false);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 flex md:hidden z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="flex w-full justify-around items-center relative">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 transition-transform duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg mx-1'
                    : 'text-gray-600'
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
          ))}

          {/* Floating Action Button */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
            <button
              onClick={handleFabClick}
              className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Add New Post"
            >
              <PlusCircle size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Post Form Overlay */}
      {isFormOverlayVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg relative mx-4 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Post</h2>
            {/* This is where your actual post creation form component will go */}
            {/* For now, it's just a placeholder. Replace with your <PostForm /> component */}
            <p className="text-gray-700 mb-4">Your form for adding a new post goes here. You can connect it to your existing form setup.</p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
              placeholder="What's on your mind?"
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseFormOverlay}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Post
              </button>
            </div>

            {/* Close button for the overlay */}
            <button
              onClick={handleCloseFormOverlay}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;