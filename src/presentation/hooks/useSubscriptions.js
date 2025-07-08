import { useState, useEffect } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';


// Subscriptions hook
export const useSubscriptions = userId => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const [userSubs, userSubscribers] = await Promise.all([
          supabaseQueries.getUserSubscriptions(userId),
          supabaseQueries.getUserSubscribers(userId),
        ]);

        setSubscriptions(userSubs);
        setSubscribers(userSubscribers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  const checkSubscription = async creatorId => {
    try {
      return await supabaseQueries.checkActiveSubscription(userId, creatorId);
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    subscriptions,
    subscribers,
    loading,
    error,
    checkSubscription,
    refresh: async () => {
      try {
        setLoading(true);
        const [userSubs, userSubscribers] = await Promise.all([
          supabaseQueries.getUserSubscriptions(userId),
          supabaseQueries.getUserSubscribers(userId),
        ]);

        setSubscriptions(userSubs);
        setSubscribers(userSubscribers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  };
};
