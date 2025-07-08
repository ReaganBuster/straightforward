import { useState, useEffect, useCallback, } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';
import * as supabaseAuthQueries from '@infrastructure/api/userApi';
import { useProfile } from './useProfile';


// Wallet hook
export const useWallet = userId => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {profile} = useProfile(userId);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const profileData = profile || await supabaseAuthQueries.getUserProfile(userId);
        if (profileData) {
          setBalance(profileData.balance);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const fetchTransactions = useCallback(
    async (pageNum = 1) => {
      if (!userId) return;

      try {
        setTransactionsLoading(true);
        const pageSize = 20;
        const transactionsData = await supabaseQueries.getUserTransactions(
          userId,
          pageNum,
          pageSize
        );

        if (pageNum === 1) {
          setTransactions(transactionsData);
        } else {
          setTransactions(prev => [...prev, ...transactionsData]);
        }

        setHasMore(transactionsData.length === pageSize);
      } catch (err) {
        setError(err.message);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [userId, fetchTransactions]);

  const loadMoreTransactions = () => {
    if (transactionsLoading || !hasMore) return;
    setPage(prev => prev + 1);
    fetchTransactions(page + 1);
  };

  const addFunds = async (amount, description = 'Deposit') => {
    try {
      const success = await supabaseQueries.addUserFunds(
        userId,
        amount,
        description
      );

      if (success) {
        setBalance(prev => prev + amount);
        fetchTransactions(1);
      }

      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const withdrawFunds = async (amount, description = 'Withdrawal') => {
    try {
      const success = await supabaseQueries.withdrawUserFunds(
        userId,
        amount,
        description
      );

      if (success) {
        setBalance(prev => prev - amount);
        fetchTransactions(1);
      }

      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const payForContent = async (postId, amount, creatorId) => {
    try {
      const success = await supabaseQueries.payForContent(
        userId,
        postId,
        amount,
        creatorId
      );

      if (success) {
        setBalance(prev => prev - amount);
        fetchTransactions(1);
      }

      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const payForSubscription = async (
    creatorId,
    amount,
    duration = 30,
    tierId = null
  ) => {
    try {
      const success = await supabaseQueries.createSubscription(
        userId,
        creatorId,
        amount,
        duration,
        tierId
      );

      if (success) {
        setBalance(prev => prev - amount);
        fetchTransactions(1);
      }

      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    balance,
    transactions,
    loading,
    transactionsLoading,
    error,
    hasMore,
    loadMoreTransactions,
    addFunds,
    withdrawFunds,
    payForContent,
    payForSubscription,
    refreshBalance: async () => {
      try {
        const profileData = await supabaseAuthQueries.getUserProfile(userId);
        if (profileData) {
          setBalance(profileData.balance);
        }
        return profileData;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    refreshTransactions: () => fetchTransactions(1),
  };
};