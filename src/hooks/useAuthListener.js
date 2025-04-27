import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useSetRecoilState } from 'recoil';
import { userAtom } from '../state/authAtom';

export function useAuthListener() {
  const setAuth = useSetRecoilState(userAtom);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({ user: session?.user ?? null, loading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth({ user: session?.user ?? null, loading: false });
    });

    return () => listener?.subscription.unsubscribe();
  }, [setAuth]);
}