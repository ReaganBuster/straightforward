import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import LeftSidebar from '../components/feed/leftSideBar';
import BottomNav from '../components/layout/bottomNav';
import MobileNavBar from '../components/layout/Navbar';

const AuthenticatedLayout = ({ user }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handlers = useSwipeable({
    onSwipedRight: (eventData) => {
      if (eventData.initial[0] < 20) {
        setIsMobileSidebarOpen(true);
      }
    },
    onSwipedLeft: () => {
      setIsMobileSidebarOpen(false);
    },
    trackMouse: false,
    preventDefaultTouchmoveEvent: true
  });

  // Render Messages component outside main for mobile/tablet, inside for desktop
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
        <MobileNavBar user={user} toggleSidebar={toggleSidebar} />
        <main className="flex-1">
          {(!isMessagesPage || isDesktop) && <Outlet />}
        </main>
        {!isDesktop && <BottomNav />}
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