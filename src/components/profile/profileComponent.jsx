import { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, ArrowUpRight, Bookmark, Share2, Grid, Film, 
  MessageSquare, Settings, ChevronLeft, Users, Star,
  Bell, Edit, MoreHorizontal, Lock, DollarSign, Camera,
  Home, Search, Mail, User, BarChart2, HelpCircle, ChevronRight,
  TrendingUp, Gift
} from 'lucide-react';

import { useAuth, useProfile, useUserPosts, useWallet, useTopExperts } from '../../hooks/hooks';

const Profile = ({user}) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('media');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  // Refs for independent scrolling
  const mainContentRef = useRef(null);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  
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
  
  const { 
    profile, 
    loading: profileLoading,
    stats,
    isSubscribed,
    toggleFollow,
    subscribe
  } = useProfile(user.id);
  
  const { 
    posts, 
    loading: postsLoading,
    hasMore,
    loadMore
  } = useUserPosts(profile?.user_id, activeTab);
  
  // Additional hooks for sidebars
  const { balance, loading: walletLoading } = useWallet(user?.id);
  const { experts, loading: expertsLoading } = useTopExperts(4);
  
  const isOwnProfile = currentUser?.user_id === profile?.user_id;
  
  const handleMessage = () => {
    navigate(`/m/${profile.user_id}`, { 
      state: { 
        recipientId: profile.user_id, 
        recipientName: profile.username,
        rate: profile.rate_per_msg
      }
    });
  };
  
  const handleSubscribe = () => {
    if (profile.requires_subscription) {
      setShowSubscribeModal(true);
    } else {
      subscribe(profile.user_id);
    }
  };
  
  const handleDirectMessage = (userId, username, rate) => {
    navigate(`/messages/${userId}`, { 
      state: { recipientId: userId, recipientName: username, rate }
    });
  };
  
  // Media masonry grid calculation
  const calculateSpans = (event) => {
    const img = event.target;
    const container = document.getElementById('masonry-grid');
    if (!container) return;
    
    const containerWidth = container.offsetWidth;
    const columnWidth = containerWidth / 3;
    const height = img.naturalHeight;
    const spans = Math.ceil(height / 10);
    
    img.parentElement.style.gridRowEnd = `span ${spans}`;
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
          <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
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
          <Link to="/profile" className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg">
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
        {/* Header - Back Button and Actions */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="ml-3">
              <h1 className="font-bold text-lg">{profileLoading ? 'Loading...' : profile?.name || profile?.username}</h1>
              <p className="text-xs text-gray-500">
                {postsLoading ? '...' : `${posts.length} posts`}
              </p>
            </div>
          </div>
          
          {isOwnProfile ? (
            <Link to="/settings/profile">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings size={18} />
              </button>
            </Link>
          ) : (
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
        
        {profileLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Profile Info */}
            <div className="p-4">
              <div className="flex mb-4">
                {/* Profile Image */}
                <div className="w-20 h-20 rounded-full border-2 border-red-100 overflow-hidden mr-4">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-red-100 to-red-200 w-full h-full flex items-center justify-center">
                      <Camera size={24} className="text-red-400" />
                    </div>
                  )}
                </div>
                
                {/* Stats and Action Buttons */}
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h2 className="font-bold text-lg mr-1">{profile.name || profile.username}</h2>
                    {profile.is_verified && (
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{stats?.total_views || 0}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {profile.rate_per_msg?.toLocaleString() || 0} UGX
                      </div>
                      <div className="text-xs text-gray-500">Message Rate</div>
                    </div>
                    <div className="flex items-center">
                      <Star size={14} fill="#f59e0b" className="text-amber-500 mr-1" />
                      <span className="font-semibold">{profile.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isOwnProfile ? (
                      <Link to="/settings/profile" className="flex-1">
                        <button className="w-full bg-gray-100 text-gray-800 rounded-lg py-1.5 text-sm font-medium">
                          Edit Profile
                        </button>
                      </Link>
                    ) : (
                      <>
                        <button 
                          onClick={handleMessage}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg py-1.5 text-sm font-medium shadow-sm"
                        >
                          Message
                        </button>
                        <button 
                          onClick={() => toggleFollow(profile.user_id)}
                          className="py-1.5 px-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                        >
                          {profile.is_following ? 'Following' : 'Follow'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <div className="mb-4 text-sm">
                  <p className="whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}
              
              {/* Expertise Badge */}
              {profile.expertise && (
                <div className="flex flex-wrap mb-2">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                    {profile.expertise}
                  </span>
                </div>
              )}

              {/* Subscription Info */}
              {!isOwnProfile && profile.requires_subscription && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg mb-4 border border-red-100">
                  <div className="flex items-center mb-1">
                    <Lock size={14} className="text-red-600 mr-1" />
                    <h4 className="text-sm font-semibold text-red-800">Exclusive Content</h4>
                  </div>
                  <p className="text-xs text-red-700 mb-2">
                    {profile.subscription_description || 'Subscribe to access exclusive content and premium posts'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-red-800">
                      {(profile.subscription_fee || 15000).toLocaleString()} UGX / month
                    </div>
                    <button 
                      onClick={handleSubscribe}
                      className="bg-red-600 text-white text-xs py-1 px-3 rounded-full font-medium shadow-sm"
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Tabs */}
            <div className="border-t border-gray-200">
              <div className="flex justify-around">
                <button 
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'media' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                >
                  <Grid size={18} className="mx-auto" />
                </button>
                <button 
                  onClick={() => setActiveTab('premium')}
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'premium' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                >
                  <Lock size={18} className="mx-auto" />
                </button>
                <button 
                  onClick={() => setActiveTab('videos')}
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'videos' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                >
                  <Film size={18} className="mx-auto" />
                </button>
              </div>
            </div>
            
            {/* Media Grid */}
            {postsLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  {activeTab === 'media' ? (
                    <Grid size={24} className="text-gray-400" />
                  ) : activeTab === 'premium' ? (
                    <Lock size={24} className="text-gray-400" />
                  ) : (
                    <Film size={24} className="text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">No content yet</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'premium' 
                    ? 'No premium content has been shared yet'
                    : activeTab === 'videos'
                      ? 'No videos have been uploaded yet'
                      : 'No media content has been shared yet'}
                </p>
              </div>
            ) : (
              <div id="masonry-grid" className="grid grid-cols-3 gap-0.5 bg-gray-100">
                {posts.map((post) => (
                  <div key={post.post_id} className="relative">
                    <Link to={`/post/${post.post_id}`}>
                      <div className="relative pb-[100%]">
                        {post.image_url ? (
                          <img 
                            src={post.image_url} 
                            alt={`Post by ${profile.username}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onLoad={calculateSpans}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <div className="text-xs text-gray-500 p-2 truncate w-full text-center">
                              {post.content.substring(0, 50)}...
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay for premium content */}
                        {post.is_premium && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <Lock size={16} className="text-white" />
                          </div>
                        )}
                        
                        {/* Stats Overlay on Hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex items-center space-x-3 text-white font-medium">
                            <div className="flex items-center">
                              <Heart size={16} className="mr-1" fill="white" />
                              <span>{post.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare size={16} className="mr-1" />
                              <span>{post.comments_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {/* Load More */}
            {!postsLoading && posts.length > 0 && hasMore && (
              <div className="p-4 flex justify-center">
                <button 
                  className="text-red-600 bg-red-50 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                  onClick={loadMore}
                >
                  Load More
                </button>
              </div>
            )}
          </>
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
        
        {/* Profile Stats */}
        {!profileLoading && (isOwnProfile || profile) && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3">Profile Stats</h3>
            
            <div className="space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Total views</span>
                <span className="font-medium text-sm">{stats?.total_views?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Followers</span>
                <span className="font-medium text-sm">{stats?.followers_count?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Rating</span>
                <div className="flex items-center">
                  <Star size={14} fill="#f59e0b" className="text-amber-500 mr-1" />
                  <span className="font-medium text-sm">{profile.rating?.toFixed(1) || '4.5'}</span>
                </div>
              </div>
            </div>
            
            {isOwnProfile && (
              <Link to="/analytics/profile">
                <button className="w-full bg-gray-100 text-gray-800 py-1.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition text-xs">
                  View Detailed Stats
                </button>
              </Link>
            )}
          </div>
        )}
        
        {/* Top Earning Experts */}
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
                        {expert.rate_per_message?.toLocaleString() || '5,000'} UGX
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
          
          <div className="mt-3 pt-2">
            <Link to="/experts">
              <button className="w-full flex items-center justify-center bg-gray-100 text-red-600 py-1.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition text-xs">
                <TrendingUp size={14} className="mr-1" />
                View All Experts
              </button>
            </Link>
          </div>
        </div>
        
        {/* Subscription Modal */}
        {showSubscribeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-xl p-4 max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Subscribe to {profile.name || profile.username}</h3>
                <button 
                  onClick={() => setShowSubscribeModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Subscribing will give you access to all premium content from this creator for one month.
                </p>
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-red-800">Monthly Subscription</h4>
                      <p className="text-xs text-red-700">{profile.subscription_description || 'Access to exclusive premium content'}</p>
                    </div>
                    <span className="font-bold text-red-800">{(profile.subscription_fee || 15000).toLocaleString()} UGX</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowSubscribeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    subscribe(profile.user_id);
                    setShowSubscribeModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded-lg font-medium shadow-sm"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;