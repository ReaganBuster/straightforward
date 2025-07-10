import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import {
  Edit,
  Grid,
  DollarSign,
  Gift,
  Star,
  Plane,
  Send,
  Coins, // Used for Buy Tokens
  CoinsIcon, // Used for Tokens stat
} from 'lucide-react';
import { useFeedPosts } from '@presentation/hooks/useFeedPosts';
import { userAtom } from '@shared/state/authAtom';
import { useRecoilValue } from 'recoil';
import { useProfile } from '@presentation/hooks/useProfile';
import { useUserPosts } from '@presentation/hooks/useUserPosts';
import RightSidebar from '@presentation/components/RightSidebar/RightSidebar';
import ProfileEditForm from '@presentation/components/ProfileEditingForm/ProfileEditingForm';
import RenderPost from '@presentation/components/RenderPost/RenderPost';
import { PLACEHOLDER_PICTURE } from '@constants/constants';

const Profile = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Ensure useNavigate is imported and used
  const { target } = location.state || {}; // target is the user_id if navigating from another profile
  const { user: currentUser } = useRecoilValue(userAtom); // Logged-in user info
  const [activeTab, setActiveTab] = useState('ALL');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwnProfile , setIsProfileOwner] = useState(false);

  // Determine the user ID for the profile being viewed
  const viewedUserId = target || currentUser?.id; // If target exists, view that profile; otherwise, view current user's profile

  // Hooks now consistently use viewedUserId
  const { toggleLike, toggleBookmark, addView } = useFeedPosts(
    viewedUserId,
    activeTab
  );

  const {
    loading: profileLoading,
    profile, // This object contains the data for the viewed profile
    stats,
    toggleFollow, // Placeholder if you implement follow functionality
  } = useProfile(viewedUserId);
  
  const {
    posts,
    loading: postsLoading,
    hasMore,
    loadMore,
    changeContentType,
  } = useUserPosts(viewedUserId, activeTab);

  const handleLoadMore = () => {
    if (hasMore) loadMore();
  };

  useEffect(() => {
    changeContentType(activeTab);
  }, [activeTab, changeContentType]);

  useEffect(()=>{
    // Check if the viewed profile is the logged-in user's profile
    setIsProfileOwner(currentUser?.id === viewedUserId);
  },[viewedUserId, currentUser]); // Depend on viewedUserId and currentUser

  // Handler for Direct Message button (when viewing someone else's profile)
  const handleDirectMessageToProfile = () => {
    if (profile) { // Ensure profile data is loaded
      navigate(`/m/${profile.user_id}`, {
        state: {
          recipientId: profile.user_id,
          recipientName: profile.name || profile.username,
          rate: profile.dm_fee || 0, // Assuming dm_fee is part of profile data
        },
      });
    }
  };

  // Handler for Buy Tokens button (only on own profile)
  const handleBuyTokensClick = () => {
    // This is where you would integrate logic for buying tokens
    // e.g., open a modal, navigate to a payment page, etc.
    alert('Buy Tokens functionality will be implemented here!');
    // navigate('/buy-tokens'); // Example navigation
  };


  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <div className="flex-1 border-l border-r border-gray-200 bg-white">
        <div className="">


          <div className="flex m-4">
            <div className="w-20 h-20 rounded-full border-2 border-red-100 overflow-hidden mr-4">
              <img
                src={profile?.avatar_url || PLACEHOLDER_PICTURE} // Use profile's avatar
                alt={profile?.username || 'Profile Picture'} // Use profile's username for alt
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                {/* Name and Username - with ellipsis on mobile */}
                <div className="flex mb-2 items-baseline min-w-0"> {/* min-w-0 for truncate to work */}
                  <h2 className="font-bold text-lg truncate"> {/* truncate applied here */}
                    {profileLoading ? 'Loading...' : profile?.name} {/* Use profile.name */}
                  </h2>
                  {!profileLoading && (
                    <span className="text-gray-500 text-sm ml-1 truncate"> {/* truncate applied here */}
                      @{profile?.username} {/* Use profile.username */}
                    </span>
                  )}
                </div>

                {/* Profile Actions/Orientation */}
                <div className="flex space-x-4 mb-3 text-sm">
                  {/* Sexual Orientation Tag */}
                  {profile?.sexual_orientation && ( // Use profile.sexual_orientation
                    <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full font-medium mr-2">
                      {profile.sexual_orientation}
                    </span>
                  )}

                  {/* Buy Tokens / Slide (DM) Buttons - Adjusted Text Size */}
                  {isOwnProfile ? (
                    <button
                      className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs md:text-sm" // text-xs for mobile, md:text-sm for larger
                      onClick={handleBuyTokensClick} // Correct handler for Buy Tokens
                    >
                      <Coins size={14} className="mr-1" />
                      <span>Buy Tokens</span>
                    </button>
                  ) : (
                    <button
                      className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-xs md:text-sm" // text-xs for mobile, md:text-sm for larger
                      onClick={handleDirectMessageToProfile} // Correct handler for DM
                    >
                      <Send size={14} className="mr-1" />
                      <span>Slide</span>
                    </button>
                  )}
                </div>

              </div>
              {/* Edit Profile Button (only for own profile) */}
              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Edit profile"
                >
                  <Edit size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="m-4">
            {/* Profile Bio */}
            {!profileLoading && profile?.bio && typeof profile.bio === 'string' ? ( // Use profile.bio
              <p className="text-sm mb-3 whitespace-pre-wrap">{profile.bio}</p>
            ) : null}

            {/* Profile Details */}
            <div className="space-y-2 mb-3">
              {profile?.address && ( // Use profile.address
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.address}
                </div>
              )}

              {profile?.interests?.[0]?.interests?.length > 0 && ( // Use profile.interests
                <div className="flex items-start text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{profile.interests[0].interests.join(', ')}</span>
                </div>
              )}

              {profile?.born && ( // Use profile.born
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Born {new Date(profile.born).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}

              {profile?.created_at && ( // Use profile.created_at
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            <div className="flex space-x-4 mb-3 text-sm">
              <div className="text-center">
                    <div className="font-semibold">
                      {stats?.profile_views || 0} {/* Use stats for profile_views */}
                    </div>
                    <div className="text-xs text-gray-500">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{posts.length}</div>
                    <div className="text-xs text-gray-500">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {stats?.connections || 0} {/* Use stats for connections */}
                    </div>
                    <div className="text-xs text-gray-500">Connections</div>
                  </div>
                  {
                    isOwnProfile && (
                      <div className="text-center">
                        <div className="flex items-center text-yellow-600">
                          <CoinsIcon size={14} className="mr-1" fill="currentColor" />
                          <div className="font-semibold">
                            {stats?.tokens || '0'} {/* Use stats for tokens */}
                          </div>
                        </div>
                        <div className="text-xs text-yellow-600">Tokens</div>
                      </div>
                    )
                  }
            </div>
          </div>


          <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex justify-around py-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`flex-1 py-2 font-medium text-sm ${activeTab === 'ALL' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:bg-gray-100 rounded-full'}`}
              >
                <Grid size={18} className="mx-auto" />
              </button>
              <button
                onClick={() => setActiveTab('MONETISED')}
                className={`flex-1 py-2 font-medium text-sm ${activeTab === 'MONETISED' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:bg-gray-100 rounded-full'}`}
              >
                <DollarSign size={18} className="mx-auto" />
              </button>
            </div>
          </div>
          {postsLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 md:h-6 md:w-6 border-t-4 border-b-4 md:border-t-2 md:border-b-2 border-red-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              No posts found.
            </div>
          ) : (
            <div>
              {posts.map(post => (
                <RenderPost
                  key={post.post_id}
                  post={post}
                  user={currentUser} // Pass current user to RenderPost for like/bookmark state
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  addView={addView}
                  onFollow={() => {
                    /* Implement follow logic */
                  }}
                  onReport={() => {
                    /* Implement report logic */
                  }}
                  onShare={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + `/post/${post.post_id}`
                    );
                    alert('Link copied to clipboard!');
                  }}
                />
              ))}
              {!postsLoading && posts.length > 0 && hasMore && (
                <div className="p-3 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <RightSidebar />
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ProfileEditForm
            user={currentUser} // Pass current user to edit form
            onClose={() => setShowEditModal(false)}
            onSave={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;