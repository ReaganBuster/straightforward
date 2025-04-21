import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userAtom } from '../../state/authAtom';
import { supabase } from '../../services/supabase';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`px-3 py-1 rounded-md font-medium ${
        isActive(path) ? 'text-white bg-purple-600' : 'text-gray-600 hover:text-purple-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white shadow-md border-b border-gray-100">
      <Link to="/feed" className="text-purple-600 text-2xl font-bold tracking-tight">
        PayPaDm
      </Link>
      <div className="flex items-center space-x-4">
        {navItem('/feed', 'Feed')}
        {navItem('/chat', 'DMs')}
        {navItem('/profile', 'Profile')}
        {navItem('/settings', 'Settings')}
        {user && (
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md font-medium"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
