import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Calendar, Download, QrCode, ChevronLeft, Music, Video, 
  FileText, X, Heart, MessageCircle, Image, ShoppingBag, Gift, 
  Ticket, Coffee, Link, Share2, BookOpen, User, Users, Send, Mic, Paperclip
} from 'lucide-react';

import { useConversationMessages } from '../../hooks/hooks';
import RenderContentCard from './messageRender';

export default function Messages({ user }) {
  const [activeTab, setActiveTab] = useState('dm'); // 'dm', 'files', 'links'
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { recipientId, recipientName, recipientAvatar, content } = location.state || {};

  const { 
    messages, 
    loading, 
    error, 
    hasMore, 
    loadMoreMessages, 
    sendMessage, 
    initializeConversation,
  } = useConversationMessages(user.id, recipientId, user.id);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Initialize conversation automatically (create if new, fetch if exists)
  useEffect(() => {
    if (!recipientId || !user.id) {
      navigate('/feed', { replace: true }); // Only redirect if IDs are missing
      return;
    }
    const ensureConversation = async () => {
      await initializeConversation(); // Let the hook handle create/fetch
    };
    ensureConversation();
  }, [recipientId, user.id, initializeConversation, navigate]);

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (!isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current.scrollTop < 50 && hasMore && !loading) {
        setIsLoadingMore(true);
        loadMoreMessages().finally(() => setIsLoadingMore(false));
      }
    };
    const container = messagesContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMoreMessages]);

  // Send initial message from recipient if content is provided
  useEffect(() => {
    if (!content || messages.length > 0 || loading) return;
    const sendInitialMessage = async () => {
      try {
        await sendMessage(recipientId, content.data?.message || 'Started a conversation', null);
      } catch (err) {
        console.error('Failed to send initial message:', err);
      }
    };
    sendInitialMessage();
  }, [content, messages.length, loading, sendMessage, recipientId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
      await sendMessage(recipientId, messageInput, replyingTo?.message_id);
      setMessageInput('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle key press for sending message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  // Format time with EAT timezone
  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi', // Explicitly set to EAT
    });
  };

  // Back button navigation
  const handleBack = () => {
    if (window.innerWidth <= 1024) navigate('/feed');
  };

  // Avatar fallback
  const getAvatarFallback = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg flex flex-col w-full h-screen">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          {window.innerWidth <= 1024 && (
            <button className="mr-3" onClick={handleBack}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center">
            <div className="relative">
              {recipientAvatar ? (
                <img
                  src={recipientAvatar}
                  alt={`${recipientName}'s avatar`}
                  className="h-9 w-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.style.backgroundColor = '#f87171';
                    e.target.innerText = getAvatarFallback(recipientName);
                  }}
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                  {getAvatarFallback(recipientName)}
                </div>
              )}
            </div>
            <div className="ml-2">
              <span className="font-medium">{recipientName}</span>
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pb-16">
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {loading && messages.length === 0 && (
          <div className="text-center text-gray-500">Loading messages...</div>
        )}
        
        {error && (
          <div className="text-center text-red-500">
            Error: {error}
            <button
              className="ml-2 text-blue-500 underline"
              onClick={() => initializeConversation()}
            >
              Retry
            </button>
          </div>
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
                  <div className="relative">
                    {recipientAvatar ? (
                      <img
                        src={recipientAvatar}
                        alt={`${recipientName}'s avatar`}
                        className="h-8 w-8 rounded-full object-cover mr-2"
                        onError={(e) => {
                          e.target.src = '';
                          e.target.style.backgroundColor = '#f87171';
                          e.target.innerText = getAvatarFallback(recipientName);
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm mr-2">
                        {getAvatarFallback(recipientName)}
                      </div>
                    )}
                  </div>
                )}
                <div className={`max-w-xs md:max-w-md ${message.content_type !== 'text' ? '' : ''}`}>
                  {RenderContentCard(message, recipientName)}
                  <div className={`text-xs ${message.is_current_user ? 'text-red-200 text-right' : 'text-gray-400'} mt-1`}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
                {message.is_current_user && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 ml-2"></div>
                )}
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
        <div ref={messagesEndRef} />
      </div>
      
      {replyingTo && (
        <div className="bg-gray-50 p-2 flex justify-between items-center border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-1 h-4 bg-red-500 rounded-full mr-2"></div>
            <div className="text-sm truncate">
              <span className="text-gray-500">Replying to </span>
              <span className="font-medium">{replyingTo.is_current_user ? 'yourself' : recipientName}</span>
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
      
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10">
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
          />
          <div className="flex items-center space-x-2 ml-2">
            <button className="text-gray-500">
              <Mic size={18} />
            </button>
            <button 
              className={`h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSendMessage}
              disabled={loading}
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