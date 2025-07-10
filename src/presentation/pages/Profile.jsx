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
  Coins,
  CoinsIcon,
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
  const { target } = location.state || {};
  const { user: currentUser } = useRecoilValue(userAtom);
  const [activeTab, setActiveTab] = useState('ALL');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwnProfile , setIsProfileOwner] = useState(false);
  
  const { toggleLike, toggleBookmark, addView } = useFeedPosts(
    user?.user_id || target,
    activeTab
  );

  const {
    loading: profileLoading,
    profile,
    stats,
    toggleFollow,
  } = useProfile(user?.user_id || target);
  const {
    posts,
    loading: postsLoading,
    hasMore,
    loadMore,
    changeContentType,
  } = useUserPosts(user?.user_id || target, activeTab);

  const handleLoadMore = () => {
    if (hasMore) loadMore();
  };

  useEffect(() => {
    changeContentType(activeTab);
  }, [activeTab, changeContentType]);

  useEffect(()=>{
    const viewedId = target || user?.user_id; // fallback to own profile if target is undefined
    setIsProfileOwner(currentUser?.id === viewedId);
  },[target, user])

  const handleDirectMessage = e => {
    e.stopPropagation();
    const author = post.author || {};
    navigate(`/m/${author.user_id}`, {
      state: {
        recipientId: author.user_id,
        recipientName: author.username,
        rate: post.dm_fee || 0,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <div className="flex-1 border-l border-r border-gray-200 bg-white">
        <div className="p-4">
          
          
          <div className="flex mb-4">
            <div className="w-20 h-20 rounded-full border-2 border-red-100 overflow-hidden mr-4">
              <img
                src={user?.avatar_url || profile?.avatar_url || PLACEHOLDER_PICTURE}
                alt={user?.username || profile?.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="flex mb-2">
                  <h2 className="font-bold text-lg">
                    {profileLoading
                      ? 'Loading...'
                      : `${user?.name || profile?.name}`}
                    {!profileLoading && (
                      <span className="text-gray-500 text-sm ml-1">
                        @{user?.username || profile?.username}
                      </span>
                    )}
                  </h2>
                </div>

                <div className="flex space-x-4 mb-3 text-sm">
                  <div>
                    {user?.sexual_orientation && (
                      <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full font-medium mr-2">
                        {user.sexual_orientation || profile?.sexual_orientation}
                      </span>
                    )}
                  </div>
              {isOwnProfile && (
                <button
                  className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-2"
                  onClick={handleDirectMessage}
                >
                  <Coins size={14} className="mr-1" />
                  <span>Buy Tokens</span>
                </button>
              )}
              {!isOwnProfile && (
                <button
                  className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-2"
                  onClick={handleDirectMessage}
                >
                  <Send size={14} className="mr-1" />
                  <span>slide</span>
                </button>
              )}
                  {/* <div className="text-center">
                    <div className="font-semibold">
                      {user?.profile_views || 0}
                    </div>
                    <div className="text-xs text-gray-500">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{posts.length}</div>
                    <div className="text-xs text-gray-500">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {user?.connections.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Connections</div>
                  </div>
                  <div className="flex items-center text-yellow-600">
                    <Star size={14} className="mr-1" fill="currentColor" />
                    <div className="font-semibold">
                      {user?.rating?.toFixed(1) || '4.5'}
                    </div>
                  </div> */}
                </div>
                
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Edit size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="mb-4">
            {/* current user bio */}
            {!profileLoading && user?.bio && typeof user.bio === 'string' ? (
              <p className="text-sm mb-3 whitespace-pre-wrap">{user.bio}</p>
            ) : null}

            {/* target bio */}
            {!profileLoading && profile?.bio && typeof profile.bio === 'string' ? (
              <p className="text-sm mb-3 whitespace-pre-wrap">{profile.bio}</p>
            ) : null}
            
            {/* Profile Details */}
            <div className="space-y-2 mb-3">
              {(user?.address || profile?.address) && (
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {(user.address || profile?.address)}
                </div>
              )}
              
              {user?.interests?.[0]?.interests?.length > 0 && (
                <div className="flex items-start text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{user.interests[0].interests.join(', ')}</span>
                </div>
              )}
              
              {user?.born && (
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Born {new Date(user.born).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
              
              {(user?.created_at || profile?.created_at) && (
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Joined {new Date(user?.created_at || profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </div>
              )}
            </div>
            
            {/* Tags and Actions */}
            <div className="flex space-x-4 mb-3 text-sm">
              <div className="text-center">
                    <div className="font-semibold">
                      {user?.profile_views || 0}
                    </div>
                    <div className="text-xs text-gray-500">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{posts.length}</div>
                    <div className="text-xs text-gray-500">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {user?.connections.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Connections</div>
                  </div>
                  {
                    isOwnProfile && (
                      <div className="text-center">
                        <div className="flex items-center text-yellow-600">
                          <CoinsIcon size={14} className="mr-1" fill="currentColor" />
                          <div className="font-semibold">
                            {user?.tokens || '0'}
                          </div>
                        </div>
                        <div className="text-xs text-yellow-600">Tokens</div>
                      </div>
                    )
                  }
              {/* <div>
                {user?.sexual_orientation && (
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full font-medium mr-2">
                    {user.sexual_orientation}
                  </span>
                )}
              </div>
              
              {!isOwnProfile && (
                <button
                  className="flex items-center text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-1 rounded-full hover:from-red-700 hover:to-red-800 shadow-sm text-2"
                  onClick={handleDirectMessage}
                >
                  <Send size={14} className="mr-1" />
                  <span> slide</span>
                </button>
              )} */}
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
              <button
                onClick={() => setActiveTab('FREE')}
                className={`flex-1 py-2 font-medium text-sm ${activeTab === 'FREE' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:bg-gray-100 rounded-full'}`}
              >
                <Gift size={18} className="mx-auto" />
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
                  user={user}
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
            user={user}
            onClose={() => setShowEditModal(false)}
            onSave={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
