import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { userAtom } from '../../state/authAtom';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        navigate('/feed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.log("An unexpected error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4 sm:p-6 space-y-6 bg-white rounded-lg shadow-lg sm:rounded-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-red-600 text-white text-xl sm:text-2xl font-bold p-2 sm:p-3 rounded-lg">
              Kontent Market
            </div>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {error && (
          <div className="p-2 sm:p-3 text-xs sm:text-sm text-white bg-red-500 rounded-md" role="alert">
            {error}
          </div>
        )}

        <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 sm:py-3 mt-1 text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full px-3 py-2 sm:py-3 mt-1 text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Password"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-xs sm:text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-xs sm:text-sm">
              <a href="#" className="font-medium text-red-600 hover:text-red-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-red-600 border border-transparent rounded-md group hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-2 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-red-600 hover:text-red-500">
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;