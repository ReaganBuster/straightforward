import { useState, useEffect, } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';


// Conversations hooks
export const useConversations = userId => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const conversationsData =
          await supabaseQueries.getUserConversations(userId);
        setConversations(conversationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  const refreshConversations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const conversationsData =
        await supabaseQueries.getUserConversations(userId);
      setConversations(conversationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { conversations, loading, error, refreshConversations };
};