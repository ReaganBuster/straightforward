import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, DollarSign, MessageSquare, User, Bell, BarChart2, 
  ChevronRight, HelpCircle, Settings, Filter, Calendar, Download,
  ArrowUpCircle, ArrowDownCircle, Repeat, CreditCard, Gift, Search,
  ChevronDown, TrendingUp, Info
} from 'lucide-react';

import { useAuth, useWallet } from '../../hooks/hooks';

const TransactionsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('last30');
  const mainContentRef = useRef(null);
  const leftSidebarRef = useRef(null);
  
  const { user } = useAuth();
  const { balance,transactions, loading, loadMore, hasMore, loading: walletLoading } = useWallet(user?.id);
//   const { transactions, loading, loadMore, hasMore } = useTransactions(user?.id, activeFilter, dateRange);

  // Enable independent scrolling for each section
  useEffect(() => {
    const handleScroll = (e) => {
      // Prevent scroll events from bubbling up to parent elements
      e.stopPropagation();
    };
  
    // Cache current ref values inside the effect
    const mainContent = mainContentRef.current;
    const leftSidebar = leftSidebarRef.current;
  
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    if (leftSidebar) {
      leftSidebar.addEventListener('scroll', handleScroll);
    }
  
    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
      if (leftSidebar) {
        leftSidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  
  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit':
        return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowDownCircle className="w-4 h-4 text-orange-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'referral':
        return <Gift className="w-4 h-4 text-pink-600" />;
      default:
        return <Repeat className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getTransactionColor = (type) => {
    switch(type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-orange-600';
      case 'payment':
        return 'text-blue-600';
      case 'message':
        return 'text-purple-600';
      case 'referral':
        return 'text-pink-600';
      default:
        return 'text-gray-700';
    }
  };
  
  const getAmountPrefix = (type) => {
    return ['deposit', 'message', 'referral'].includes(type) ? '+' : '-';
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
          <Link to="/transactions" className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg">
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
      </div>
      
      {/* Main Content - Independent Scrolling */}
      <div 
        ref={mainContentRef}
        className="flex-1 bg-white overflow-y-auto h-screen"
      >
        {/* Top Bar - Sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img src="/api/placeholder/32/32" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {/* Account Balance Summary */}
        <div className="p-4 border-b border-gray-200">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-medium text-gray-600">Current Balance</h2>
              <Link to="/wallet/withdraw" className="text-red-600 text-xs font-medium hover:text-red-700">
                Withdraw Funds
              </Link>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-3">
              {walletLoading ? '...' : `${balance ? balance.toLocaleString() : 0} UGX`}
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-600 mb-1">This Month</p>
                <p className="text-sm font-bold text-green-600">+157,500 UGX</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-600 mb-1">Messages</p>
                <p className="text-sm font-bold text-gray-900">37</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-600 mb-1">Avg. Rate</p>
                <p className="text-sm font-bold text-gray-900">5,000 UGX</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'messages' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                onClick={() => handleFilterChange('messages')}
              >
                Messages
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'withdrawals' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                onClick={() => handleFilterChange('withdrawals')}
              >
                Withdrawals
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'deposits' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                onClick={() => handleFilterChange('deposits')}
              >
                Deposits
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="flex items-center text-sm bg-white border border-gray-200 px-3 py-1 rounded-full">
                  <Calendar size={14} className="mr-1 text-gray-500" />
                  <span className="text-gray-700">
                    {dateRange === 'last7' ? 'Last 7 days' : 
                     dateRange === 'last30' ? 'Last 30 days' : 
                     dateRange === 'last90' ? 'Last 90 days' : 'All time'}
                  </span>
                  <ChevronDown size={14} className="ml-1 text-gray-500" />
                </button>
                {/* Date range dropdown would go here */}
              </div>
              
              <button className="bg-white border border-gray-200 p-1.5 rounded-full">
                <Download size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Transaction List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8">
              <div className="mb-3 inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                <DollarSign size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
              <p className="text-gray-500 text-sm">Try changing your filters or date range</p>
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{transaction.description}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{transaction.type}</span>
                        {transaction.status === 'pending' && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-orange-600">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getTransactionColor(transaction.type)}`}>
                      {getAmountPrefix(transaction.type)}{transaction.amount.toLocaleString()} UGX
                    </div>
                    {transaction.recipient && (
                      <div className="text-xs text-gray-500">
                        to: {transaction.recipient}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {!loading && transactions.length > 0 && hasMore && (
            <div className="p-4 flex justify-center">
              <button 
                className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                onClick={loadMore}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;