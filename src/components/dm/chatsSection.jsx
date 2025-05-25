import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Check,
  CheckCheck,
  Pin,
  MoreVertical,
  VolumeX,
} from 'lucide-react';

const Chats = ({ user, conversations, loading }) => {
  const chatListRef = useRef(null);
  const [hoveredChat, setHoveredChat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = (e) => e.stopPropagation();
    const chatList = chatListRef.current;
    chatList?.addEventListener('scroll', handleScroll);
    return () => chatList?.removeEventListener('scroll', handleScroll);
  }, []);

  const getAvatarFallback = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return 'No messages yet';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMessageStatus = () => {
    const statuses = ['sent', 'delivered', 'read'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={16} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={16} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const handlePostClick = (chat) => {
    const recipient = chat.other_user;
    navigate(`/m/${recipient.id}`, {
      state: {
        recipientId: recipient.id,
        recipientName: recipient.name || recipient.username,
        recipientAvatar: recipient.avatar_url,
        content: null,
        rate: chat.dm_fee || 0,
      },
    });
  };

  return (
    <div
      ref={chatListRef}
      className="flex-none w-full lg:w-80 border-r border-gray-100 bg-white overflow-y-auto h-screen"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-red-100">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Your avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-sm">
                    {getAvatarFallback(user?.name || user?.username)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-red-600 font-semibold text-lg">Chats</h1>
              <p className="text-red-500 text-xs">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading chats...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">No chats yet</h3>
            <p className="text-sm text-center text-gray-500 max-w-xs">
              Start a conversation with experts to see your chats here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversations.map((chat) => {
              const otherUser = chat.other_user;
              const hasUnread = Math.random() > 0.7;
              const unreadCount = hasUnread ? Math.floor(Math.random() * 5) + 1 : 0;
              const isPinned = Math.random() > 0.8;
              const isMuted = Math.random() > 0.9;
              const messageStatus = getMessageStatus();

              return (
                <div
                  key={chat.conversation_id}
                  className={`relative cursor-pointer hover:bg-gray-50 px-4 py-3 ${
                    isPinned ? 'bg-gray-25' : ''
                  }`}
                  onClick={() => handlePostClick(chat)}
                  onMouseEnter={() => setHoveredChat(chat.conversation_id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  {isPinned && (
                    <div className="absolute top-2 left-2 z-10">
                      <Pin size={12} className="text-gray-400 fill-current" />
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
                        {otherUser?.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            alt={`${otherUser.name || otherUser.username}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                            {getAvatarFallback(otherUser?.name || otherUser?.username)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 truncate">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.name || otherUser?.username || 'Unknown User'}
                          </h3>
                          {otherUser?.verified && (
                            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                          {isMuted && <VolumeX size={14} className="text-gray-400" />}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${hasUnread ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            {formatTime(chat.updated_at)}
                          </span>
                          {renderMessageStatus(messageStatus)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate pr-2 ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {truncateMessage(chat.last_message || 'Start a conversation...')}
                        </p>
                        {hasUnread && unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-medium">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Chat FAB */}
      <div className="absolute bottom-6 right-6">
        <button className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center">
          <MessageCircle size={24} />
        </button>
      </div>
    </div>
  );
};

export default Chats;
