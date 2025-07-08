import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '@shared/state/authAtom';

import Feed from '@presentation/pages/Feed';
import Chat from '@presentation/pages/Chat';
import Profile from '@presentation/pages/Profile';
import Settings from '@presentation/pages/Settings';
import Login from '@presentation/pages/Login';
import Signup from '@presentation/pages/SignUp';
import { useSession } from '@presentation/hooks/useSession';
import TransactionsPage from '@presentation/pages/Transactions';
import Messages from '@presentation/pages/Messages';
import Analytics from '@presentation/pages/Analytics';
import Notifications from '@presentation/pages/Notifications';
import HelpScreen from '@presentation/pages/Help';
import AuthenticatedLayout from './AuthenticatedLayout';
import { useOnlineUsers } from '@presentation/hooks/useOnlineUsers';
import { useProfile } from '@presentation/hooks/useProfile';

const App = () => {
  useSession();
  const { user, loading } = useRecoilValue(userAtom);
  const { profile } = useProfile(user?.id);
  const onlineUsers = useOnlineUsers();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={user ? <Navigate to="/feed" /> : <Login />}
        />

        {/* Public route */}
        <Route
          path="/signup"
          element={user ? <Navigate to="/feed" /> : <Signup />}
        />

        {/* Protected routes */}
        {user ? (
          <>
            <Route element={<AuthenticatedLayout user={profile} />}>
              <Route path="/feed" element={<Feed user={profile} />} />
              <Route path="/chat" element={<Chat user={profile} />} />
              <Route path="/notifications" element={<Notifications user={profile} />} />
              <Route path="/analytics" element={<Analytics user={profile} />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/profile" element={<Profile user={profile} />} />
              <Route path="/help" element={<HelpScreen />} />
            </Route>

            <Route path="/settings" element={<Settings user={profile} />} />
            <Route
              path="/m/:id"
              element={<Messages user={profile} onlineUsers={onlineUsers} />}
            />
          </>
        ) : (
          <>
            <Route path="/feed" element={<Navigate to="/" />} />
            <Route path="/chat" element={<Navigate to="/" />} />
            <Route path="/notifications" element={<Navigate to="/" />} />
            <Route path="/analytics" element={<Navigate to="/" />} />
            <Route path="/transactions" element={<Navigate to="/" />} />
            <Route path="/profile" element={<Navigate to="/" />} />
            <Route path="/help" element={<Navigate to="/" />} />
            <Route path="/settings" element={<Navigate to="/" />} />
            <Route path="/m/:id" element={<Navigate to="/" />} />
          </>
        )}

        {/* Catch-all */}
        <Route path="*" element={<div className="p-6">404: Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
