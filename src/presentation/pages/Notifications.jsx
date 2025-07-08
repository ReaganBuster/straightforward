import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ArrowUpRight,
  Clock,
  Share2,
  Check,
  CheckCheck,
  LineChart,
  Activity,
  User,
  Home,
  Search,
  Mail,
  Plus,
  TrendingUp,
  DollarSign,
  Zap,
  Star,
  MessageSquare,
  Users,
  HelpCircle,
  ChevronRight,
  Bell,
  BarChart2,
  Gift,
  Settings,
  ChevronDown,
} from 'lucide-react';

const Notifications = ({ user }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const mainContentRef = useRef(null);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);

  // For demonstration purposes - simulate fetching notifications
  useEffect(() => {
    if (!user?.user_id) return;

    setLoading(true);

    // Simulated API call - In a real app, you'd fetch from supabase
    setTimeout(() => {
      const mockNotifications = [
        {
          notification_id: '1',
          user_id: user.user_id,
          content: 'Your post received 50 new views',
          notification_type: 'post_view',
          reference_id: 'post-123',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          actor: {
            name: 'System',
            avatar_url: null,
          },
        },
        {
          notification_id: '2',
          user_id: user.user_id,
          content: 'Sarah liked your post about mobile payments',
          notification_type: 'post_like',
          reference_id: 'post-456',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          actor: {
            name: 'Sarah Johnson',
            avatar_url: '/api/placeholder/32/32',
          },
        },
        {
          notification_id: '3',
          user_id: user.user_id,
          content: 'You received a new message from John',
          notification_type: 'new_message',
          reference_id: 'message-789',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          actor: {
            name: 'John Smith',
            avatar_url: '/api/placeholder/32/32',
          },
        },
        {
          notification_id: '4',
          user_id: user.user_id,
          content: 'Your content was unlocked by a user for 5,000 UGX',
          notification_type: 'content_unlock',
          reference_id: 'unlock-246',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          actor: {
            name: 'Daniel Brown',
            avatar_url: '/api/placeholder/32/32',
          },
        },
        {
          notification_id: '5',
          user_id: user.user_id,
          content: 'New subscriber: Michael paid 15,000 UGX for monthly access',
          notification_type: 'new_subscription',
          reference_id: 'sub-357',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          actor: {
            name: 'Michael Wilson',
            avatar_url: '/api/placeholder/32/32',
          },
        },
        {
          notification_id: '6',
          user_id: user.user_id,
          content: 'Your post is trending in Finance category',
          notification_type: 'trending_post',
          reference_id: 'post-789',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
          actor: {
            name: 'System',
            avatar_url: null,
          },
        },
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, [user]);

  // Format relative time
  const formatRelativeTime = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? 'yesterday' : `${days}d ago`;
    }
  };

  // Safely format currency values
  //   const formatCurrency = (value) => {
  //     if (value === undefined || value === null) return '0';
  //     return (Number(value) || 0).toLocaleString();
  //   };

  // Handle marking notification as read
  const markAsRead = notificationId => {
    // In a real app, you'd call supabase and update the notification
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.notification_id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  // Handle mark all as read
  const markAllAsRead = () => {
    // In a real app, you'd call supabase and update all notifications
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        is_read: true,
      }))
    );
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    if (
      activeTab === 'messages' &&
      notification.notification_type === 'new_message'
    )
      return true;
    if (
      activeTab === 'payments' &&
      ['content_unlock', 'new_subscription'].includes(
        notification.notification_type
      )
    )
      return true;
    return false;
  });

  // Handle notification click
  const handleNotificationClick = notification => {
    markAsRead(notification.notification_id);

    // Navigate based on notification type
    switch (notification.notification_type) {
      case 'post_like':
      case 'post_view':
      case 'trending_post':
        navigate(`/post/${notification.reference_id}`);
        break;
      case 'new_message':
        navigate(`/messages`);
        break;
      case 'content_unlock':
      case 'new_subscription':
        navigate(`/transactions`);
        break;
      default:
        console.log('No action for this notification type');
    }
  };

  // Load more notifications
  const loadMore = () => {
    // In a real app, you'd fetch more notifications from supabase
    setLoading(true);
    setTimeout(() => {
      const mockMoreNotifications = [
        {
          notification_id: '7',
          user_id: user.user_id,
          content: 'Your DM access was purchased by Emily for 2,000 UGX',
          notification_type: 'dm_access',
          reference_id: 'dm-123',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          actor: {
            name: 'Emily Clark',
            avatar_url: '/api/placeholder/32/32',
          },
        },
        {
          notification_id: '8',
          user_id: user.user_id,
          content: 'Your withdrawal of 35,000 UGX has been processed',
          notification_type: 'withdrawal',
          reference_id: 'transaction-456',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
          actor: {
            name: 'System',
            avatar_url: null,
          },
        },
      ];

      setNotifications(prev => [...prev, ...mockMoreNotifications]);
      setHasMore(false);
      setLoading(false);
    }, 1000);
  };

  // Enable independent scrolling for each section
  useEffect(() => {
    const handleScroll = e => {
      e.stopPropagation();
    };

    const mainContent = mainContentRef.current;
    const leftSidebar = leftSidebarRef.current;
    const rightSidebar = rightSidebarRef.current;

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    if (leftSidebar) {
      leftSidebar.addEventListener('scroll', handleScroll);
    }
    if (rightSidebar) {
      rightSidebar.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
      if (leftSidebar) {
        leftSidebar.removeEventListener('scroll', handleScroll);
      }
      if (rightSidebar) {
        rightSidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* Main Content - Independent Scrolling */}
      <div
        ref={mainContentRef}
        className="flex-1 border-l border-r border-gray-200 bg-white overflow-y-auto h-screen"
      >
        {/* Top Navigation - Sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-3 py-3">
            <h1 className="font-bold text-xl text-gray-900">Notifications</h1>
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1.5 font-medium text-xs rounded-full ${activeTab === 'all' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1.5 font-medium text-xs rounded-full ${activeTab === 'unread' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread
              </button>
              {/* <button 
                className={`px-3 py-1.5 font-medium text-xs rounded-full ${activeTab === 'messages' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button> */}
              {/* <button 
                className={`px-3 py-1.5 font-medium text-xs rounded-full ${activeTab === 'payments' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('payments')}
              >
                Payments
              </button> */}
            </div>

            <button
              onClick={markAllAsRead}
              className="text-red-600 text-xs font-medium hover:text-red-700 flex items-center"
            >
              <CheckCheck size={14} className="mr-1" />
              Mark all read
            </button>
          </div>
        </div>

        {/* {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )} */}

        {!loading && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell size={48} className="text-gray-300 mb-3" />
            <h3 className="font-medium text-gray-700 mb-1">No notifications</h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'unread'
                ? "You've read all notifications!"
                : activeTab === 'all'
                  ? "You don't have any notifications yet"
                  : `No ${activeTab} notifications`}
            </p>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {filteredNotifications.map(notification => (
            <div
              key={notification.notification_id}
              className={`p-3 hover:bg-gray-50 cursor-pointer flex items-start ${notification.is_read ? '' : 'bg-red-50'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex-shrink-0 mr-3 mt-0.5 relative">
                {notification.actor.avatar_url ? (
                  <img
                    src={notification.actor.avatar_url}
                    alt={notification.actor.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold">
                    {notification.notification_type === 'post_view' ? (
                      <Activity size={20} />
                    ) : notification.notification_type === 'trending_post' ? (
                      <TrendingUp size={20} />
                    ) : (
                      <Bell size={20} />
                    )}
                  </div>
                )}

                {!notification.is_read && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-900 mr-1">
                    {notification.actor.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>

                <p className="text-sm text-gray-700">{notification.content}</p>

                {(notification.notification_type === 'content_unlock' ||
                  notification.notification_type === 'new_subscription' ||
                  notification.notification_type === 'dm_access' ||
                  notification.notification_type === 'withdrawal') && (
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <DollarSign size={12} className="mr-0.5" />
                    {
                      notification.content.match(
                        /\d{1,3}(,\d{3})*(\.\d+)? UGX/
                      )[0]
                    }
                  </div>
                )}
              </div>

              <div className="ml-2 flex-shrink-0">
                {notification.is_read ? (
                  <Check size={16} className="text-gray-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}

        {!loading && filteredNotifications.length > 0 && hasMore && (
          <div className="p-3 flex justify-center">
            <button
              className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition text-sm"
              onClick={loadMore}
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Independent Scrolling */}
      <div
        ref={rightSidebarRef}
        className="hidden lg:flex flex-col w-80 p-3 overflow-y-auto h-screen sticky top-0"
      >
        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-2">
            Notification Settings
          </h3>

          <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Email notifications</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mobile push notifications
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                New message notifications
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Payment notifications</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-2">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notification frequency
              </label>
              <select
                className="bg-gray-100 border border-gray-200 text-gray-700 py-1.5 px-2 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-red-500 w-full text-sm"
                defaultValue="instant"
              >
                <option value="instant">Instant</option>
                <option value="hourly">Hourly digest</option>
                <option value="daily">Daily digest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-2">
            Recent Activity
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock size={14} className="text-gray-500 mr-1.5" />
                <span className="text-sm text-gray-700">Views today</span>
              </div>
              <span className="font-medium text-sm">124</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart size={14} className="text-gray-500 mr-1.5" />
                <span className="text-sm text-gray-700">New likes</span>
              </div>
              <span className="font-medium text-sm">18</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare size={14} className="text-gray-500 mr-1.5" />
                <span className="text-sm text-gray-700">Unread messages</span>
              </div>
              <span className="font-medium text-sm">3</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign size={14} className="text-gray-500 mr-1.5" />
                <span className="text-sm text-gray-700">Today's earnings</span>
              </div>
              <span className="font-medium text-sm">45,000 UGX</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-2">
            Tips & Suggestions
          </h3>

          <div className="space-y-3">
            <div className="p-2 bg-red-50 rounded-lg text-xs">
              <div className="flex items-center text-red-800 mb-1">
                <Zap size={14} className="mr-1" />
                <span className="font-medium">Pro Tip</span>
              </div>
              <p className="text-red-800">
                Post regularly to keep your followers engaged and increase your
                earnings potential.
              </p>
            </div>

            <div className="p-2 bg-amber-50 rounded-lg text-xs">
              <div className="flex items-center text-amber-800 mb-1">
                <Star size={14} className="mr-1" />
                <span className="font-medium">Try Premium</span>
              </div>
              <p className="text-amber-800">
                Unlock premium features to grow your audience and increase your
                earnings.
              </p>
              <button className="mt-1 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-1 px-2 rounded-lg text-xs font-medium hover:from-amber-600 hover:to-amber-700">
                Upgrade Now
              </button>
            </div>

            <div className="p-2 bg-blue-50 rounded-lg text-xs">
              <div className="flex items-center text-blue-800 mb-1">
                <Users size={14} className="mr-1" />
                <span className="font-medium">Community Insight</span>
              </div>
              <p className="text-blue-800">
                Respond promptly to messages to maintain a high response rate
                and build trust with your audience.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 md:hidden z-10">
          <Link to="/" className="flex flex-col items-center p-1">
            <Home className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Home</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center p-1">
            <Search className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Search</span>
          </Link>
          <Link to="/new-post" className="flex flex-col items-center p-1">
            <div className="bg-red-600 rounded-full p-2">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </Link>
          <Link to="/messages" className="flex flex-col items-center p-1">
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Messages</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-1">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
