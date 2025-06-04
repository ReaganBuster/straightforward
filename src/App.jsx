import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Messages from './pages/messages';
import Analytics from './pages/Analytics';
import Notifications from './pages/notifications';
import HelpScreen from './pages/help';
import AuthenticatedLayout from './pages/authenticatedLayout';
import { useOnlineUsers, useProfile } from './hooks/hooks'; // Import the hook

const App = () => {
  useAuthListener();
  const { user, loading } = useRecoilValue(userAtom);
  const { profile } = useProfile(user?.id);
  const onlineUsers = useOnlineUsers(); // Initialize online users Map

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/feed" /> : <Signup />} />
        <Route path="/settings" element={user ? <Settings user={profile} /> : <Navigate to='/'/>} />
        <Route path="/m/:id" element={user ? <Messages user={profile} onlineUsers={onlineUsers} /> : <Navigate to="/"/>} />
        <Route element={user ? <AuthenticatedLayout user={profile} /> : <Navigate to="/" />}>
          <Route path="/feed" element={<Feed user={profile} />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<Notifications user={profile} />} />
          <Route path="/analytics" element={<Analytics user={profile} />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/profile" element={<Profile user={profile} />} />
          <Route path="/help" element={<HelpScreen />} />
        </Route>
        <Route path="*" element={<div className="p-6">404: Not Found</div>} />
      </Routes> 
    </Router>
  );
};

export default App;