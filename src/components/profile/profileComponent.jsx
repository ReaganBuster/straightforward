import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Edit, ChevronLeft, Grid, DollarSign, Gift, MessageSquare, Share2, Star } from 'lucide-react';
import { useAuth, useProfile, useUserPosts, useFeedPosts } from '../../hooks/hooks';
import RightSidebar from '../feed/rightSidebar';
import ProfileEditForm from '../profile/profileEditingForm';
import RenderPost from '../feed/renderPost';

const Profile = ({ user }) => {
  // const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [showEditModal, setShowEditModal] = useState(false);

  const { 
    toggleLike,
    toggleBookmark,
    addView,
  } = useFeedPosts(user?.id, activeTab);

  const { profile, loading: profileLoading, stats, toggleFollow } = useProfile(user.id);
  const { posts, loading: postsLoading, hasMore, loadMore, changeContentType } = useUserPosts(profile?.user_id, activeTab);

  const isOwnProfile = currentUser?.user_id === profile?.user_id;

  const handleLoadMore = () => {
    if (hasMore) loadMore();
  };

  useEffect(() => {
    changeContentType(activeTab);
  }, [activeTab, changeContentType]);

  // Debug profile data
  useEffect(() => {
    console.log('Profile data:', profile);
  }, [profile]);

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <div className="flex-1 border-l border-r border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex mb-4">
            <div className="w-20 h-20 rounded-full border-2 border-red-100 overflow-hidden mr-4">
              <img src={profile?.avatar_url || "/api/placeholder/80/80"} alt={profile?.username} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="flex mb-2">
                  <h2 className="font-bold text-lg">
                    {profileLoading ? 'Loading...' : `${profile?.name || profile?.name}`}
                    {!profileLoading && <span className="text-gray-500 text-sm ml-1">@{profile?.username}</span>}
                  </h2>
                </div>
                <div className="flex space-x-4 mb-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{stats?.total_views || 0}</div>
                    <div className="text-xs text-gray-500">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{posts.length}</div>
                    <div className="text-xs text-gray-500">posts</div>
                  </div>
                  <div className="flex items-center text-yellow-600">
                    <Star size={14} className="mr-1" fill="currentColor" />
                    <div className="font-semibold">{profile?.rating?.toFixed(1) || '4.5'}</div>
                  </div>
                </div>
              </div>
              {!isOwnProfile && (
                <button onClick={() => setShowEditModal(true)} className="p-2 rounded-full hover:bg-gray-100">
                  <Edit size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="mb-4">
            {!profileLoading && profile?.bio && typeof profile.bio === 'string' ? (
              <p className="text-sm mb-2 whitespace-pre-wrap">{profile.bio}</p>
            ) : null}
            {profile?.expertise && (
              <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full font-medium mr-2">{profile.expertise}</span>
            )}
            {!isOwnProfile && (
              <button onClick={() => toggleFollow(profile.user_id)} className="py-1.5 px-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                {profile.is_following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex justify-around py-2">
              <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-2 font-medium text-sm ${activeTab === 'ALL' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:bg-gray-100 rounded-full'}`}>
                <Grid size={18} className="mx-auto" />
              </button>
              <button onClick={() => setActiveTab('MONETISED')} className={`flex-1 py-2 font-medium text-sm ${activeTab === 'MONETISED' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:bg-gray-100 rounded-full'}`}>
                <DollarSign size={18} className="mx-auto" />
              </button>
              <button onClick={() => setActiveTab('FREE')} className={`flex-1 py-2 font-medium text-sm ${activeTab === 'FREE' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:bg-gray-100 rounded-full'}`}>
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
              {posts.map((post) => (
                <RenderPost
                  key={post.post_id}
                  post={post}
                  user={user}
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  addView={addView}
                  onFollow={() => {/* Implement follow logic */}}
                  onReport={() => {/* Implement report logic */}}
                  onShare={() => {
                    navigator.clipboard.writeText(window.location.origin + `/post/${post.post_id}`);
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
          <ProfileEditForm profile={profile} onClose={() => setShowEditModal(false)} onSave={() => {}} />
        </div>
      )}
    </div>
  );
};

export default Profile;