import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import LeftSidebar from '../components/feed/leftSideBar';
import BottomNav from '../components/layout/bottomNav';
import Messages from '../pages/messages';

const AuthenticatedLayout = ({ user }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handlers = useSwipeable({
    onSwipedRight: (eventData) => {
      if (eventData.initial[0] < 20) setIsMobileSidebarOpen(true);
    },
    onSwipedLeft: () => setIsMobileSidebarOpen(false),
    trackMouse: false,
    preventDefaultTouchmoveEvent: true
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBottomNav(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isMessagesPage = location.pathname.includes('/messages');
  const isDesktop = window.innerWidth > 1024;

  return (
    <div className="flex min-h-screen bg-gray-50" {...handlers}>
      <LeftSidebar 
        user={user} 
        isMobileOpen={isMobileSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          {(!isMessagesPage || isDesktop) && <Outlet />}
        </main>
        {!isDesktop && showBottomNav && (
          <div className="transition-opacity duration-300">
            <BottomNav />
          </div>
        )}
      </div>
      {isMessagesPage && !isDesktop && (
        <div className="fixed inset-0 bg-gray-100 z-20">
          <Messages userId={user.id} initiatorId={user.id} />
        </div>
      )}
      {isMessagesPage && isDesktop && (
        <Messages userId={user.id} initiatorId={user.id} />
      )}
    </div>
  );
};

export default AuthenticatedLayout;