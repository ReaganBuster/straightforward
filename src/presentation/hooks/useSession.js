import { useEffect } from 'react';
import { supabase } from '@infrastructure/config/supabase';
import { useSetRecoilState } from 'recoil';
import { userAtom } from '@shared/state/authAtom';

export function useSession() {
  const setAuth = useSetRecoilState(userAtom);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({ user: session?.user ?? null, loading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuth({ user: session?.user ?? null, loading: false });
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, [setAuth]);
}
