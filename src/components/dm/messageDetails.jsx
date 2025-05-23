import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, MoreHorizontal, Image, Paperclip, Smile, Phone, Video, 
  Clock, Star, MessageSquare, Send, User, Heart, Bell
} from 'lucide-react';
import { useConversationMessages, useWallet } from '../../hooks/hooks';

const MessageDetails = ({ user, selectedChat, setSelectedChat, refreshConversations }) => {
  const [message, setMessage] = useState('');
  const messageEndRef = useRef(null);
  const chatDetailRef = useRef(null);
  const rightSidebarRef = useRef(null);

  const { 
    messages, 
    loading, 
    hasMore, 
    loadMoreMessages, 
    sendMessage, 
    processPayment, 
    dmAccess, 
    requestDmAccess, 
    refreshMessages 
  } = useConversationMessages(selectedChat?.id, user?.id);
  const { balance, loading: walletLoading } = useWallet(user?.id);

  // Enable independent scrolling
  useEffect(() => {
    const handleScroll = (e) => {
      e.stopPropagation();
    };

    const chatDetail = chatDetailRef.current;
    const rightSidebar = rightSidebarRef.current;

    if (chatDetail) {
      chatDetail.addEventListener('scroll', handleScroll);
    }
    if (rightSidebar) {
      rightSidebar.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatDetail) {
        chatDetail.removeEventListener('scroll', handleScroll);
      }
      if (rightSidebar) {
        rightSidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Scroll to bottom of messages when chat changes or new message is sent
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    // Check DM access and request if needed
    if (!dmAccess?.has_access) {
      try {
        await requestDmAccess(selectedChat.recipient.user_id, null, selectedChat.dm_fee);
      } catch (err) {
        console.error('Failed to request DM access:', err);
        return;
      }
    }

    try {
      await sendMessage(selectedChat.recipient.user_id, message);
      setMessage('');
      refreshConversations(); // Refresh the chat list to show the new message
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      ref={chatDetailRef}
      className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedChat ? 'hidden lg:flex items-center justify-center' : ''}`}
    >
      {!selectedChat ? (
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Select a conversation from the list to begin messaging.
          </p>
        </div>
      ) : (
        <>
          {/* Chat Header - Sticky */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center">
              <button 
                className="lg:hidden mr-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                <img 
                  src={selectedChat.recipient.avatar || "/api/placeholder/40/40"} 
                  alt={selectedChat.recipient.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="ml-3">
                <div className="flex items-center">
                  <h4 className="font-semibold text-gray-900">
                    {selectedChat.recipient.name}
                  </h4>
                  {selectedChat.recipient.verified && (
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center ml-1">
                      <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  {selectedChat.recipient.online ? (
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      Online now
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Clock size={10} className="mr-1" />
                      Last seen 5h ago
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                <Phone size={16} />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                <Video size={16} />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages && messages.length > 0 ? (
              <>
                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mb-3">
                    <button 
                      className="text-red-600 bg-white border border-red-100 px-3 py-1 rounded-full text-xs font-medium hover:bg-red-50"
                      onClick={loadMoreMessages}
                    >
                      Load earlier messages
                    </button>
                  </div>
                )}
                
                {/* Group messages by date */}
                {messages.reduce((acc, message, index, array) => {
                  const messageDate = formatDate(message.created_at);
                  
                  if (index === 0 || formatDate(array[index-1].created_at) !== messageDate) {
                    acc.push(
                      <div key={`date-${messageDate}`} className="flex justify-center my-3">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {messageDate}
                        </span>
                      </div>
                    );
                  }
                  
                  acc.push(
                    <div 
                      key={message.message_id}
                      className={`flex ${message.is_current_user ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          message.is_current_user 
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`text-xs mt-1 flex justify-end ${message.is_current_user ? 'text-red-100' : 'text-gray-500'}`}>
                          {formatTime(message.created_at)}
                          {message.is_current_user && message.is_read && (
                            <span className="ml-1">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  
                  return acc;
                }, [])}
                
                <div ref={messageEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-700 mb-1">Start a new conversation</h4>
                <p className="text-xs text-center max-w-xs">
                  Send your first message to start chatting with this expert.
                </p>
              </div>
            )}
          </div>
          
          {/* Message Input - Sticky */}
          <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <button type="button" className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                <Paperclip size={18} />
              </button>
              <button type="button" className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                <Image size={18} />
              </button>
              <div className="flex-1 mx-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full p-2 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                />
              </div>
              <button type="button" className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 mr-1">
                <Smile size={18} />
              </button>
              <button 
                type="submit" 
                disabled={!message.trim()}
                className={`p-2 rounded-full ${
                  message.trim() 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Send size={18} />
              </button>
            </form>
            
            {selectedChat.dm_fee > 0 && (
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                <span>Message fee - {selectedChat.dm_fee.toLocaleString()} UGX</span>
                <span>Balance: {walletLoading ? '...' : `${balance ? balance.toLocaleString() : 0} UGX`}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Right Sidebar - Chat Details (Desktop Only) */}
      {selectedChat && (
        <div 
          ref={rightSidebarRef}
          className="hidden lg:flex flex-col w-64 p-3 overflow-y-auto h-screen sticky top-0 bg-white border-l border-gray-200"
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-100 mx-auto">
              <img 
                src={selectedChat.recipient.avatar || "/api/placeholder/64/64"} 
                alt={selectedChat.recipient.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold mt-2">{selectedChat.recipient.name}</h3>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span className="flex items-center">
                {selectedChat.recipient.online ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                    Online
                  </>
                ) : (
                  <>
                    <Clock size={10} className="mr-1" />
                    Last seen 5h ago
                  </>
                )}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between mb-4">
            <button className="flex-1 flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg mr-1 hover:bg-gray-50">
              <Phone size={16} className="text-red-600 mb-1" />
              <span className="text-xs">Call</span>
            </button>
            <button className="flex-1 flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg ml-1 hover:bg-gray-50">
              <Video size={16} className="text-red-600 mb-1" />
              <span className="text-xs">Video</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg mb-3 border border-gray-200 shadow-sm">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-900 mb-1">About</h3>
              <p className="text-xs text-gray-600">
                {selectedChat.recipient.bio || 'Expert in financial advice and mobile money solutions.'}
              </p>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center text-gray-600">
                  <Star size={12} className="mr-1" fill="#FFC107" />
                  <span>Rating</span>
                </div>
                <span className="font-medium">{selectedChat.recipient.rating || '4.8'}/5</span>
              </div>
              
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center text-gray-600">
                  <MessageSquare size={12} className="mr-1" />
                  <span>Response Rate</span>
                </div>
                <span className="font-medium text-green-600">{selectedChat.recipient.response_rate || '96%'}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-600">
                  <Clock size={12} className="mr-1" />
                  <span>Response Time</span>
                </div>
                <span className="font-medium">{selectedChat.recipient.avg_response_time || '~30 min'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg mb-3 border border-gray-200 shadow-sm">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-900">Media & Files</h3>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <img src="/api/placeholder/80/80" className="w-full h-full object-cover" alt="Shared media" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <img src="/api/placeholder/80/80" className="w-full h-full object-cover" alt="Shared media" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                  <img src="/api/placeholder/80/80" className="w-full h-full object-cover opacity-70" alt="Shared media" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white font-medium text-xs">
                    +12 more
                  </div>
                </div>
              </div>
              
              <button className="w-full text-red-600 text-xs py-1">
                View All Media
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg mb-3 border border-gray-200 shadow-sm">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-900">Actions</h3>
            </div>
            
            <div className="p-2">
              <button className="w-full text-left px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs flex items-center">
                <User size={14} className="mr-2" />
                View Profile
              </button>
              <button className="w-full text-left px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs flex items-center">
                <Heart size={14} className="mr-2" />
                Add to Favorites
              </button>
              <button className="w-full text-left px-2 py-1.5 text-gray-700 hover:bg-gray-50 rounded text-xs flex items-center">
                <Bell size={14} className="mr-2" />
                Mute Notifications
              </button>
              <button className="w-full text-left px-2 py-1.5 text-gray-500 hover:bg-gray-50 rounded text-xs flex items-center">
                <MoreHorizontal size={14} className="mr-2" />
                More Options
              </button>
            </div>
          </div>
          
          <div className="mt-auto">
            <button className="w-full bg-red-50 text-red-600 border border-red-100 py-1.5 px-3 rounded-lg font-medium hover:bg-red-100 transition text-xs">
              Report User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDetails;