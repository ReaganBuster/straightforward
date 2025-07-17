import { supabase } from '@infrastructure/config/supabase';


export class SupabaseNotificationDataSource {
  // Create a new notification
    async createNotification(payload) {
        const { data, error } = await supabase
        .from('notifications')
        .insert([payload])
        .select()
        .single();

        return { data, error };
    }

    // Fetch all notifications for a user, newest first
    async fetchNotificationsByUserId(userId) {
        const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

        return { data, error };
    }

    // Mark a notification as read
    async markNotificationAsRead(notificationId) {
        const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('notification_id', notificationId)
        .select()
        .single();

        return { data, error };
    }

    // Mark a notification as unread
    async markNotificationAsUnread(notificationId) {
        const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: false })
        .eq('notification_id', notificationId)
        .select()
        .single();

        return { data, error };
    }

    // Bulk mark notifications as read
    async markAllAsRead(userId) {
        const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

        return { data, error };
    }

    // Delete a notification (optional)
    async deleteNotification(notificationId) {
        const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('notification_id', notificationId);

        return { data, error };
    }
}