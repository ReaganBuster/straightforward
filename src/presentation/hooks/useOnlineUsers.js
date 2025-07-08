import { useState, useEffect, useMemo } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';


// Online users hook
export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  useEffect(() => {
    let channel = null;
    let isSubscribed = false;
    const leaveTimeouts = new Map();

    // Move updateOnlineUsers to the top level of the useEffect, not inside setupPresence
    const updateOnlineUsers = () => {
      if (!channel || !isSubscribed) return;
      const state = channel.presenceState();
      const online = new Map();
      Object.entries(state).forEach(([presenceKey, presences]) => {
        if (presences && Array.isArray(presences) && presences.length > 0) {
          const presenceData = presences[0];
          if (presenceData.user_id) {
            online.set(presenceData.user_id, {
              user_id: presenceData.user_id,
              name: presenceData.name,
              avatar_url: presenceData.avatar_url,
              online_at: presenceData.online_at,
              presence_key: presenceKey,
            });
          }
        }
      });
      setOnlineUsers(online);
      // console.log('Updated Online Users:', Array.from(online.entries()));
    };

    const setupPresence = async () => {
      try {
        const { data, error } = await supabaseQueries.supabase.auth.getUser();
        if (error || !data?.user) {
          console.error('Auth error:', error);
          return;
        }
        const user = data.user;

        channel = supabaseQueries.supabase.channel('presence:global');

        channel
          .on('presence', { event: 'sync' }, updateOnlineUsers)
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            newPresences.forEach(presence => {
              if (presence.user_id && leaveTimeouts.has(presence.user_id)) {
                clearTimeout(leaveTimeouts.get(presence.user_id));
                leaveTimeouts.delete(presence.user_id);
              }
            });
            updateOnlineUsers();
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            leftPresences.forEach(presence => {
              if (presence.user_id) {
                const timeout = setTimeout(() => {
                  updateOnlineUsers();
                  leaveTimeouts.delete(presence.user_id);
                }, 60000); // 1-minute grace period
                leaveTimeouts.set(presence.user_id, timeout);
              }
            });
          });

        const { data: subscription } = await channel.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            isSubscribed = true;
            await channel.track({
              user_id: user.id,
              name: user.user_metadata?.name || user.email || 'Anonymous',
              avatar_url: user.user_metadata?.avatar_url || null,
              online_at: new Date().toISOString(),
            });
            // Force immediate update after tracking
            updateOnlineUsers();
          } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
            // console.warn('Subscription Failed:', status);
          }
        });

        return () => {
          isSubscribed = false;
          subscription?.unsubscribe();
          channel?.untrack();
          leaveTimeouts.forEach(timeout => clearTimeout(timeout));
          leaveTimeouts.clear();
        };
      } catch (error) {
        console.error('Setup presence error:', error);
      }
    };

    setupPresence();

    return () => {
      if (channel) {
        channel.untrack();
        channel.unsubscribe();
      }
      leaveTimeouts.forEach(timeout => clearTimeout(timeout));
      leaveTimeouts.clear();
    };
  }, []);

  return onlineUsers;
};
