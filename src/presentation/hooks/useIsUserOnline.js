import { useMemo } from 'react';
import { useOnlineUsers } from './useOnlineUsers';

// Optimized hook to check user online status
export const useIsUserOnline = userId => {
  const onlineUsers = useOnlineUsers();

  // Memoize the online status to avoid unnecessary re-renders
  const isOnline = useMemo(() => {
    return userId ? onlineUsers.has(userId) : false;
  }, [onlineUsers, userId]);

  return isOnline;
};