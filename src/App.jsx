import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from './state/authAtom';

import Navbar from './components/layout/Navbar';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup  from './pages/auth/Signup';
import { useAuthListener } from './hooks/useAuthListener';
import TransactionsPage from './pages/Transactions';
import DirectMessages from './components/dm/directMessaging';
import Messages from './pages/messages';

const App = () => {
  useAuthListener();
  const { user, loading } = useRecoilValue(userAtom);

  if (loading) {
    
    return <div>Loading...</div>;
  }


  return (
    <Router>
      {/* {user && <Navbar />} */}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/feed" /> : <Signup />} />
        <Route path="/feed" element={user ? <Feed user={user}/> : <Navigate to="/" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
        <Route path="/m/:id" element={user ? <Messages user={user}/> : <Navigate to="/" />} />
        <Route path="/transactions" element={user ? <TransactionsPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? <Settings user={user}/> : <Navigate to="/" />} />
        <Route path="*" element={<div className="p-6">404: Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
