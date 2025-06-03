import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { useProfile } from '../../hooks/hooks';
import Favicon from '../../assets/favicon.svg';

const MobileNavBar = ({ user, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { profile } = useProfile(user.id);

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const moreActions = [
    { label: 'Settings', path: '/settings' },
    { label: 'Logout', path: '/logout' }
  ];

  return (
    <nav 
      className="relative h-[60px] bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 md:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div 
        className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden cursor-pointer order-1"
        onClick={() => navigate('/profile')}
      >
        <img 
          src={profile?.avatar_url || 'https://via.placeholder.com/32'} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="order-2 mx-auto">
        <img 
          src={Favicon} 
          alt="App Icon" 
          className="w-10 h-10 cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>
      <div className="relative order-3">
        <button 
          onClick={handleMoreClick}
          className="text-gray-600 hover:text-gray-800"
        >
          <MoreVertical size={24} />
        </button>
        {showMoreMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {moreActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(action.path);
                  setShowMoreMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default MobileNavBar;