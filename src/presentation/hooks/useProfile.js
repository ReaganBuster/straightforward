import { useState, useEffect } from 'react';
import * as supabaseAuthQueries from '@infrastructure/api/userApi';

export const useProfile = userId => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const profileData = await supabaseAuthQueries.getUserProfile(userId);
        setProfile(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async profileData => {
    try {
      setLoading(true);
      const updatedProfile = await supabaseQueries.updateUserProfile(
        userId,
        profileData
      );
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
};