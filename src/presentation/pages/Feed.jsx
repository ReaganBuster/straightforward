import { useState, useRef, useEffect, useCallback } from 'react';
import { useFeedPosts } from '@presentation/hooks/useFeedPosts';
import RenderPost from '@presentation/components/RenderPost/RenderPost';
import RightSidebar from '@presentation/components/RightSidebar/RightSidebar';
import CreatePost from '@presentation/components/CreatePost/CreatePost';
import MobileNavBar from '@presentation/components/Navbar/Navbar';

const Feed = ({ user }) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // No need for isMobile state if using responsive classes directly
  // const [isMobile] = useState(window.innerWidth <= 1024);
  const mainContentRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const lastScrollTop = useRef(0);

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
    addPost,
  } = useFeedPosts(user?.user_id, activeTab);

  const handleTabChange = tab => setActiveTab(tab);
  const handlePostCreated = newPost => addPost(newPost);

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'bookmarks':
        return posts.length > 0
          ? 'Your saved posts.'
          : 'No bookmarks yet. Save posts to see them here.';
      case 'likes':
        return posts.length > 0
          ? "Posts you've liked."
          : 'No liked posts yet. Like posts to see them here.';
      case 'discover':
      default:
        return 'Explore new posts from the community.';
    }
  };

  const handleScroll = useCallback(() => {
    const scrollEl = mainContentRef.current;
    if (!scrollEl) return;

    const currentScrollTop = scrollEl.scrollTop;
    const delta = currentScrollTop - lastScrollTop.current;

    // Only consider significant scroll changes to avoid flickering
    if (Math.abs(delta) < 5) return;

    // Only toggle if not on a larger screen (where mobile nav might not be relevant)
    // You might want to check window.innerWidth here if isMobile is no longer state
    // For now, assuming this nav is truly mobile-only based on usage
    if (window.innerWidth <= 1024) { // Re-evaluate based on where MobileNavBar hides
      if (delta > 0 && isMobileNavVisible) {
        setIsMobileNavVisible(false);
      } else if (delta < 0 && !isMobileNavVisible) {
        setIsMobileNavVisible(true);
      }
    }


    lastScrollTop.current = currentScrollTop;
  }, [isMobileNavVisible]);

  useEffect(() => {
    changeFeedType(activeTab);
  }, [activeTab, changeFeedType]);

  useEffect(() => {
    const scrollEl = mainContentRef.current;
    if (!scrollEl) return;

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // This useEffect seems intended to prevent scroll propagation on multiple scrollable elements.
  // While generally not the cause of "cramping" directly, it's good practice.
  useEffect(() => {
    const handleStopPropagation = e => e.stopPropagation();

    const mainContent = mainContentRef.current;
    const rightSidebar = rightSidebarRef.current;

    // Check if elements exist before adding listeners
    if (mainContent) {
      mainContent.addEventListener('scroll', handleStopPropagation);
    }
    if (rightSidebar) {
      rightSidebar.addEventListener('scroll', handleStopPropagation);
    }


    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleStopPropagation);
      }
      if (rightSidebar) {
        rightSidebar.removeEventListener('scroll', handleStopPropagation);
      }
    };
  }, []); // Depend on nothing to run once, or include refs if they can change

  return (
    // This top-level div for Feed assumes it's placed inside a parent layout
    // that manages the Left Sidebar (if any) and provides the remaining space.
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Feed Content Area */}
      <div
        ref={mainContentRef}
        // Default w-full for small screens.
        // md:w-full for tablets (RightSidebar is hidden on md).
        // lg:w-[calc(100%-20rem)] for larger desktops (RightSidebar is visible on lg).
        className="w-full md:w-full lg:w-[calc(100%-20rem)] border-l border-r border-gray-200 bg-white overflow-y-auto min-h-screen pb-[60px] md:pb-0 shadow-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 60px)' }}
      >
        {/* Mobile NavBar with scroll-based visibility */}
        {/* The condition for 'isMobile' should align with the breakpoint where MobileNavBar is intended to be visible.
            Since you mentioned it's a mobile nav, a simple check of window.innerWidth might be enough if md:hidden is on the nav.
            If MobileNavBar itself uses md:hidden, then this `isMobile` state becomes less critical for visibility here.
            For now, let's keep it if MobileNavBar is *always* rendered and its own styles hide it.
        */}
        {window.innerWidth <= 1024 && ( // Replaced `isMobile` state with direct window.innerWidth check
          <div
            className={`sticky top-0 z-20 transition-transform duration-300 ease-in-out ${isMobileNavVisible ? 'translate-y-0' : '-translate-y-full'}`}
          >
            <MobileNavBar user={user} toggleSidebar={toggleSidebar} />
          </div>
        )}

        {/* Tab Filter */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex space-x-1">
              <button
                className={`px-4 py-2 font-medium text-sm rounded-full ${
                  activeTab === 'discover'
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('discover')}
              >
                Discover
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm rounded-full ${
                  activeTab === 'bookmarks'
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('bookmarks')}
              >
                Bookmarks
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm rounded-full ${
                  activeTab === 'likes'
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('likes')}
              >
                Likes
              </button>
            </div>
          </div>
        </div>

        {/* Create Post - Desktop Only (re-evaluate this with mobile post button in BottomNav) */}
        {/* If the mobile FAB is used, this desktop-only create post might be redundant or styled differently */}
        <div className="hidden md:block">
          <CreatePost user={user} onPostCreated={handlePostCreated} />
        </div>

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center p-4 text-gray-500 text-sm">
            {getTabDescription()}
          </div>
        )}

        {/* Feed */}
        <div>
          {posts.map(post => (
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

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 md:h-5 md:w-5 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Load More */}
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

      {/* Right Sidebar - Adjusted Visibility and fixed width */}
      {/* Hidden on screens smaller than lg (including md/tablet), block on lg and up */}
      <div className="hidden lg:block w-[20rem] flex-shrink-0">
        <RightSidebar rightSidebarRef={rightSidebarRef} user={user} />
      </div>
    </div>
  );
};

export default Feed;