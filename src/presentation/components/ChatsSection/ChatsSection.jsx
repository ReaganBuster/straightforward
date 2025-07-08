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
import RightSidebar from '@presentation/components/RightSidebar/RightSidebar';

const ChatsSection = ({ conversations, loading }) => {
  const chatListRef = useRef(null);
  const [setHoveredChat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = e => e.stopPropagation();
    const chatList = chatListRef.current;
    chatList?.addEventListener('scroll', handleScroll);
    return () => chatList?.removeEventListener('scroll', handleScroll);
  }, []);

  const getAvatarFallback = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return 'No messages yet';
    return message.length > maxLength
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMessageStatus = () => {
    const statuses = ['sent', 'delivered', 'read'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const renderMessageStatus = status => {
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

  const handleChatClick = chat => {
    const recipient = chat.other_user;
    navigate(`/m/${recipient.user_id}`, {
      state: {
        recipientId: recipient.user_id,
        recipientName: recipient.name || recipient.username,
        recipientAvatar: recipient.avatar_url,
        content: null,
        rate: chat.dm_fee || 0,
      },
    });
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Chat List Section */}
      <div
        ref={chatListRef}
        className="w-full md:w-[calc(100%-20rem)] border-l border-r border-gray-200 bg-white overflow-y-auto min-h-screen pb-[60px] md:pb-0 shadow-sm"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-red-100">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Your avatar" className="object-cover w-full h-full" />
              ) : (
                <div className="bg-gray-100 text-gray-700 font-bold flex items-center justify-center w-full h-full">
                  {getAvatarFallback(user?.name || user?.username)}
                </div>
              )}
            </div> */}
            <div>
              <h1 className="font-bold text-xl text-gray-900">Chats</h1>
              <button className="px-3 py-1.5 font-medium text-xs rounded-full bg-red-50 text-red-600">
                {conversations.length} conversation
                {conversations.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Chat List */}
        <div className="bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 md:h-5 md:w-5 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-500 text-sm">Loading chats...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No chats yet
              </h3>
              <p className="text-sm text-center text-gray-500 max-w-xs">
                Start a conversation with experts to see your chats here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map(chat => {
                const otherUser = chat.other_user;
                const hasUnread = Math.random() > 0.7;
                const unreadCount = hasUnread
                  ? Math.floor(Math.random() * 5) + 1
                  : 0;
                const isPinned = Math.random() > 0.8;
                const isMuted = Math.random() > 0.9;
                const messageStatus = getMessageStatus();

                return (
                  <div
                    key={chat.conversation_id}
                    onClick={() => handleChatClick(chat)}
                    onMouseEnter={() => setHoveredChat(chat.conversation_id)}
                    onMouseLeave={() => setHoveredChat(null)}
                    className={`cursor-pointer px-4 py-3 hover:bg-gray-50 ${isPinned ? 'bg-gray-50' : ''}`}
                  >
                    {isPinned && (
                      <div className="absolute top-2 left-2">
                        <Pin size={12} className="text-gray-400 fill-current" />
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {otherUser?.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            alt={`${otherUser.name || otherUser.username}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm">
                            {getAvatarFallback(
                              otherUser?.name || otherUser?.username
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherUser?.name ||
                                otherUser?.username ||
                                'Unknown User'}
                            </h3>
                            {otherUser?.verified && (
                              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <Check size={10} className="text-white" />
                              </div>
                            )}
                            {isMuted && (
                              <VolumeX size={14} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span
                              className={`${hasUnread ? 'text-red-500 font-medium' : 'text-gray-500'}`}
                            >
                              {formatTime(chat.updated_at)}
                            </span>
                            {renderMessageStatus(messageStatus)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p
                            className={`text-sm truncate pr-2 ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                          >
                            {truncateMessage(
                              chat.last_message || 'Start a conversation...'
                            )}
                          </p>
                          {hasUnread && unreadCount > 0 && (
                            <div className="bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-medium">
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
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block flex-1 bg-gray-50 h-full overflow-y-auto">
        <RightSidebar />
      </div>
    </div>
  );
};

export default ChatsSection;
