import { SupabaseNotificationDataSource } from '../data-sources/SupabaseNotificationDataSource';
import Notification from '@domain/entities/Notification';

export default class NotificationRepositoryImp {
    constructor() {
        super();
        this.supabase = new SupabaseNotificationDataSource();
    }

    async createNotification(notification) {
        const payload = notification.toDb();
        
        const { data, error } = await this.supabase.createNotification(payload);
        
        if (error) throw error;
        return new Notification(data);
    }

    async fetchNotificationsByUserId(userId) {
        const { data, error } = await this.supabase.fetchNotificationsByUserId(userId);
        
        if (error) throw error;
        return data.map(row => new Notification(row));
    }

    async markAsRead(notificationId) {
        const { data, error } = await this.supabase.markNotificationAsRead(notificationId);
        
        if (error) throw error;
        return new Notification(data);
    }

    async markAsUnread(notificationId) {
        const { data, error } = await this.supabase.markNotificationAsUnread(notificationId);
        
        if (error) throw error;
        return new Notification(data);
    }
}
