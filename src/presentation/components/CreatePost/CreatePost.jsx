import { useState } from 'react';
import { useFeedPosts } from '@presentation/hooks/useFeedPosts';
import NewPost from '@presentation/components/NewPost/NewPost';
import { Image, Lock, DollarSign } from 'lucide-react';
import { PLACEHOLDER_PICTURE } from '@constants/constants';

export default function CreatePost({ user }) {
  const [setShowPostModal] = useState(false);
  const [expandPostInput, setExpandPostInput] = useState(false);

  const { addPost } = useFeedPosts(user?.user_id);

  const handlePostCreated = newPost => {
    addPost(newPost);
    setShowPostModal(false);
    setExpandPostInput(false);
  };
  return (
    <div className="p-3 border-b border-gray-200">
      {expandPostInput ? (
        <NewPost
          user={user}
          onPostCreated={handlePostCreated}
          onClose={() => setExpandPostInput(false)}
          inFeed={true}
        />
      ) : (
        <div className="flex">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            <img
              src={
                user?.avatar_url || PLACEHOLDER_PICTURE
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Share your insights or ask a question..."
              className="w-full p-2 border-none focus:ring-0 text-gray-700 text-sm"
              onClick={() => setExpandPostInput(true)}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1 text-red-600">
                <button
                  className="p-1 rounded-full hover:bg-red-50"
                  onClick={() => setExpandPostInput(true)}
                >
                  <Image size={16} />
                </button>
                <button
                  className="p-1 rounded-full hover:bg-red-50"
                  onClick={() => setExpandPostInput(true)}
                >
                  <DollarSign size={16} />
                </button>
                <button
                  className="p-1 rounded-full hover:bg-red-50"
                  onClick={() => setExpandPostInput(true)}
                >
                  <Lock size={16} />
                </button>
              </div>
              <button
                onClick={() => setExpandPostInput(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full font-medium text-xs hover:from-red-700 hover:to-red-800 shadow-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
