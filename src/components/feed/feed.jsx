import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, ArrowUpRight, Bookmark, Share2, MoreHorizontal, Image, Lock, 
  LineChart, Activity, User, Home, Search, Mail, Plus, TrendingUp, 
  DollarSign, Zap, Star, MessageSquare, Users, HelpCircle, 
  ChevronRight, Bell, BarChart2, Gift, Settings
} from 'lucide-react';

import { useAuth, useFeedPosts, useWallet, useTopExperts,  } from '../../hooks/hooks';
import NewPost from './newPost';
import RenderPost from './renderPost';

const SocialFeed = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandPostInput, setExpandPostInput] = useState(false);
  const mainContentRef = useRef(null);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  
  const { user } = useAuth();

  const { 
    posts, 
    loading,
    hasMore,
    loadMore, 
    changeFeedType,
    toggleLike,
    toggleBookmark,
    addView,
    unlockContent,
    addPost
  } = useFeedPosts(user?.id, activeTab);
  const { balance, loading: walletLoading } = useWallet(user?.id);
  const { experts, loading: expertsLoading } = useTopExperts(4);

  const handleDirectMessage = (userId, username, rate) => {
    navigate(`/messages/${userId}`, { 
      state: { recipientId: userId, recipientName: username, rate }
    });
  };

  // Enable independent scrolling for each section
  useEffect(() => {
    const handleScroll = (e) => {
      // Prevent scroll events from bubbling up to parent elements
      e.stopPropagation();
    };
  
    // Cache current ref values inside the effect
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
  

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    changeFeedType(tab);
  };
  
  const handlePostCreated = (newPost) => {
    addPost(newPost);
    setShowPostModal(false);
    setExpandPostInput(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* Left Sidebar - Independent Scrolling */}
      <div 
        ref={leftSidebarRef}
        className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-3 overflow-y-auto h-screen sticky top-0"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold py-2 px-3 rounded-lg mb-6">
          PayPadm
        </div>
        
        <nav className="space-y-1 mb-4">
          <Link to="/" className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            <span className="font-medium">Home</span>
          </Link>
          <Link to="/transactions" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-medium">Transactions</span>
          </Link>
          <Link to="/chat" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="font-medium">Messages</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
          </Link>
          <Link to="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Profile</span>
          </Link>
          <Link to="/analytics" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <BarChart2 className="w-4 h-4 mr-2" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link to="/notifications" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-4 h-4 mr-2" />
            <span className="font-medium">Notifications</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">5</span>
          </Link>
        </nav>
        
        <div className="p-2 bg-gray-50 rounded-lg mb-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Today's Earnings</span>
              <span className="font-medium text-red-600">
                {walletLoading ? '...' : `${balance ? (balance * 0.15).toLocaleString() : 0} UGX`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Messages</span>
              <span className="font-medium text-gray-900">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-green-600">96%</span>
            </div>
          </div>
        </div>
        
        <div className="p-2 bg-red-50 rounded-lg mb-4 border border-red-100">
          <div className="flex items-center text-red-800 mb-1">
            <Gift className="w-4 h-4 mr-1" />
            <h3 className="text-xs font-semibold">Referral Program</h3>
          </div>
          <p className="text-xs text-red-700 mb-1">Invite friends and earn 5,000 UGX!</p>
          <button className="w-full bg-red-600 text-white text-xs py-1 px-2 rounded-lg font-medium hover:bg-red-700">
            Invite Friends
          </button>
        </div>
        
        <div className="mt-auto space-y-1 text-xs">
          <Link to="/help" className="flex items-center justify-between text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <HelpCircle size={14} className="mr-2" />
              <span>Help Center</span>
            </div>
            <ChevronRight size={14} />
          </Link>
          <Link to="/settings" className="flex items-center justify-between text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <Settings size={14} className="mr-2" />
              <span>Settings</span>
            </div>
            <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="mt-3">
          <button 
            onClick={() => setShowPostModal(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition shadow-sm text-sm"
          >
            New Post
          </button>
        </div>
      </div>
      
      {/* Main Content - Independent Scrolling */}
      <div 
        ref={mainContentRef}
        className="flex-1 border-l border-r border-gray-200 bg-white overflow-y-auto h-screen"
      >
        {/* Top Navigation - Sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex space-x-1">
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'discover' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('discover')}
              >
                Discover
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'premium' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('premium')}
              >
                Premium
              </button>
              <button 
                className={`px-3 py-2 font-medium text-sm rounded-full ${activeTab === 'trending' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('trending')}
              >
                <TrendingUp size={16} />
              </button>
            </div>
            
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img src="/api/placeholder/32/32" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {/* Create Post - In-feed composer */}
        <div className="p-3 border-b border-gray-200">
          {expandPostInput ? (
            <NewPost 
              user={user}
              onPostCreated={handlePostCreated}
              onClose={() => setExpandPostInput(false)}
              inFeed={true}
            />
          ) : (
            <div className="flex">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img src="/api/placeholder/32/32" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Share your insights or ask a question..."
                  className="w-full p-2 border-none focus:ring-0 text-gray-700 text-sm"
                  onClick={() => setExpandPostInput(true)}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1 text-red-600">
                    <button 
                      className="p-1 rounded-full hover:bg-red-50"
                      onClick={() => setExpandPostInput(true)}
                    >
                      <Image size={16} />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-red-50"
                      onClick={() => setExpandPostInput(true)}
                    >
                      <DollarSign size={16} />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-red-50"
                      onClick={() => setExpandPostInput(true)}
                    >
                      <Lock size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setExpandPostInput(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full font-medium text-xs hover:from-red-700 hover:to-red-800 shadow-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center p-4 text-gray-500 text-sm">
            No posts found. Change your feed type or follow more users.
          </div>
        )}
        
        <div>
          {posts.map((post) => (
            <RenderPost key={post.post_id} post={post} toggleLike={toggleLike}
            toggleBookmark={toggleBookmark}
            addView={addView} unlockContent={unlockContent} />
          ))}
        </div>
        
        {!loading && posts.length > 0 && hasMore && (
          <div className="p-3 flex justify-center">
            <button 
              className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition text-sm"
              onClick={loadMore}
            >
              Load More
            </button>
          </div>
        )}

        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h3 className="font-bold">Create Post</h3>
                <button 
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <NewPost 
                  user={user}
                  onPostCreated={handlePostCreated}
                  onClose={() => setShowPostModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Right Sidebar - Independent Scrolling */}
      <div 
        ref={rightSidebarRef}
        className="hidden lg:flex flex-col w-80 p-3 overflow-y-auto h-screen sticky top-0"
      >
        <div className="bg-gray-100 rounded-full p-2 mb-3">
          <div className="flex items-center">
            <Search size={16} className="text-gray-500 mr-1" />
            <input
              type="text"
              placeholder="Search experts & topics"
              className="bg-transparent border-none w-full focus:outline-none text-gray-700 text-sm"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-gray-900">Your Account</h3>
            <Link to="/analytics" className="text-red-600 text-xs hover:text-red-700">View Stats</Link>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Balance</span>
            <span className="text-lg font-bold text-gray-900">
              {walletLoading ? '...' : `${balance ? balance.toLocaleString() : 0} UGX`}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            <span>This month earnings</span>
            <span className="font-medium text-red-600">+157,500 UGX</span>
          </div>
          
          <div className="space-y-2 mb-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Mail size={14} className="mr-1" />
                <span>Messages received</span>
              </div>
              <span className="font-medium">37</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <ArrowUpRight size={14} className="mr-1" />
                <span>Response rate</span>
              </div>
              <span className="font-medium text-green-600">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Star size={14} className="mr-1" />
                <span>Average rating</span>
              </div>
              <span className="font-medium text-amber-600">4.8/5</span>
            </div>
          </div>
          
          <Link to="/wallet/withdraw">
            <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-1.5 px-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition shadow-sm text-sm">
              Withdraw Funds
            </button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-2">Your Message Rate</h3>
          
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-700 text-xs">Current rate</span>
              <span className="font-bold">5,000 UGX/msg</span>
            </div>
            <p className="text-xs text-gray-500">You receive 85% after platform fees</p>
          </div>
          
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Adjust your rate</label>
            <input 
              type="range" 
              min="1000" 
              max="20000" 
              defaultValue="5000" 
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1,000</span>
              <span>20,000</span>
            </div>
          </div>
          
          <div className="p-2 bg-red-50 rounded-lg mb-3 text-xs">
            <div className="flex items-center text-red-800 mb-1">
              <Zap size={14} className="mr-1" />
              <span className="font-medium">Rate Tip</span>
            </div>
            <p className="text-red-800">Experts like you typically charge 3,000-7,000 UGX per message</p>
          </div>
          
          <Link to="/settings/message-rate">
            <button className="w-full bg-red-600 text-white py-1.5 px-3 rounded-lg font-medium hover:bg-red-700 transition shadow-sm text-xs">
              Update Rate
            </button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Top Earning Experts</h3>
          
          {expertsLoading ? (
            <div className="flex justify-center items-center p-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            experts.map((expert, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-red-100">
                    <img 
                      src={expert.profile_avatar_url || "/api/placeholder/32/32"} 
                      alt={expert.username} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-semibold text-sm text-gray-900">{expert.fullname || expert.username}</h4>
                      {expert.is_verified && (
                        <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center ml-1">
                          <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-gray-500 mr-1">
                        {expert.rate_per_message.toLocaleString()} UGX
                      </span>
                      <span className="flex items-center text-amber-600">
                        <Star size={10} className="mr-0.5" fill="currentColor" />
                        {expert.rating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="bg-red-600 text-white text-xs px-2 py-1 rounded-full hover:bg-red-700 shadow-sm"
                  onClick={() => handleDirectMessage(expert.user_id, expert.username, expert.rate_per_message)}
                >
                  DM
                </button>
              </div>
            ))
          )}
          
          <Link to="/experts" className="text-red-600 text-xs mt-2 inline-block hover:text-red-700">
            View all experts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;