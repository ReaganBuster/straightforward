import { useState, useEffect, useCallback } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';

// Other hooks
export const useUserStats = userId => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const statsData = await supabaseQueries.getUserStats(userId);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const refreshStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const statsData = await supabaseQueries.getUserStats(userId);
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refreshStats };
};

export const useTopExperts = (limit = 5) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const expertsData = await supabaseQueries.getTopEarningExperts(limit);
        setExperts(expertsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [limit]);

  return { experts, loading, error };
};

export const useTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await supabaseQueries.getTopics();
        setTopics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { topics, loading, error };
};

// Post ratings hook (completed)
export const usePostRatings = userId => {
  const [userRatings, setUserRatings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserRatings = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabaseQueries.supabase
        .from('ratings')
        .select('rated_id, score')
        .eq('rater_id', userId);

      if (fetchError) throw fetchError;

      const ratingsMap = {};
      data.forEach(rating => {
        ratingsMap[rating.rated_id] = rating.score;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserRatings();
  }, [fetchUserRatings]);

  const rateItem = async (ratedId, score, comment = null) => {
    try {
      setIsLoading(true);
      await supabaseQueries.rateUser(userId, ratedId, score, comment);
      await fetchUserRatings(); // Refresh ratings after rating
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRatings,
    isLoading,
    error,
    rateItem,
    refreshRatings: fetchUserRatings,
  };
};
