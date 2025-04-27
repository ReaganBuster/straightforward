import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Send, ArrowLeft, MoreHorizontal, Image, User, Home, Search, 
  Mail, MessageSquare, DollarSign, Paperclip, Smile, Phone, Video,
  Clock, Star, ChevronRight, Bell, BarChart2, Gift, Settings, ArrowUpRight
} from 'lucide-react';

import { useAuth, useConversations, useWallet } from '../../hooks/hooks';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const messageEndRef = useRef(null);
  const leftSidebarRef = useRef(null);
  const chatListRef = useRef(null);
  const chatDetailRef = useRef(null);
  const rightSidebarRef = useRef(null);
  
  const { user } = useAuth();
  const { 
    conversations, loading, sendMessage, markAsRead, fetchMoreMessages 
  } = useConversations(user?.id);
  const { balance, loading: walletLoading } = useWallet(user?.id);
  
  // Enable independent scrolling for each section
  useEffect(() => {
    const handleScroll = (e) => {
      // Prevent scroll events from bubbling up to parent elements
      e.stopPropagation();
    };
  
    // Cache current ref values inside the effect
    const leftSidebar = leftSidebarRef.current;
    const chatList = chatListRef.current;
    const chatDetail = chatDetailRef.current;
    const rightSidebar = rightSidebarRef.current;
  
    if (leftSidebar) {
      leftSidebar.addEventListener('scroll', handleScroll);
    }
    if (chatList) {
      chatList.addEventListener('scroll', handleScroll);
    }
    if (chatDetail) {
      chatDetail.addEventListener('scroll', handleScroll);
    }
    if (rightSidebar) {
      rightSidebar.addEventListener('scroll', handleScroll);
    }
  
    return () => {
      if (leftSidebar) {
        leftSidebar.removeEventListener('scroll', handleScroll);
      }
      if (chatList) {
        chatList.removeEventListener('scroll', handleScroll);
      }
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
  }, [selectedChat, conversations]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      sendMessage(selectedChat.id, message);
      setMessage('');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (chat.unread_count > 0) {
      markAsRead(chat.id);
    }
  };

  const filterConversations = () => {
    if (activeTab === 'all') {
      return conversations;
    } else if (activeTab === 'unread') {
      return conversations.filter(chat => chat.unread_count > 0);
    } else if (activeTab === 'premium') {
      return conversations.filter(chat => chat.is_premium);
    }
    return conversations;
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

  const getUnreadCount = () => {
    return conversations.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  const filteredConversations = filterConversations();

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* Left Sidebar - Independent Scrolling */}
      <div 
        ref={leftSidebarRef}
        className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-3 overflow-y-auto h-screen sticky top-0"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold py-2 px-3 rounded-lg mb-6">
          PayPadm
        </div>
        
        <nav className="space-y-1 mb-4">
          <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            <span className="font-medium">Home</span>
          </Link>
          <Link to="/transactions" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-medium">Transactions</span>
          </Link>
          <Link to="/chat" className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="font-medium">Messages</span>
            {getUnreadCount() > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{getUnreadCount()}</span>
            )}
          </Link>
          <Link to="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Profile</span>
          </Link>
          <Link to="/analytics" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <BarChart2 className="w-4 h-4 mr-2" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link to="/notifications" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-4 h-4 mr-2" />
            <span className="font-medium">Notifications</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">5</span>
          </Link>
        </nav>
        
        <div className="p-2 bg-gray-50 rounded-lg mb-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Today's Earnings</span>
              <span className="font-medium text-red-600">
                {walletLoading ? '...' : `${balance ? (balance * 0.15).toLocaleString() : 0} UGX`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Messages</span>
              <span className="font-medium text-gray-900">{getUnreadCount()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-green-600">96%</span>
            </div>
          </div>
        </div>
        
        <div className="p-2 bg-red-50 rounded-lg mb-4 border border-red-100">
          <div className="flex items-center text-red-800 mb-1">
            <Gift className="w-4 h-4 mr-1" />
            <h3 className="text-xs font-semibold">Premium Messages</h3>
          </div>
          <p className="text-xs text-red-700 mb-1">Offer premium chat sessions to earn 3x more!</p>
          <button className="w-full bg-red-600 text-white text-xs py-1 px-2 rounded-lg font-medium hover:bg-red-700">
            Enable Premium Chat
          </button>
        </div>
        
        <div className="mt-auto space-y-1 text-xs">
          <Link to="/help" className="flex items-center justify-between text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <ChevronRight size={14} className="mr-2" />
              <span>Help Center</span>
            </div>
          </Link>
          <Link to="/settings" className="flex items-center justify-between text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <Settings size={14} className="mr-2" />
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Chat List - Independent Scrolling */}
      <div 
        ref={chatListRef}
        className={`flex-none w-80 border-r border-gray-200 bg-white overflow-y-auto h-screen ${selectedChat ? 'hidden md:block' : ''}`}
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
                  placeholder="Search"
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
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-full flex-1 ${activeTab === 'premium' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('premium')}
            >
              Premium
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
            <p className="text-xs text-center mt-1">Connect with experts or change your filter</p>
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
                      src={chat.recipient.avatar || "/api/placeholder/40/40"} 
                      alt={chat.recipient.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {chat.recipient.online && (
                    <div className="w-3 h-3 bg-green-500 rounded-full absolute right-0 bottom-0 border border-white"></div>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <h4 className={`font-medium text-sm ${chat.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {chat.recipient.name}
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
                  
                  {chat.is_premium && (
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-1.5 py-0.5 rounded-full">
                        Premium
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {chat.rate_per_message.toLocaleString()} UGX
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Chat Detail - Independent Scrolling */}
      <div 
        ref={chatDetailRef}
        className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedChat ? 'hidden md:flex items-center justify-center' : ''}`}
      >
        {!selectedChat ? (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Select a conversation from the list or start a new one to begin messaging.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header - Sticky */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center">
                <button 
                  className="md:hidden mr-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
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
                {selectedChat.is_premium && (
                  <span className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-full mr-2">
                    Premium
                  </span>
                )}
                
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
              {selectedChat.messages && selectedChat.messages.length > 0 ? (
                <>
                  {/* Load More Button */}
                  {selectedChat.has_more && (
                    <div className="flex justify-center mb-3">
                      <button 
                        className="text-red-600 bg-white border border-red-100 px-3 py-1 rounded-full text-xs font-medium hover:bg-red-50"
                        onClick={() => fetchMoreMessages(selectedChat.id)}
                      >
                        Load earlier messages
                      </button>
                    </div>
                  )}
                  
                  {/* Group messages by date */}
                  {selectedChat.messages.reduce((acc, message, index, array) => {
                    const messageDate = formatDate(message.timestamp);
                    
                    // Add date separator if this is the first message or if the date changes
                    if (index === 0 || formatDate(array[index-1].timestamp) !== messageDate) {
                      acc.push(
                        <div key={`date-${messageDate}`} className="flex justify-center my-3">
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {messageDate}
                          </span>
                        </div>
                      );
                    }
                    
                    // Add the message
                    acc.push(
                      <div 
                        key={message.id}
                        className={`flex ${message.is_from_me ? 'justify-end' : 'justify-start'} mb-2`}
                      >
                        <div 
                          className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                            message.is_from_me 
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-xs mt-1 flex justify-end ${message.is_from_me ? 'text-red-100' : 'text-gray-500'}`}>
                            {formatTime(message.timestamp)}
                            {message.is_from_me && message.read_at && (
                              <span className="ml-1">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                    
                    return acc;
                  }, [])}
                  
                  {/* Premium Message Info */}
                  {selectedChat.is_premium && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 my-3 text-xs text-amber-800">
                      <div className="flex items-center mb-1">
                        <Star size={12} className="mr-1" fill="currentColor" />
                        <span className="font-medium">Premium Chat Session</span>
                      </div>
                      <p>Each message costs {selectedChat.rate_per_message.toLocaleString()} UGX</p>
                    </div>
                  )}
                  
                  <div ref={messageEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="font-medium text-gray-700 mb-1">Start a new conversation</h4>
                  <p className="text-xs text-center max-w-xs">
                    {selectedChat.is_premium 
                      ? `This is a premium chat. You'll be charged ${selectedChat.rate_per_message.toLocaleString()} UGX per message.`
                      : 'Send your first message to start chatting with this expert.'}
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
              
              {selectedChat.is_premium && (
                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                  <span>Premium message - {selectedChat.rate_per_message.toLocaleString()} UGX</span>
                  <span>Balance: {walletLoading ? '...' : `${balance ? balance.toLocaleString() : 0} UGX`}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Right Sidebar - Chat Details - Independent Scrolling (only shown when chat is selected) */}
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
                  <ArrowUpRight size={12} className="mr-1" />
                  <span>Response Time</span>
                </div>
                <span className="font-medium">{selectedChat.recipient.response_time || '~30 min'}</span>
              </div>
            </div>
          </div>
          
          {selectedChat.is_premium && (
            <div className="bg-white rounded-lg mb-3 border border-gray-200 shadow-sm">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900">Premium Chat</h3>
                  <span className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-gray-600">Rate per message</span>
                  <span className="font-medium">{selectedChat.rate_per_message.toLocaleString()} UGX</span>
                </div>
                
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-gray-600">Your earnings</span>
                  <span className="font-medium text-red-600">85%</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-medium text-gray-700">15%</span>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <button className="w-full bg-amber-500 text-white py-1.5 px-3 rounded-lg font-medium hover:bg-amber-600 transition shadow-sm text-xs">
                    Upgrade to Expert
                  </button>
                </div>
              </div>
            </div>
          )}
          
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

export default Messages;