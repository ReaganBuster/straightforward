import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Bell, DollarSign, User } from 'lucide-react';

const BottomNav = ({ unreadMessages = 3, unreadNotifications = 5 }) => {
  const navItems = [
    {
      to: '/',
      icon: <Home size={24} />,
      label: 'Home',
      badge: null
    },
    {
      to: '/chat',
      icon: <MessageSquare size={24} />,
      label: 'Messages',
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      to: '/notifications',
      icon: <Bell size={24} />,
      label: 'Notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    {
      to: '/transactions',
      icon: <DollarSign size={24} />,
      label: 'Transactions',
      badge: null
    },
    // {
    //   to: '/profile',
    //   icon: <User size={24} />,
    //   label: 'Profile',
    //   badge: null
    // }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 flex md:hidden z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <div className="flex w-full justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-transform duration-200 hover:scale-105 ${
                isActive ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg mx-1' : 'text-gray-600'
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
      </div>
    </nav>
  );
};

export default BottomNav;