 import UserRepository from '../repository/UserRepository';
import { SupabaseUserDataSource } from '../data-sources/SupabaseUserDataSource';

 export default class UserRepositoryImp extends UserRepository {
    constructor() {
        super();
        this.supabase = new SupabaseUserDataSource();
    }

    async createUser(userData) {
        const { data, error } = await this.supabase.createUser(userData);
        if (error) throw error;
        return new User(data);
    }

    async getUserById(userId) {
        const { data, error } = await this.supabase.getUserById(userId);
        if (error) throw error;
        return new User(data);
    }

    async getUserByEmail(email) {
        const { data, error } = await this.supabase.getUserByEmail(email);
        if (error) throw error;
        return new User(data);
    }

    async updateUser(userId, updateData) {
        const { data, error } = await this.supabase.updateUser(userId, updateData);
        if (error) throw error;
        return new User(data);
    }

    async deleteUser(userId) {
        const { data, error } = await this.supabase.deleteUser(userId);
        if (error) throw error;
        return data;
    }

    async listUsers(filter = {}, options = {}) {
        const { data, error } = await this.supabase.listUsers(filter, options);
        if (error) throw error;
        return data.map(userData => new User(userData));
    }

    async logOut() {
        const { error } = await this.supabase.logout();
        if (error) throw error;
    }
 }