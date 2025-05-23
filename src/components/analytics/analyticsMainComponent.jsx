import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, LineChart, Activity, User, Home, Search, Mail, 
  DollarSign, TrendingUp, MessageSquare, Users, HelpCircle, 
  ChevronRight, Bell, BarChart2, Gift, Settings, Calendar,
  CreditCard, Share2, Clock, Eye, Zap, CheckCircle, DownloadCloud
} from 'lucide-react';

import { useUserStats, useWallet, useProfile } from '../../hooks/hooks';

const Analytics = ({user}) => {
  const [activeTab, setActiveTab] = useState('earnings');
  const [timeFrame, setTimeFrame] = useState('month');
  const mainContentRef = useRef(null);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  
//   const { user } = useAuth();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  const { balance, transactions, loading: walletLoading } = useWallet(user?.id);
  const { profile, loading: profileLoading } = useProfile(user?.id);

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

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous) return 100;
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  // Mock data for charts and stats
  const earningsData = {
    day: [3000, 2500, 4200, 3800, 5000, 4700, 3900],
    week: [15000, 18000, 22000, 19000],
    month: [58000, 75000, 67000, 92000, 108000, 125000]
  };
  
  const messagesData = {
    day: [8, 12, 15, 9, 14, 11, 18],
    week: [65, 78, 92, 103],
    month: [280, 320, 295, 410, 370, 425]
  };
  
  const viewsData = {
    day: [120, 145, 132, 160, 175, 190, 168],
    week: [950, 1100, 1250, 1400],
    month: [3800, 4200, 5100, 5400, 6200, 7500]
  };

  // Mock transaction history for current month
  const recentTransactions = transactions.slice(0, 5) || [
    { transaction_id: '1', amount: 5000, transaction_type: 'message_payment', created_at: '2024-04-25T14:30:00Z', from_user_id: 'user123', description: 'Message payment' },
    { transaction_id: '2', amount: 15000, transaction_type: 'content_unlock', created_at: '2024-04-23T09:15:00Z', from_user_id: 'user456', description: 'Premium content access' },
    { transaction_id: '3', amount: 10000, transaction_type: 'subscription', created_at: '2024-04-20T16:45:00Z', from_user_id: 'user789', description: 'Monthly subscription' },
    { transaction_id: '4', amount: -25000, transaction_type: 'withdrawal', created_at: '2024-04-18T11:20:00Z', description: 'Withdrawal to Mobile Money' },
    { transaction_id: '5', amount: 7500, transaction_type: 'message_payment', created_at: '2024-04-15T13:10:00Z', from_user_id: 'user234', description: 'Message payment' }
  ];

  // Helper to render transaction icon based on type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'message_payment':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'content_unlock':
        return <Lock size={16} className="text-purple-500" />;
      case 'subscription':
        return <Users size={16} className="text-green-500" />;
      case 'withdrawal':
        return <DownloadCloud size={16} className="text-red-500" />;
      case 'deposit':
        return <CreditCard size={16} className="text-green-500" />;
      default:
        return <DollarSign size={16} className="text-gray-500" />;
    }
  };

  // Generate time labels based on timeframe
  const generateTimeLabels = () => {
    switch (timeFrame) {
      case 'day':
        return ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
      case 'week':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'month':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      default:
        return [];
    }
  };

  // Simple bar chart component
  const BarChart = ({ data, height = 120, barColor = "bg-red-500" }) => {
    const max = Math.max(...data);
    const timeLabels = generateTimeLabels();
    
    return (
      <div className="mt-2" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full">
          {data.map((value, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              <div 
                className={`${barColor} rounded-t w-6`} 
                style={{ height: `${(value / max) * (height - 20)}px` }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">{timeLabels[index]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      
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
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'earnings' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('earnings')}
              >
                Earnings
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'messages' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'content' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button 
                className={`px-3 py-2 font-medium text-sm rounded-full ${activeTab === 'growth' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('growth')}
              >
                <TrendingUp size={16} />
              </button>
            </div>
            
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img src="/api/placeholder/32/32" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {/* Analytics Time Frame Controls */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">
              {activeTab === 'earnings' && 'Earnings Analytics'}
              {activeTab === 'messages' && 'Messages Analytics'}
              {activeTab === 'content' && 'Content Performance'}
              {activeTab === 'growth' && 'Account Growth'}
            </h1>
            
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-full ${timeFrame === 'day' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTimeFrame('day')}
              >
                Day
              </button>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-full ${timeFrame === 'week' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTimeFrame('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-full ${timeFrame === 'month' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTimeFrame('month')}
              >
                Month
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content based on active tab */}
        <div className="p-3">
          {/* Loading State */}
          {statsLoading && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}
          
          {/* Earnings Tab */}
          {!statsLoading && activeTab === 'earnings' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Total Earnings</span>
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {formatNumber(stats?.total_earnings || 0)} UGX
                      </h3>
                      <span className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{calculateGrowth(stats?.total_earnings || 0, (stats?.total_earnings || 100) * 0.8)}% from last month
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">This Month</span>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {formatNumber(stats?.current_month_earnings || 0)} UGX
                      </h3>
                      <span className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{calculateGrowth(stats?.current_month_earnings || 0, (stats?.current_month_earnings || 100) * 0.7)}% from last month
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Messages Revenue</span>
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {formatNumber((stats?.current_month_earnings || 0) * 0.65)} UGX
                      </h3>
                      <span className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{calculateGrowth((stats?.current_month_earnings || 0) * 0.65, (stats?.current_month_earnings || 100) * 0.4)}% from last month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Earnings Chart */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Earnings Trend</h3>
                </div>
                <BarChart data={earningsData[timeFrame]} height={180} barColor="bg-red-500" />
              </div>
              
              {/* Recent Transactions */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                  <Link to="/transactions" className="text-red-600 text-xs hover:text-red-700">View All</Link>
                </div>
                
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.transaction_id} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-white p-1 rounded-lg mr-3">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()} • {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatNumber(transaction.amount)} UGX
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Revenue Breakdown */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Revenue Breakdown</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">Message Payments</span>
                      <span className="text-gray-900 font-medium">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">Premium Content</span>
                      <span className="text-gray-900 font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">Subscriptions</span>
                      <span className="text-gray-900 font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Messages Tab */}
          {!statsLoading && activeTab === 'messages' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Messages Received</span>
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatNumber(stats?.messages_received || 0)}
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +{calculateGrowth(stats?.messages_received || 0, (stats?.messages_received || 100) * 0.85)}% from last month
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Response Rate</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {stats?.response_rate || 96}%
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +2.5% from last month
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Avg. Response Time</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {stats?.avg_response_time || '26 min'}
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      10% faster than last month
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Messages Chart */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Messages Trend</h3>
                </div>
                <BarChart data={messagesData[timeFrame]} height={180} barColor="bg-blue-500" />
              </div>
              
              {/* Message Insights */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Message Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Topics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Financial Advice</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Business Strategy</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Investment Tips</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Other</span>
                        <span className="font-medium">12%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Client Satisfaction</h4>
                    <div className="flex items-center mb-2">
                      <div className="text-amber-500 text-lg font-bold mr-1">{stats?.rating || "4.8"}</div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${star <= Math.round(stats?.rating || 4.8) ? 'text-amber-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1..3l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38 1.81.588 1.81h3.461a1 1 0 00.951-.69l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">5★</span>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <span className="ml-2">80%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">4★</span>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="ml-2">15%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">3★</span>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                        <span className="ml-2">5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message Tips */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Improvement Tips</h3>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">Responding faster could increase your client satisfaction by up to 15%.</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-800">Try to maintain detailed answers to financial questions - they get the best ratings!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Content Tab */}
          {!statsLoading && activeTab === 'content' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Profile Views</span>
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatNumber(stats?.profile_views || 4582)}
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +{calculateGrowth(stats?.profile_views || 4582, (stats?.profile_views || 4582) * 0.75)}% from last month
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Content Engagement</span>
                    <Share2 className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {stats?.engagement_rate || "7.8"}%
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +1.2% from last month
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Premium Subscribers</span>
                    <Users className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatNumber(stats?.premium_subscribers || 124)}
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +{calculateGrowth(stats?.premium_subscribers || 124, (stats?.premium_subscribers || 124) * 0.8)}% from last month
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Views Chart */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Profile Views Trend</h3>
                </div>
                <BarChart data={viewsData[timeFrame]} height={180} barColor="bg-purple-500" />
              </div>
              
              {/* Popular Content */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Top Performing Content</h3>
                
                <div className="space-y-3">
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <LineChart className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Investment Strategies for 2024</p>
                        <p className="text-xs text-gray-500">Premium Article • Published 2 weeks ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">2,145 views</p>
                      <p className="text-xs text-green-600">42 unlocks</p>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Market Analysis: Q1 Report</p>
                        <p className="text-xs text-gray-500">Premium Article • Published 1 month ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">1,876 views</p>
                      <p className="text-xs text-green-600">38 unlocks</p>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Cryptocurrency Trends</p>
                        <p className="text-xs text-gray-500">Free Article • Published 3 weeks ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">1,543 views</p>
                      <p className="text-xs text-amber-600">High engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Growth Tab */}
          {!statsLoading && activeTab === 'growth' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Account Growth</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">+{stats?.account_growth || 38}%</h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +12% from last month
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">New Contacts</span>
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatNumber(stats?.new_contacts || 156)}
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +{calculateGrowth(stats?.new_contacts || 156, (stats?.new_contacts || 156) * 0.7)}% from last month
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-sm">Conversion Rate</span>
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {stats?.conversion_rate || 16.5}%
                    </h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +2.3% from last month
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Growth Insights */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Growth Insights</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Traffic Sources</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">Search</span>
                          <span className="text-gray-900 font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">Direct</span>
                          <span className="text-gray-900 font-medium">30%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">Referral</span>
                          <span className="text-gray-900 font-medium">25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Growth Opportunities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-800">Content Strategy</p>
                        <p className="text-xs text-green-700">Publishing regular financial insights could increase your engagement by 35%.</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-800">Response Time</p>
                        <p className="text-xs text-blue-700">Improving your response time could boost your conversion rate by 20%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Milestones */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Milestones</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">100+ Premium Subscribers</p>
                      <p className="text-xs text-gray-500">Achieved on April 12, 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">1M+ UGX Monthly Earnings</p>
                      <p className="text-xs text-gray-500">Achieved on March 28, 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center opacity-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">250+ Premium Subscribers</p>
                      <p className="text-xs text-gray-500">In progress (50% complete)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar - Independent Scrolling */}
      <div 
        ref={rightSidebarRef}
        className="hidden lg:block w-64 bg-white border-l border-gray-200 p-3 overflow-y-auto h-screen sticky top-0"
      >
        {/* User Profile Summary */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{profileLoading ? '...' : profile?.name || 'John Kamara'}</h3>
              <p className="text-xs text-gray-500">Financial Advisor</p>
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Balance</span>
              <span className="font-bold text-green-600">
                {walletLoading ? '...' : `${formatNumber(balance || 0)} UGX`}
              </span>
            </div>
            <button className="w-full bg-green-600 text-white text-xs py-1 px-2 rounded-lg font-medium hover:bg-green-700">
              Withdraw Funds
            </button>
          </div>
        </div>
        
        {/* Goals */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Monthly Goals</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700">Earnings Target (3M UGX)</span>
                <span className="text-gray-900 font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700">New Subscribers (50)</span>
                <span className="text-gray-900 font-medium">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700">Content Published (8)</span>
                <span className="text-gray-900 font-medium">38%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Payments */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Payments</h3>
          
          <div className="space-y-2">
            <div className="p-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-1 rounded-md mr-2">
                    <DollarSign size={12} className="text-red-600" />
                  </div>
                  <span className="text-xs font-medium">Monthly Payout</span>
                </div>
                <span className="text-xs font-bold text-green-600">2.5M UGX</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">Due in 3 days</div>
            </div>
            
            <div className="p-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-1 rounded-md mr-2">
                    <DollarSign size={12} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium">Bonus Payment</span>
                </div>
                <span className="text-xs font-bold text-green-600">500K UGX</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">Due in 7 days</div>
            </div>
          </div>
        </div>
        
        {/* Tips & Recommendations */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Analytics Insights</h3>
          
          <div className="space-y-2">
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center text-amber-800 text-xs font-medium mb-1">
                <Zap size={12} className="mr-1" />
                Peak Time Analysis
              </div>
              <p className="text-xs text-amber-700">Your profile gets most views between 7PM-9PM. Consider posting content during this time.</p>
            </div>
            
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center text-blue-800 text-xs font-medium mb-1">
                <TrendingUp size={12} className="mr-1" />
                Growth Opportunity
              </div>
              <p className="text-xs text-blue-700">Users who reply to messages within 15 minutes see 40% higher conversion rates.</p>
            </div>
          </div>
        </div>
        
        {/* Support & Help */}
        <div className="mt-auto p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center text-gray-700 mb-1">
            <HelpCircle className="w-4 h-4 mr-1" />
            <h3 className="text-xs font-semibold">Need Help?</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">Contact our support team for any questions about your analytics.</p>
          <button className="w-full bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded-lg font-medium hover:bg-gray-300">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;