/* eslint-disable import/no-unresolved */
import { supabase } from '@infrastructure/config/supabase';

export class SupabaseAuthDataSource {
  async createAnonymousUser() {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      // console.error('Anonymous sign-in failed:', error.message);
      return null;
    }

    // Sanity check (optional)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      // console.warn('No session immediately after anonymous sign-in');
      return null;
    }

    return data.user; // <- this is the `user`
  }

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }

  async register(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null; // No session = no user
  
      const { user } = session;
  
      return user ?? null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async fetchProfile(userId) {
    try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .single();
    
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
      }
  }

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updateProfile(userId, updates) {
    try {
      // Build the payload, mapping camelCase keys (JS) to snake_case (DB)
      const payload = {
        ...(updates.name          && { name: updates.name }),
        ...(updates.bio           && { bio: updates.bio }),
        ...(updates.avatarUrl     && { avatar_url: updates.avatarUrl }),
        ...(updates.gender        && { gender: updates.gender }),
        ...(updates.sexualOrientation && { sexual_orientation: updates.sexualOrientation }),
        ...(updates.born          && { born: updates.born }),                 // Expecting YYYY‑MM‑DD
        ...(updates.location      && { location: updates.location }),
        ...(updates.address       && { address: updates.address }),
        ...(updates.contact       && { contact: updates.contact }),
        ...(updates.interests     && { interests: JSON.stringify(updates.interests) }),
        ...(updates.status        && { status: updates.status }),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating user profile:', err.message);
      throw err;
    }
  }
}