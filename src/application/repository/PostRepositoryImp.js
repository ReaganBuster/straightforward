import { SupabasePostsDataSource } from '../data-sources/SupabasePostsDataSource';
import PostRepository from '@domain/repository/PostRepository';
import Post from '@domain/entities/Post';

export default class PostRepositoryImp extends PostRepository {
    constructor() {
        super();
        this.supabase = new SupabasePostsDataSource();
    }

    async createPost(post) {
        const payload = post.toInsertPayload();
        const { data, error } = await this.supabase.createPost(
            payload.user_id,
            payload.caption,
            payload.thumbnail_url,
            payload.is_premium,
            payload.monetization_model, 
            payload.dm_fee,
            payload.requires_subscription,
            payload.media_type,
            payload.duration_days,
            payload.is_extended,
            payload.is_monetized,
            payload.is_downloadable,
            payload.is_permanent,
            payload.is_verified_post
        );
        if (error) throw error;
        return data;
    }

    async getAllPosts() {
        const data = await this.supabase.fetchAllPosts();
        // if (error) throw error;
        console.log('Fetched posts:', data);
        return data;
    }

    async fetchPostById(postId) {
        const { data, error } = await this.supabase.fetchPostById(postId);
        if (error) throw error;
        return new Post(data);
    }

    async getPostsByUserId(userId) {
        const { data, error } = await this.supabase.fetchPostsByUserId(userId);
        if (error) throw error;
        return data;
    }

    async updatePost(postId, updates) {
        const { data, error } = await this.supabase.updatePost(postId, updates);
        if (error) throw error;
        return data;
    }

    async deletePost(postId) {
        const { error } = await this.supabase.deletePost(postId);
        if (error) throw error;
    }

    async incrementPostViews(postId) {
        const { data, error } = await this.supabase.incrementPostViews(postId);
        if (error) throw error;
        return data;
    }

    async likePost(postId, userId) {
        const { data, error } = await this.supabase.togglePostLike(postId, userId);
        if (error) throw error;
        return data;
    }

    async bookmarkPost(postId, userId) {
        const { data, error } = await this.supabase.togglePostBookmark(postId, userId);
        if (error) throw error;
        return data;
    }

    async ratePost(postId, userId, rating) {
        const { data, error } = await this.supabase.ratePost(postId, userId, rating);
        if (error) throw error;
        return data;
    }
}