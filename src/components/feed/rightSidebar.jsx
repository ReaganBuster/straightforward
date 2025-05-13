import { useTopExperts, useWallet} from '../../hooks/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
 Search, Mail, Zap, Star, 
} from 'lucide-react';


const RightSidebar = ({rightSidebarRef, user}) => {
    const { experts, loading: expertsLoading } = useTopExperts(4);
    const { balance, loading: walletLoading } = useWallet(user?.id);
    const navigate = useNavigate();
    // Safely format currency values
  const formatCurrency = (value) => {
    // Ensure value is defined and is a number
    if (value === undefined || value === null) return '0';
    return (Number(value) || 0).toLocaleString();
  };

  const handleDirectMessage = (userId, username, rate) => {
      navigate(`/messages/${userId}`, { 
        state: { recipientId: userId, recipientName: username, rate }
      });
    };

  return (
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
              {walletLoading ? '...' : `${formatCurrency(balance)} UGX`}
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
                        {formatCurrency(expert.rate_per_message)} UGX
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
  );
}
export default RightSidebar;