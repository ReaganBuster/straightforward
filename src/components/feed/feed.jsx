import { useState, useRef, useEffect } from 'react';
import { useFeedPosts } from '../../hooks/hooks';
import RenderPost from './renderPost';
import RightSidebar from './rightSidebar';
import CreatePost from './createPost';

const SocialFeed = ({ user }) => {
  const [activeTab, setActiveTab] = useState('discover');
  const mainContentRef = useRef(null);
  const rightSidebarRef = useRef(null);

  const { 
    posts, 
    loading,
    hasMore,
    loadMore, 
    changeFeedType,
    toggleLike,
    toggleBookmark,
    addView,
    unlockContent,
    addPost
  } = useFeedPosts(user?.id, activeTab);

  useEffect(() => {
    changeFeedType(activeTab);
  }, [activeTab, changeFeedType]);

  // Enable independent scrolling
  useEffect(() => {
    const handleScroll = (e) => {
      e.stopPropagation();
    };

    const mainContent = mainContentRef.current;
    const rightSidebar = rightSidebarRef.current;

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    if (rightSidebar) {
      rightSidebar.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
      if (rightSidebar) {
        rightSidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePostCreated = (newPost) => {
    addPost(newPost);
  };

  const getTabDescription = () => {
    switch (activeTab) {
      // case 'following':
      //   return user?.following?.length > 0 ? 'Posts from users you follow.' : 'Follow users to see their posts.';
      case 'bookmarks':
        return posts.length > 0 ? 'Your saved posts.' : 'No bookmarks yet. Save posts to see them here.';
      case 'liked':
        return posts.length > 0 ? 'Posts you’ve liked.' : 'No liked posts yet. Like posts to see them here.';
      case 'discover':
      default:
        return 'Explore new posts from the community.';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div 
        ref={mainContentRef}
        className="w-full md:w-[calc(100%-20rem)] border-l border-r border-gray-200 bg-white overflow-y-auto min-h-screen pb-[60px] md:pb-0 shadow-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 60px)' }}
      >
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex space-x-1">
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'discover' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('discover')}
              >
                Discover
              </button>
              {/* <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'following' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('following')}
              >
                Following
              </button> */}
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'bookmarks' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('bookmarks')}
              >
                Bookmarks
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm rounded-full ${activeTab === 'liked' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('liked')}
              >
                Liked
              </button>
            </div>
          </div>
        </div>
        
        {/* Create Post */}
        <div className="hidden md:block">
          <CreatePost user={user} onPostCreated={handlePostCreated} />
        </div>
        
        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 md:h-6 md:w-6 border-t-4 border-b-4 md:border-t-2 md:border-b-2 border-red-600"></div>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center p-4 text-gray-500 text-sm">
            {getTabDescription()}
          </div>
        )}
        
        <div>
          {posts.map((post) => (
            <RenderPost 
              key={post.post_id} 
              post={post} 
              user={user} 
              toggleLike={toggleLike}
              toggleBookmark={toggleBookmark}
              addView={addView} 
              unlockContent={unlockContent} 
            />
          ))}
        </div>
        
        {!loading && posts.length > 0 && hasMore && (
          <div className="p-3 flex justify-center">
            <button 
              className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition text-sm"
              onClick={loadMore}
            >
              Load More
            </button>
          </div>
        )}
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar rightSidebarRef={rightSidebarRef} user={user} /> 
    </div>
  );
};

export default SocialFeed;