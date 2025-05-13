import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Bookmark, Share2, MoreHorizontal, Lock, 
  Activity, Mail, DollarSign, Zap, Star, CreditCard, 
  Wallet, Calendar, FileText, Gift, TrendingUp, MessageSquare,
  Clock, Users, Video, Download, Send, Award
} from 'lucide-react';

import { usePostRatings } from '../../hooks/hooks';
import RatingStars from './ratingCopmonent';

const RenderPost = ({ post, user, toggleLike, toggleBookmark, addView, unlockContent }) => {
  const navigate = useNavigate();
  
  // Local state to optimize UI updates before the hook state updates
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [showFullTeaser, setShowFullTeaser] = useState(false);
  
  const [showRatingModal, setShowRatingModal] = useState(false);

  const { userRatings, 
    fetchUserRatings, 
    ratePost, 
    isLoading: isRatingLoading } = usePostRatings();
  
  useEffect(() => {
    if (user?.id) {
      fetchUserRatings(user.id);
    }
  }, [user, fetchUserRatings]);
  
  const handleRatePost = async (postId, authorId, score) => {
    if (!user) {
      // Handle not logged in case
      alert('Please log in to rate this post');
      return;
    }
    
    await ratePost(user.id, postId, authorId, score);
    setShowRatingModal(false);
  };
  
  // Update local state when post props change (e.g., after API updates)
  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikeCount(post.like_count || 0);
    setIsBookmarked(post.is_bookmarked || false);
  }, [post.is_liked, post.like_count, post.is_bookmarked]);
  
  const handleLike = async (postId) => {
    // Update local state immediately
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    // Call the API function from the hook
    await toggleLike(postId);
  };
  
  const handleBookmark = async (postId) => {
    // Update local state immediately
    setIsBookmarked(!isBookmarked);
    
    // Call the API function from the hook
    await toggleBookmark(postId);
  };
  
  const handleViewPost = (postId) => {
    addView(postId);
  };
  
  const handleDirectMessage = (userId, username, dmFee) => {
    navigate(`/m/${userId}`, { 
      state: { 
        recipientId: userId, 
        recipientName: username, 
        rate: dmFee
      }
    });
  };
  
  const handleUnlockContent = (postId, contentFee, monetizationType) => {
    unlockContent(postId, contentFee, monetizationType);
  };
  
  const authorInfo = post.author || {};
  
  // Helper function to format currency
  const formatCurrency = (amount, currency = 'UGX') => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  // Determine teaser content display
  const renderTeaserContent = () => {
    if (!post.preview_content && !post.teaser_content) return null;
    
    const teaserText = post.preview_content || post.teaser_content;
    
    return (
      <div className="mt-2 relative">
        <p className="text-gray-900">{teaserText}</p>
        {!showFullTeaser && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        )}
        <button 
          className="text-red-600 text-sm font-medium mt-1"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullTeaser(!showFullTeaser);
          }}
        >
          {showFullTeaser ? "Show less" : "Show more..."}
        </button>
      </div>
    );
  };
  
  // Get appropriate icon for monetization type
  const getMonetizationIcon = (type) => {
    const iconMap = {
      'paid_dm': <Mail size={10} className="mr-0.5" />,
      'priority_dm': <Send size={10} className="mr-0.5" />,
      'reply_fee': <MessageSquare size={10} className="mr-0.5" />,
      'content_unlock': <Lock size={10} className="mr-0.5" />,
      'file_download': <Download size={10} className="mr-0.5" />,
      'streaming_access': <Video size={10} className="mr-0.5" />,
      'teaser_unlock': <Lock size={10} className="mr-0.5" />,
      'booking_request': <Calendar size={10} className="mr-0.5" />,
      'reservation_deposit': <Wallet size={10} className="mr-0.5" />,
      'event_ticket': <Calendar size={10} className="mr-0.5" />,
      'service_order': <FileText size={10} className="mr-0.5" />,
      'tip': <Gift size={10} className="mr-0.5" />,
      'donation': <Gift size={10} className="mr-0.5" />,
      'post_boost': <TrendingUp size={10} className="mr-0.5" />,
      'user_subscription': <Star size={10} className="mr-0.5" />,
      'exclusive_feed': <Star size={10} className="mr-0.5" />,
      'group_access': <Users size={10} className="mr-0.5" />,
      'sponsored_post': <Award size={10} className="mr-0.5" />,
      'profile_ad': <Award size={10} className="mr-0.5" />,
      'inbox_ad': <Award size={10} className="mr-0.5" />,
      'content_fee': <Lock size={10} className="mr-0.5" />,
      'subscription': <Star size={10} className="mr-0.5" />,
      'dm': <Mail size={10} className="mr-0.5" />,
      'referral_bonus': <Users size={10} className="mr-0.5" />,
      'affiliate_commission': <DollarSign size={10} className="mr-0.5" />,
      'default': <DollarSign size={10} className="mr-0.5" />
    };
    
    return iconMap[type] || iconMap.default;
  };
  
  // Get appropriate background and text color for monetization type
  const getMonetizationStyles = (type) => {
    // Categories mapped to color schemes
    const styleMap = {
      // Messaging-Based
      'paid_dm': 'bg-blue-100 text-blue-800',
      'priority_dm': 'bg-blue-100 text-blue-800',
      'reply_fee': 'bg-blue-100 text-blue-800',
      
      // Content Unlocks
      'content_unlock': 'bg-red-100 text-red-800',
      'file_download': 'bg-red-100 text-red-800',
      'streaming_access': 'bg-red-100 text-red-800',
      'teaser_unlock': 'bg-red-100 text-red-800',
      'content_fee': 'bg-red-100 text-red-800',
      
      // Service-Based
      'booking_request': 'bg-amber-100 text-amber-800',
      'reservation_deposit': 'bg-amber-100 text-amber-800',
      'event_ticket': 'bg-amber-100 text-amber-800',
      'service_order': 'bg-amber-100 text-amber-800',
      
      // Community / Tipping
      'tip': 'bg-green-100 text-green-800',
      'donation': 'bg-green-100 text-green-800',
      'post_boost': 'bg-green-100 text-green-800',
      
      // Subscription-Based
      'user_subscription': 'bg-purple-100 text-purple-800',
      'exclusive_feed': 'bg-purple-100 text-purple-800',
      'group_access': 'bg-purple-100 text-purple-800',
      'subscription': 'bg-purple-100 text-purple-800',
      
      // Advertisement
      'sponsored_post': 'bg-indigo-100 text-indigo-800',
      'profile_ad': 'bg-indigo-100 text-indigo-800',
      'inbox_ad': 'bg-indigo-100 text-indigo-800',
      
      // Referral & Affiliate
      'referral_bonus': 'bg-teal-100 text-teal-800',
      'affiliate_commission': 'bg-teal-100 text-teal-800',
      
      // Default
      'dm': 'bg-blue-100 text-blue-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    
    return styleMap[type] || styleMap.default;
  };
  
  // Get friendly name for monetization type
  const getMonetizationLabel = (type) => {
    const labelMap = {
      'paid_dm': 'DM Fee',
      'priority_dm': 'Priority DM',
      'reply_fee': 'Reply Fee',
      'content_unlock': 'Premium Content',
      'file_download': 'File Download',
      'streaming_access': 'Stream Access',
      'teaser_unlock': 'Full Access',
      'booking_request': 'Booking',
      'reservation_deposit': 'Reservation',
      'event_ticket': 'Event Ticket',
      'service_order': 'Service',
      'tip': 'Tip Creator',
      'donation': 'Support',
      'post_boost': 'Boosted',
      'user_subscription': 'Subscription',
      'exclusive_feed': 'Exclusive',
      'group_access': 'Private Group',
      'sponsored_post': 'Sponsored',
      'profile_ad': 'Promoted',
      'inbox_ad': 'Sponsored Message',
      'content_fee': 'Premium Content',
      'subscription': 'Subscription',
      'dm': 'DM Fee',
      'referral_bonus': 'Referral',
      'affiliate_commission': 'Affiliate',
      'default': 'Premium'
    };
    
    return labelMap[type] || labelMap.default;
  };
  
  // Determine the active monetization type for this post
  const getPostMonetizationType = () => {
    // Map legacy monetization models to new types
    return post.monetization_type_id ? post.monetization_type :
      post.monetization_model === 'content_fee' ? 'content_unlock' :
      post.monetization_model === 'subscription' ? 'user_subscription' :
      post.monetization_model === 'dm' ? 'paid_dm' : null;
  };
  
  // Get the fee associated with the current monetization type
  const getMonetizationFee = () => {
    return post.monetization_fee || post.content_fee || post.dm_fee || 0;
  };
  
  // Determine monetization display
  const getMonetizationBadge = () => {
    const monetizationType = getPostMonetizationType();
    
    if (!monetizationType) return null;
    
    const fee = getMonetizationFee();
    const currency = authorInfo.currency || 'UGX';
    const baseClassName = "text-xs px-2 py-0.5 rounded-full flex items-center";
    const colorClassName = getMonetizationStyles(monetizationType);
    const icon = getMonetizationIcon(monetizationType);
    const label = getMonetizationLabel(monetizationType);
    
    return (
      <span className={`${baseClassName} ${colorClassName}`}>
        {icon}
        {fee > 0 ? `${formatCurrency(fee, currency)} ${label}` : label}
      </span>
    );
  };
  
  // Render premium content unlock section
  const renderPremiumContent = () => {
    if (!post.is_premium) return null;
    
    const monetizationType = getPostMonetizationType();
    
    const fee = getMonetizationFee();
    const currency = authorInfo.currency || 'UGX';
    
    let actionText = "Premium content";
    let showUnlockButton = false;
    
    // Customize message based on monetization type
    switch(monetizationType) {
      case 'content_unlock':
      case 'teaser_unlock':
      case 'content_fee':
        actionText = `Premium content - Unlock for ${formatCurrency(fee, currency)}`;
        showUnlockButton = true;
        break;
      case 'file_download':
        actionText = `Download file for ${formatCurrency(fee, currency)}`;
        showUnlockButton = true;
        break;
      case 'streaming_access':
        actionText = `Stream content for ${formatCurrency(fee, currency)}`;
        showUnlockButton = true;
        break;
      case 'user_subscription':
      case 'exclusive_feed':
      case 'subscription':
        actionText = "Subscribe to access this content";
        showUnlockButton = false;
        break;
      case 'paid_dm':
      case 'priority_dm':
      case 'reply_fee':
      case 'dm':
        actionText = "DM to unlock this content";
        showUnlockButton = false;
        break;
      case 'event_ticket':
        actionText = `Get ticket for ${formatCurrency(fee, currency)}`;
        showUnlockButton = true;
        break;
      case 'service_order':
        actionText = `Purchase service for ${formatCurrency(fee, currency)}`;
        showUnlockButton = true;
        break;
      case 'booking_request':
        actionText = `Book for ${formatCurrency(fee, currency)}`;
        showUnlockButton = true;
        break;
      default:
        actionText = "Premium content";
        showUnlockButton = fee > 0;
    }
    
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center text-gray-500">
          <Lock size={16} className="mr-2" />
          <p className="text-sm font-medium">{actionText}</p>
          
          {showUnlockButton && (
            <button 
              className="ml-auto text-xs bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleUnlockContent(post.post_id, fee, monetizationType);
              }}
            >
              Unlock
            </button>
          )}
        </div>
      </div>
    );
  };

  // Determine if this post has a DM monetization type
  const hasDmMonetization = () => {
    const monetizationType = getPostMonetizationType();
    return ['paid_dm', 'priority_dm', 'reply_fee', 'dm'].includes(monetizationType);
  };

  // Render action button based on monetization type
  const renderActionButton = () => {
    const monetizationType = getPostMonetizationType();
    const fee = getMonetizationFee();
    const currency = authorInfo.currency || 'UGX';
    
    // Default DM button (when no specific monetization or it's a DM-based monetization)
    if (!monetizationType || hasDmMonetization()) {
      return (
        <button 
          className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs"
          onClick={(e) => {
            e.stopPropagation();
            const dmRate = fee || authorInfo.rate_per_msg || 0;
            handleDirectMessage(authorInfo.user_id, authorInfo.username, dmRate);
          }}
        >
          <Mail size={14} className="mr-1" />
          <span>
            {fee > 0 ? 
              `${formatCurrency(fee, currency)}` : 
              authorInfo.rate_per_msg ? 
              `${formatCurrency(authorInfo.rate_per_msg, currency)}` : 
              'DM'}
          </span>
        </button>
      );
    }
    
    // Content unlock button
    if (['content_unlock', 'file_download', 'streaming_access', 'content_fee'].includes(monetizationType)) {
      const icon = monetizationType === 'file_download' ? <Download size={14} className="mr-1" /> : 
                   monetizationType === 'streaming_access' ? <Video size={14} className="mr-1" /> :
                   <Lock size={14} className="mr-1" />;
      
      return (
        <button 
          className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleUnlockContent(post.post_id, fee, monetizationType);
          }}
        >
          {icon}
          <span>
            {fee > 0 ? `${formatCurrency(fee, currency)}` : 'Unlock'}
          </span>
        </button>
      );
    }
    
    // Subscription button
    if (['user_subscription', 'exclusive_feed', 'subscription', 'group_access'].includes(monetizationType)) {
      return (
        <button 
          className="flex items-center text-white bg-gradient-to-r from-purple-600 to-purple-700 px-2 py-1 rounded-full hover:from-purple-700 hover:to-purple-800 shadow-sm text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleUnlockContent(post.post_id, fee, monetizationType);
          }}
        >
          <Star size={14} className="mr-1" />
          <span>Subscribe</span>
        </button>
      );
    }
    
    // Service/Booking button
    if (['booking_request', 'service_order', 'event_ticket', 'reservation_deposit'].includes(monetizationType)) {
      const icon = monetizationType === 'event_ticket' ? <Calendar size={14} className="mr-1" /> :
                   monetizationType === 'service_order' ? <FileText size={14} className="mr-1" /> :
                   <Calendar size={14} className="mr-1" />;
      
      const label = monetizationType === 'event_ticket' ? 'Ticket' :
                   monetizationType === 'service_order' ? 'Service' :
                   monetizationType === 'reservation_deposit' ? 'Reserve' : 'Book';
      
      return (
        <button 
          className="flex items-center text-white bg-gradient-to-r from-amber-600 to-amber-700 px-2 py-1 rounded-full hover:from-amber-700 hover:to-amber-800 shadow-sm text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleUnlockContent(post.post_id, fee, monetizationType);
          }}
        >
          {icon}
          <span>{label}</span>
        </button>
      );
    }
    
    // Tip/Support button
    if (['tip', 'donation'].includes(monetizationType)) {
      return (
        <button 
          className="flex items-center text-white bg-gradient-to-r from-green-600 to-green-700 px-2 py-1 rounded-full hover:from-green-700 hover:to-green-800 shadow-sm text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleUnlockContent(post.post_id, fee, monetizationType);
          }}
        >
          <Gift size={14} className="mr-1" />
          <span>{monetizationType === 'donation' ? 'Support' : 'Tip'}</span>
        </button>
      );
    }
    
    // Default DM button as fallback
    return (
      <button 
        className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs"
        onClick={(e) => {
          e.stopPropagation();
          const dmRate = authorInfo.rate_per_msg || 0;
          handleDirectMessage(authorInfo.user_id, authorInfo.username, dmRate);
        }}
      >
        <Mail size={14} className="mr-1" />
        <span>DM</span>
      </button>
    );
  };
  
  return (
    <div className="p-3 border-b border-gray-100" onClick={() => handleViewPost(post.post_id)}>
      <div className="flex justify-between">
        <div className="flex">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-2 border border-red-100">
            <img src={authorInfo.avatar_url || "/api/placeholder/40/40"} alt={authorInfo.username} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-gray-900 mr-1">{authorInfo.name || authorInfo.username}</h3>
              {authorInfo.is_verified && (
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              )}
              <span className="text-gray-500 text-sm ml-1">@{authorInfo.username}</span>
              <span className="text-gray-500 text-sm mx-1">·</span>
              <span className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center mt-0.5 flex-wrap gap-1">
              {authorInfo.expertise && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  authorInfo.expertise === 'Consultant' ? 'bg-purple-100 text-purple-800' : 
                  authorInfo.expertise === 'Expert' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {authorInfo.expertise}
                </span>
              )}
              
              {/* Show monetization badge */}
              {getMonetizationBadge()}
              
              {authorInfo.rating && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                  <Star size={10} className="mr-0.5" fill="currentColor" />
                  {authorInfo.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className="mt-2 mb-2">
        {/* Regular content */}
        {!post.is_premium && <p className="text-gray-900">{post.content}</p>}
        
        {/* Teaser content with fade effect */}
        {post.is_premium && renderTeaserContent()}
        
        {/* Premium content - show appropriate lock based on monetization model */}
        {post.is_premium && renderPremiumContent()}
        
        {/* Show image if not premium or if it's a teaser image meant to be shown */}
        {(post.image_url && !post.is_premium) || (post.image_url && post.show_teaser_image) ? (
          <div className="mt-2 rounded-xl overflow-hidden">
            <img src={post.image_url || "/api/placeholder/600/400"} alt="Post" className="w-full h-auto object-cover" />
          </div>
        ) : null}
        
        {/* Display post topics as tags */}
        {post.topics && post.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.topics.map((topic, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-800">#{topic}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1 text-gray-500 text-xs">
        <div className="flex items-center space-x-1">
          <Zap size={12} />
          <span>{((post.views || 0) / 1000).toFixed(1)}K</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{authorInfo.response_rate || 95}% response</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={12} className="mr-1" />
          <span>{authorInfo.avg_response_time || "< 1h"}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
        <button 
          className={`flex items-center ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike(post.post_id);
          }}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          <span className="text-xs ml-1">{likeCount > 0 ? likeCount : ""}</span>
        </button>
        
        {/* Tip button - only show if post allows tipping */}
        {post.allows_tipping && (
          <button 
            className="flex items-center text-gray-500 hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle tip action
              handleUnlockContent(post.post_id, post.suggested_tip || 1000, 'tip');
            }}
          >
            <Gift size={18} />
          </button>
        )}
        
        {/* Star button in place of Tip when not allowed */}
        {!post.allows_tipping && (
          <button className="flex items-center text-gray-500 hover:text-red-600">
            <Star size={18} />
          </button>
        )}
        
        <button 
          className={`flex items-center ${isBookmarked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark(post.post_id);
          }}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        
        {/* Dynamic Action Button based on monetization type */}
        {renderActionButton()}
        
        <button onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-gray-600">
          <Share2 size={18} />
        </button>
      </div>
      
      {/* Show trending info if applicable */}
      {post.is_trending && post.trending_category && (
        <div className="mt-2 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full inline-flex items-center">
          <Activity size={12} className="mr-1" />
          {post.trending_category}
        </div>
      )}
      
      {/* Show boost status if applicable */}
      {post.is_boosted && (
        <div className="mt-2 px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full inline-flex items-center">
          <TrendingUp size={12} className="mr-1" />
          Boosted Post
        </div>
      )}
      
      {/* Show subscription tier info if applicable */}
      {post.subscription_tier && (
        <div className="mt-2 px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full inline-flex items-center">
          <Wallet size={12} className="mr-1" />
          {post.subscription_tier} tier
        </div>
      )}
    </div>
  );
}

export default RenderPost;