import { useState } from 'react';
import { Heart, ArrowUpRight, Bookmark, Share2, MoreHorizontal, Image, Smile, LineChart, Activity, Calendar, User, Home, Search, Mail, Plus, TrendingUp, DollarSign, Zap, Star, Clock, Award, MessageSquare, CreditCard, Lock, Users, ThumbsUp, Settings, HelpCircle, ChevronRight, Bell, BarChart2, Gift } from 'lucide-react';

const SocialFeed = () => {
  const [posts, setPosts] = useState(dummyPosts);
  const [activeTab, setActiveTab] = useState('discover');
  
  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
        };
      }
      return post;
    }));
  };
  
  const handleBookmark = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  const handleDirectMessage = (userId, username, rate) => {
    console.log(`Opening DM with ${username} (ID: ${userId}) at ${rate} UGX/message`);
    // This would open the DM modal/payment flow in a real app
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Enhanced */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-xl font-bold py-2 px-4 rounded-lg">
            PayPadm
          </div>
        </div>
        
        <nav className="space-y-1 mb-6">
          <a href="#" className="flex items-center px-3 py-3 text-red-600 bg-red-50 rounded-lg">
            <Home className="w-5 h-5 mr-3" />
            <span className="font-medium">Home</span>
          </a>
          <a href="#" className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <DollarSign className="w-5 h-5 mr-3" />
            <span className="font-medium">Transactions</span>
          </a>
          <a href="#" className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <MessageSquare className="w-5 h-5 mr-3" />
            <span className="font-medium">Messages</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
          </a>
          <a href="#" className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <User className="w-5 h-5 mr-3" />
            <span className="font-medium">Profile</span>
          </a>
          <a href="#" className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <BarChart2 className="w-5 h-5 mr-3" />
            <span className="font-medium">Analytics</span>
          </a>
          <a href="#" className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 mr-3" />
            <span className="font-medium">Notifications</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">5</span>
          </a>
        </nav>
        
        {/* Quick Stats Section */}
        <div className="p-3 bg-gray-50 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Today's Earnings</span>
              <span className="font-medium text-red-600">35,000 UGX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New Messages</span>
              <span className="font-medium text-gray-900">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-green-600">96%</span>
            </div>
          </div>
        </div>
        
        {/* Referral Program */}
        <div className="p-3 bg-red-50 rounded-lg mb-6 border border-red-100">
          <div className="flex items-center text-red-800 mb-2">
            <Gift className="w-4 h-4 mr-2" />
            <h3 className="text-sm font-semibold">Referral Program</h3>
          </div>
          <p className="text-xs text-red-700 mb-2">Invite friends and earn 5,000 UGX for each new user!</p>
          <button className="w-full bg-red-600 text-white text-xs py-1.5 px-2 rounded-lg font-medium hover:bg-red-700">
            Invite Friends
          </button>
        </div>
        
        {/* Help & Resources */}
        <div className="mt-auto space-y-2">
          <a href="#" className="flex items-center justify-between text-sm text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <HelpCircle size={16} className="mr-2" />
              <span>Help Center</span>
            </div>
            <ChevronRight size={16} />
          </a>
          <a href="#" className="flex items-center justify-between text-sm text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <Settings size={16} className="mr-2" />
              <span>Settings</span>
            </div>
            <ChevronRight size={16} />
          </a>
        </div>
        
        <div className="mt-4">
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition shadow-md">
            New Post
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto border-l border-r border-gray-200 bg-white">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex space-x-1">
              <button 
                className={`px-6 py-3 font-medium text-sm rounded-full ${activeTab === 'discover' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('discover')}
              >
                Discover
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm rounded-full ${activeTab === 'premium' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('premium')}
              >
                Premium
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm rounded-full ${activeTab === 'trending' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('trending')}
              >
                <TrendingUp size={16} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                <img 
                  src="/api/placeholder/32/32" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Post */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src="/api/placeholder/40/40" 
                alt="Your profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Share your insights or ask a question..."
                className="w-full p-2 border-none focus:ring-0 text-gray-700"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2 text-red-600">
                  <button className="p-2 rounded-full hover:bg-red-50">
                    <Image size={18} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-red-50">
                    <DollarSign size={18} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-red-50">
                    <Lock size={18} />
                  </button>
                </div>
                <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 rounded-full font-medium text-sm hover:from-red-700 hover:to-red-800 shadow-sm">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Post Feed */}
        <div className="divide-y divide-gray-200">
          {posts.map(post => (
            <div key={post.id} className="p-4">
              {/* Post Header */}
              <div className="flex justify-between">
                <div className="flex">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-red-100">
                    <img 
                      src={post.avatar || "/api/placeholder/40/40"} 
                      alt={post.username} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-gray-900 mr-1">{post.name}</h3>
                      {post.verified && (
                        <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      )}
                      <span className="text-gray-500 text-sm ml-1">@{post.username}</span>
                      <span className="text-gray-500 text-sm mx-1">·</span>
                      <span className="text-gray-500 text-sm">{post.time}</span>
                    </div>
                    <div className="flex items-center mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.expertise === 'Consultant' ? 'bg-purple-100 text-purple-800' : 
                        post.expertise === 'Expert' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {post.expertise}
                      </span>
                      
                      {post.ratePerMsg && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                          <DollarSign size={10} className="mr-0.5" />
                          {post.ratePerMsg} UGX/msg
                        </span>
                      )}
                      
                      {post.rating && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                          <Star size={10} className="mr-0.5" fill="currentColor" />
                          {post.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              
              {/* Post Content */}
              <div className="mt-2 mb-3">
                <p className="text-gray-900">{post.content}</p>
                {post.isPremium && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center text-gray-500">
                      <Lock size={16} className="mr-2" />
                      <p className="text-sm font-medium">Premium content - DM to unlock</p>
                    </div>
                  </div>
                )}
                {post.image && !post.isPremium && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Post image" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                {post.topics && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.topics.map((topic, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-800">
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Engagement Metrics */}
              <div className="flex items-center justify-between mt-2 text-gray-500 text-sm px-2">
                <div className="flex items-center space-x-1">
                  <Zap size={14} />
                  <span>{post.views}K</span>
                </div>
                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <span>{post.responseRate}%</span>
                  <span>response rate</span>
                </div>
                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <span>{post.avgResponseTime}</span>
                  <span>avg response</span>
                </div>
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <button 
                  className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
                  <span>{post.likeCount > 0 ? post.likeCount : ""}</span>
                </button>
                
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600">
                  <Star size={20} />
                  <span>Rate</span>
                </button>
                
                <button 
                  className={`flex items-center space-x-1 ${post.isBookmarked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                  onClick={() => handleBookmark(post.id)}
                >
                  <Bookmark size={20} fill={post.isBookmarked ? "currentColor" : "none"} />
                </button>
                
                <button 
                  className="flex items-center space-x-1 text-white bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm"
                  onClick={() => handleDirectMessage(post.userId, post.username, post.ratePerMsg)}
                >
                  <Mail size={16} className="mr-1" />
                  <span>{post.ratePerMsg ? `${post.ratePerMsg} UGX/msg` : 'DM'}</span>
                </button>
                
                <button className="text-gray-500 hover:text-gray-600">
                  <Share2 size={18} />
                </button>
              </div>
              
              {/* Trending Tag */}
              {post.trending && (
                <div className="mt-3 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full inline-flex items-center">
                  <Activity size={12} className="mr-1" />
                  {post.trending}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Sidebar - Redesigned for PayPadm platform */}
      <div className="hidden lg:block w-80 p-4">
        {/* Search */}
        <div className="bg-gray-100 rounded-full p-3 mb-4">
          <div className="flex items-center">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search experts & topics"
              className="bg-transparent border-none w-full focus:outline-none text-gray-700"
            />
          </div>
        </div>
        
        {/* Your Account Stats */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Your Account</h3>
            <button className="text-red-600 text-sm hover:text-red-700">View Stats</button>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Balance</span>
            <span className="text-xl font-bold text-gray-900">246,390 UGX</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>This month earnings</span>
            <span className="font-medium text-red-600">+157,500 UGX</span>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                <span>Messages received</span>
              </div>
              <span className="font-medium">37</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <ArrowUpRight size={16} className="mr-2" />
                <span>Response rate</span>
              </div>
              <span className="font-medium text-green-600">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Star size={16} className="mr-2" />
                <span>Average rating</span>
              </div>
              <span className="font-medium text-amber-600">4.8/5</span>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition shadow-sm">
            Withdraw Funds
          </button>
        </div>
        
        {/* Message Pricing */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Your Message Rate</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-700">Current rate</span>
              <span className="font-bold text-lg">5,000 UGX/msg</span>
            </div>
            <p className="text-xs text-gray-500">You receive 85% of this amount after platform fees</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjust your rate</label>
            <input 
              type="range" 
              min="1000" 
              max="20000" 
              value="5000" 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1,000 UGX</span>
              <span>20,000 UGX</span>
            </div>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg mb-4">
            <div className="flex items-center text-red-800 mb-1">
              <Zap size={16} className="mr-2" />
              <span className="font-medium">Rate Tip</span>
            </div>
            <p className="text-xs text-red-800">Experts with your experience and rating typically charge 3,000-7,000 UGX per message</p>
          </div>
          
          <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition shadow-sm">
            Update Rate
          </button>
        </div>
        
        {/* Top Earning Experts */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Top Earning Experts</h3>
          
          {topEarners.map((expert, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-red-100">
                  <img 
                    src={expert.avatar || "/api/placeholder/40/40"} 
                    alt={expert.username} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                    {expert.verified && (
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center ml-1">
                        <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="text-gray-500 mr-2">
                      {expert.rate},000 UGX/msg
                    </span>
                    <span className="flex items-center text-amber-600">
                      <Star size={12} className="mr-0.5" fill="currentColor" />
                      {expert.rating}
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-700 shadow-sm">
                DM
              </button>
            </div>
          ))}
          
          <a href="#" className="text-red-600 text-sm mt-2 inline-block hover:text-red-700">
            View all experts
          </a>
        </div>
      </div>
    </div>
  );
};

// Dummy data
const dummyPosts = [
  {
    id: 1,
    userId: 'user123',
    name: 'Emma Thompson',
    username: 'emmathompson',
    verified: true,
    expertise: 'Consultant',
    avatar: '/api/placeholder/40/40',
    time: '2h',
    content: 'Just started offering personal finance coaching sessions via PayPadm! If you\'re looking to build a strong financial foundation or need help with investment strategies in Uganda, I\'m here to help.',
    image: '/api/placeholder/600/400',
    views: 8.2,
    responseRate: 98,
    avgResponseTime: '< 30m',
    likeCount: 42,
    isLiked: false,
    isBookmarked: false,
    ratePerMsg: 5000,
    rating: 4.9,
    topics: ['personalfinance', 'investing', 'coaching', 'uganda'],
    trending: 'New consultant'
  },
  {
    id: 2,
    userId: 'user456',
    name: 'Marcus Chen',
    username: 'marcuschen',
    verified: true,
    expertise: 'Expert',
    avatar: '/api/placeholder/40/40',
    time: '3h',
    content: 'I\'ve been helping startup founders navigate funding rounds across East Africa for over 10 years. Got questions about your Series A? Looking for pitch deck feedback? My expertise is now available through direct messages.',
    isPremium: true,
    views: 15.7,
    responseRate: 95,
    avgResponseTime: '1-2h',
    likeCount: 128,
    isLiked: true,
    isBookmarked: false,
    ratePerMsg: 15000,
    rating: 5.0,
    topics: ['startups', 'venturecapital', 'funding', 'eastafrica'],
    trending: 'Top rated'
  },
  {
    id: 3,
    userId: 'user789',
    name: 'Sophia Rodriguez',
    username: 'sophiarod',
    verified: false,
    expertise: 'Advisor',
    avatar: '/api/placeholder/40/40',
    time: '5h',
    content: "I specialize in real estate investment strategies across Kampala and other urban centers. Currently accepting new clients! First message is free, then my standard rate applies.",
    image: '/api/placeholder/600/300',
    views: 6.3,
    responseRate: 92,
    avgResponseTime: '3h',
    likeCount: 54,
    isLiked: false,
    isBookmarked: true,
    ratePerMsg: 8000,
    rating: 4.7,
    topics: ['realestate', 'investment', 'property', 'kampala']
  },
  {
    id: 4,
    userId: 'user101',
    name: 'Dr. James Wilson',
    username: 'drjwilson',
    verified: true,
    expertise: 'Expert',
    avatar: '/api/placeholder/40/40',
    time: '1d',
    content: 'BREAKING: My research paper on mobile money applications in East Africa was just published! DM me for in-depth analysis and actionable insights on how these developments will affect traditional banking.',
    views: 22.8,
    responseRate: 85,
    avgResponseTime: '12h',
    likeCount: 217,
    isLiked: false,
    isBookmarked: false,
    ratePerMsg: 12000,
    rating: 4.8,
    topics: ['mobilemoney', 'research', 'banking', 'eastafrica'],
    trending: 'Hot topic'
  },
  {
    id: 5,
    userId: 'user202',
    name: 'Alexandra Lee',
    username: 'aleefinance',
    verified: true,
    expertise: 'Consultant',
    avatar: '/api/placeholder/40/40',
    time: '2d',
    content: 'After 15 years at Standard Bank, I\'m now offering personalized portfolio reviews and investment strategy sessions through PayPadm. Limited availability - book your consultation today!',
    isPremium: true,
    views: 31.2,
    responseRate: 99,
    avgResponseTime: '< 1h',
    likeCount: 340,
    isLiked: false,
    isBookmarked: false,
    ratePerMsg: 25000,
    rating: 4.9,
    topics: ['portfolioreview', 'wealthmanagement', 'investing', 'uganda'],
    trending: 'High demand'
  }
];

const topEarners = [
  {
    name: 'Michael Brooks',
    username: 'mbrooks',
    expertise: 'Tax Specialist',
    rate: 20,
    rating: 4.9,
    verified: true,
    avatar: '/api/placeholder/40/40'
  },
  {
    name: 'Jennifer Wang',
    username: 'jwangvc',
    expertise: 'VC Partner',
    rate: 35,
    rating: 5.0,
    verified: true,
    avatar: '/api/placeholder/40/40'
  },
  {
    name: 'David Kowalski',
    username: 'dkfinance',
    expertise: 'CFP',
    rate: 15,
    rating: 4.8,
    verified: false,
    avatar: '/api/placeholder/40/40'
  },
  {
    name: 'Priya Sharma',
    username: 'priyacrypto',
    expertise: 'Crypto Analyst',
    rate: 12,
    rating: 4.7,
    verified: true,
    avatar: '/api/placeholder/40/40'
  }
];

export default SocialFeed;