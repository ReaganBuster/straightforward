import { useState } from 'react';
import * as supabaseQueries from '@infrastructure/config/supabase';


// Create post hook
export const useCreatePost = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const create = async (
    userId,
    content,
    imageUrl,
    isPremium,
    topics = [],
    monetizationModel = null,
    dmFee = null,
    requiresSubscription = false,
    contentType,
    articleTitle,
    articlePreview,
    articleContent,
    articlePages,
    articleFormat,
    articleFileUrl,
    audioTitle,
    audioTracks,
    videoTitle,
    videoThumbnailUrl,
    videoUrl,
    videoDuration,
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    productTitle,
    productPrice,
    productImageUrl,
    productVariants,
    productStockStatus,
    galleryTitle,
    galleryTotalImages,
    galleryImages,
    monetizationRequired
  ) => {
    try {
      setCreating(true);
      setError(null);
      const postId = await supabaseQueries.createPost(
        userId,
        content,
        imageUrl,
        isPremium,
        topics,
        monetizationModel,
        dmFee,
        requiresSubscription,
        contentType,
        articleTitle,
        // articlePreview,
        articleContent,
        articlePages,
        articleFormat,
        articleFileUrl,
        audioTitle,
        audioTracks,
        videoTitle,
        videoThumbnailUrl,
        videoUrl,
        videoDuration,
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        productTitle,
        productPrice,
        productImageUrl,
        productVariants,
        productStockStatus,
        galleryTitle,
        galleryTotalImages,
        galleryImages,
        monetizationRequired
      );
      return { post_id: postId };
    } catch (err) {
      setError(err.message || 'Failed to create post');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
};