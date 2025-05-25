import {  useEffect } from 'react'; // Add useState and useEffect for route handling
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from './state/authAtom';

import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { useAuthListener } from './hooks/useAuthListener';
import TransactionsPage from './pages/Transactions';
import DirectMessages from './components/dm/directMessaging';
import Messages from './pages/messages';
import Analytics from './pages/Analytics';
import Notifications from './pages/notifications';
import HelpScreen from './pages/help';
import AuthenticatedLayout from './pages/authenticatedLayout';
import { useOnlineUsers, useIsUserOnline } from './hooks/hooks'; // Import the hooks

const MessagesWrapper = ({ user }) => {
  const { id: recipientId } = useParams(); // Extract recipientId from the route
  const isRecipientOnline = useIsUserOnline(recipientId); // Check if recipient is online

  return <Messages user={user} onlineStatus={isRecipientOnline} />;
};

const App = () => {
  useAuthListener();
  const { user, loading } = useRecoilValue(userAtom);
  const onlineUsers = useOnlineUsers(); // Track all online users

  // Log online users for debugging (optional)
  useEffect(() => {
    console.log('Online Users in App:', Array.from(onlineUsers.entries()));
  }, [onlineUsers]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/feed" /> : <Signup />} />
        <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to='/'/>} />
        <Route 
          path="/m/:id" 
          element={user ? <MessagesWrapper user={user} /> : <Navigate to="/"/>} 
        />
        <Route element={user ? <AuthenticatedLayout user={user} /> : <Navigate to="/" />}>
          <Route path="/feed" element={<Feed user={user} />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<Notifications user={user} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/help" element={<HelpScreen />} />
        </Route>
        <Route path="*" element={<div className="p-6">404: Not Found</div>} />
      </Routes> 
    </Router>
  );
};

export default App;