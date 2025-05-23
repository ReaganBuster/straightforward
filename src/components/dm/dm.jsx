import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Calendar, Download, QrCode, ChevronLeft, Music, Video, 
  FileText, X, Heart, MessageCircle, Image, ShoppingBag, Gift, 
  Ticket, Coffee, Link, Share2, BookOpen, User, Users, Send, Mic, Paperclip
} from 'lucide-react';

import { useConversationMessages } from '../../hooks/hooks';

export default function Messages({ userId, conversationId, creator }) {
  const [activeTab, setActiveTab] = useState('dm'); // 'dm', 'files', 'links'
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageInput, setMessageInput] = useState(''); // State for the input field

  // Use the conversation messages hook
  const { 
    messages, 
    loading, 
    error, 
    hasMore, 
    loadMoreMessages, 
    sendMessage, 
    dmAccess 
  } = useConversationMessages(conversationId, userId);

  // Ref for scrolling to the bottom of the messages
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current.scrollTop === 0 && hasMore && !loading) {
        loadMoreMessages();
      }
    };

    const container = messagesContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMoreMessages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return; // Don't send empty messages

    try {
      await sendMessage(
        creator.user_id, // recipientId
        messageInput,   // content
        replyingTo ? replyingTo.message_id : null // postId (using message_id for replies)
      );
      setMessageInput(''); // Clear the input
      setReplyingTo(null); // Clear the reply state
    } catch (err) {
      console.error('Failed to send message:', err);
      // You might want to show an error to the user here
    }
  };

  // Handle key press for sending message (e.g., Enter key)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to render different content cards based on type
  const renderContentCard = (message) => {
    // Since contentType isn't provided by the hook, we'll assume messages are text-based
    // If the backend supports contentType, we can extend this logic
    if (message.replyTo) {
      return (
        <div>
          {message.replyTo && (
            <div className="flex mb-1">
              <div className="w-1 bg-gray-300 rounded-full mr-2"></div>
              <div className="text-xs text-gray-500 truncate">
                <span className="font-medium">{message.is_current_user ? 'You' : creator.name}: </span>
                {message.replyTo.preview}
              </div>
            </div>
          )}
          <div>
            {message.content}
          </div>
        </div>
      );
    }

    return message.content;
  };

  // Format the created_at timestamp to a time string (e.g., "10:34 AM")
  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-100 rounded-lg overflow-hidden shadow-lg h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <button className="mr-3">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                {creator.avatar}
              </div>
              {creator.online && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
              )}
            </div>
            <div className="ml-2">
              <div className="flex items-center">
                <span className="font-medium">{creator.name}</span>
                {creator.verified && (
                  <span className="ml-1 text-red-500">✓</span>
                )}
              </div>
              <span className="text-xs text-gray-500">Creator • {creator.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500">
            <Link size={18} />
          </button>
          <button className="text-gray-500">
            <User size={18} />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white px-4 py-2 border-b border-gray-200 flex space-x-4">
        <button 
          className={`text-sm font-medium pb-1 px-1 ${activeTab === 'dm' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('dm')}
        >
          Messages
        </button>
        <button 
          className={`text-sm font-medium pb-1 px-1 ${activeTab === 'files' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button 
          className={`text-sm font-medium pb-1 px-1 ${activeTab === 'links' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('links')}
        >
          Links
        </button>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && messages.length === 0 && (
          <div className="text-center text-gray-500">Loading messages...</div>
        )}
        {error && (
          <div className="text-center text-red-500">Error: {error}</div>
        )}
        {messages.map(message => (
          <div key={message.message_id} className="relative group">
            {message.type === 'system' ? (
              <div className="text-center">
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs">
                  {message.content}
                </span>
              </div>  
            ) : (
              <div className={`flex ${message.is_current_user ? 'justify-end' : ''}`}>
                {!message.is_current_user && (
                  <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm mr-2">
                    {creator.avatar}
                  </div>
                )}
                
                <div className={`max-w-xs ${message.contentType ? '' : `${message.is_current_user ? 'bg-red-500 text-white' : 'bg-white'} p-3 rounded-lg shadow-sm`}`}>
                  {renderContentCard({
                    ...message,
                    sender: message.is_current_user ? 'user' : 'creator',
                    time: formatTime(message.created_at),
                    replyTo: message.related_post_id ? {
                      id: message.related_post_id,
                      preview: messages.find(m => m.message_id === message.related_post_id)?.content || 'Message'
                    } : null
                  })}
                  
                  {/* Time stamp */}
                  <div className={`text-xs ${message.is_current_user ? 'text-right' : ''} ${message.is_current_user && !message.contentType ? 'text-red-200' : 'text-gray-400'} mt-1`}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
                
                {message.is_current_user && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 ml-2"></div>
                )}
                
                {/* Hover actions */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white rounded-full shadow hidden group-hover:flex items-center px-1">
                  <button className="p-1 hover:text-red-500">
                    <Heart size={14} />
                  </button>
                  <button 
                    className="p-1 hover:text-red-500"
                    onClick={() => setReplyingTo(message)}
                  >
                    <MessageCircle size={14} />
                  </button>
                  <button className="p-1 hover:text-red-500">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {hasMore && (
          <div className="text-center">
            <button 
              onClick={loadMoreMessages} 
              disabled={loading}
              className="text-red-500 text-sm"
            >
              {loading ? 'Loading...' : 'Load More Messages'}
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Reply banner */}
      {replyingTo && (
        <div className="bg-gray-50 p-2 flex justify-between items-center border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-1 h-4 bg-red-500 rounded-full mr-2"></div>
            <div className="text-sm truncate">
              <span className="text-gray-500">Replying to </span>
              <span className="font-medium">{replyingTo.is_current_user ? 'yourself' : creator.name}</span>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setReplyingTo(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <button className="text-gray-500 mr-2">
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-transparent outline-none text-sm py-1"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !dmAccess?.has_access}
          />
          <div className="flex items-center space-x-2 ml-2">
            <button className="text-gray-500">
              <Mic size={18} />
            </button>
            <button 
              className={`h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center ${loading || !dmAccess?.has_access ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSendMessage}
              disabled={loading || !dmAccess?.has_access}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}