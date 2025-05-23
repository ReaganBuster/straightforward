import { useRef, useEffect } from 'react';
import { Search, Mail } from 'lucide-react';

const ChatsSection = ({
  user,
  selectedChat,
  setSelectedChat,
  activeTab,
  setActiveTab,
  conversations,
  loading,
  handleChatSelect
}) => {
  const chatListRef = useRef(null);

  // Enable independent scrolling
  useEffect(() => {
    const handleScroll = (e) => {
      e.stopPropagation();
    };

    const chatList = chatListRef.current;
    if (chatList) {
      chatList.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatList) {
        chatList.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const filterConversations = () => {
    if (activeTab === 'all') {
      return conversations;
    } else if (activeTab === 'unread') {
      return conversations.filter(chat => chat.unread_count > 0);
    }
    return conversations;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUnreadCount = () => {
    return conversations.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  const filteredConversations = filterConversations();

  return (
    <div 
      ref={chatListRef}
      className={`flex-none w-full lg:w-80 border-r border-gray-200 bg-white overflow-y-auto h-screen ${selectedChat ? 'hidden lg:block' : ''}`}
    >
      {/* Chat List Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-3">
          <h2 className="font-bold text-lg">Messages</h2>
          <div className="flex">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search messages"
                className="pl-7 py-1 pr-2 bg-gray-100 text-sm rounded-full w-36 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 px-2 pb-2">
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-full flex-1 ${activeTab === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-full flex-1 ${activeTab === 'unread' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread {getUnreadCount() > 0 && `(${getUnreadCount()})`}
          </button>
        </div>
      </div>
      
      {/* Chat List */}
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
          <Mail className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm">No conversations found</p>
          <p className="text-xs text-center mt-1">Connect with experts to start a chat</p>
        </div>
      ) : (
        filteredConversations.map((chat) => (
          <div 
            key={chat.id}
            className={`p-3 border-b border-gray-100 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
            onClick={() => handleChatSelect(chat)}
          >
            <div className="flex items-start">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                  <img 
                    src={ "/api/placeholder/40/40"} 
                    alt={'User Avatar'} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* {chat.recipient.online && (
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute right-0 bottom-0 border border-white"></div>
                )} */}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <h4 className={`font-medium text-sm ${chat.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {'user'}
                    </h4>
                    {chat.recipient.verified && (
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center ml-1">
                        <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(chat.last_message_time)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-xs ${chat.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'} truncate max-w-36`}>
                    {chat.last_message}
                  </p>
                  {chat.unread_count > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatsSection;