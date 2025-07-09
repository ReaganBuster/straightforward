import { useRef, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  DollarSign,
  MessageSquare,
  User,
  BarChart2,
  Bell,
  HelpCircle,
  ChevronRight,
  Gift,
  Settings,
  X,
} from 'lucide-react';
import { useWallet } from '@presentation/hooks/useWallet';
import NewPost from '@presentation/components/NewPost/NewPost';

// Mock hook for notifications (replace with real implementation)
const useNotifications = userId => {
  return {
    unreadMessages: userId ? 3 : 0,
    unreadNotifications: userId ? 5 : 0,
    newMessages: userId ? 12 : 0,
  };
};

const LeftSidebar = ({ user, isMobileOpen, toggleSidebar }) => {
  const leftSidebarRef = useRef(null);
  const { balance, loading: walletLoading } = useWallet(user?.id);
  const { unreadMessages, unreadNotifications, newMessages } = useNotifications(
    user?.id
  );
  const [showPostModal, setShowPostModal] = useState(false);

  const formatCurrency = value => {
    if (value === undefined || value === null) return '0';
    return (Number(value) || 0).toLocaleString();
  };

  useEffect(() => {
    const handleScroll = e => {
      e.stopPropagation();
    };

    const leftSidebar = leftSidebarRef.current;
    if (leftSidebar) {
      leftSidebar.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (leftSidebar) {
        leftSidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleNewPostClick = () => {
    if (isMobileOpen) toggleSidebar();
    setShowPostModal(true);
  };

  const handlePostCreated = () => {
    setShowPostModal(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h3 className="font-bold">Create Post</h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3 overflow-y-auto max-h-[80vh]">
              <NewPost
                user={user}
                onPostCreated={handlePostCreated}
                onClose={() => setShowPostModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div
        ref={leftSidebarRef}
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 p-3 overflow-y-auto z-50
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:flex md:flex-col
        `}
      >
        <div className="flex items-center justify-between mb-6">
          
            <img
              src="/favicon.svg" // Path to your favicon.ico file
              alt="StraightFWD"
              className="h-24 w-24" // Adjusted size: h-7 w-7 gives 28x28px
            />
          <button
            className="md:hidden text-gray-600 hover:text-gray-800"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1 mb-4">
          <NavLink
            to="/"
            exact
            className={({ isActive }) =>
              `md:flex items-center px-3 py-2 rounded-lg hidden ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="font-medium">Home</span>
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `md:flex items-center px-3 py-2 rounded-lg hidden ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="font-medium">Messages</span>
            {unreadMessages > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadMessages}
              </span>
            )}
          </NavLink>
          {/* <NavLink 
            to="/transactions" 
            className={({ isActive }) => 
              `md:flex items-center px-3 py-2 rounded-lg hidden ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-medium">Transactions</span>
          </NavLink> */}

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `md:flex items-center px-3 py-2 rounded-lg hidden ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Profile</span>
          </NavLink>
          {/* <NavLink 
            to="/analytics" 
            className={({ isActive }) => 
              `flex items-center px-3 py-2 rounded-lg ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            <span className="font-medium">Analytics</span>
          </NavLink> */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `md:flex items-center px-3 py-2 rounded-lg hidden ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <Bell className="w-4 h-4 mr-2" />
            <span className="font-medium">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </NavLink>
        </nav>

        {/* <div className="p-2 bg-gray-50 rounded-lg mb-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">
            Quick Stats
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Today's Earnings</span>
              <span className="font-medium text-red-600">
                {walletLoading
                  ? '...'
                  : `${formatCurrency(balance ? balance * 0.15 : 0)} UGX`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Messages</span>
              <span className="font-medium text-gray-900">{newMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-green-600">96%</span>
            </div>
          </div>
        </div> */}

        {/* <div className="p-2 bg-red-50 rounded-lg mb-4 border border-red-100">
          <div className="flex items-center text-red-800 mb-1">
            <Gift className="w-4 h-4 mr-1" />
            <h3 className="text-xs font-semibold">Referral Program</h3>
          </div>
          <p className="text-xs text-red-700 mb-1">Invite friends and earn 5,000 UGX!</p>
          <button className="w-full bg-red-600 text-white text-xs py-1 px-2 rounded-lg font-medium hover:bg-red-700">
            Invite Friends
          </button>
        </div> */}

        <div className="mt-auto space-y-1 text-xs">
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `flex items-center justify-between text-gray-600 p-2 rounded ${isActive ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'}`
            }
          >
            <div className="flex items-center">
              <HelpCircle size={14} className="mr-2" />
              <span>Help Center</span>
            </div>
            <ChevronRight size={14} />
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center justify-between text-gray-600 p-2 rounded ${isActive ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'}`
            }
          >
            <div className="flex items-center">
              <Settings size={14} className="mr-2" />
              <span>Settings</span>
            </div>
            <ChevronRight size={14} />
          </NavLink>
        </div>

        <div className="mt-3">
          <button
            onClick={handleNewPostClick}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition shadow-sm text-sm"
          >
            New Post
          </button>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
