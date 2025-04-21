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

const App = () => {
  const user = useRecoilValue(userAtom);

  return (
    <Router>
      {/* {user && <Navbar />} */}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/feed" /> : <Signup />} />
        <Route path="/feed" element={user ? <Feed /> : <Navigate to="/" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
        <Route path="*" element={<div className="p-6">404: Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
