import { useState, useEffect } from 'react';
import * as supabaseAuthQueries from '@infrastructure/api/userApi';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { userAtom } from '@shared/state/authAtom';


// Auth hook
export const useAuth = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    // const setUser = useSetRecoilState(userAtom);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await supabaseAuthQueries.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      const result = await supabaseAuthQueries.signUpUser(
        email,
        password,
        fullName
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const {data, error} = await supabaseAuthQueries.signInUser(email, password);
       if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        navigate('/feed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabaseAuthQueries.signOutUser();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signUp, signIn, signOut };
};
