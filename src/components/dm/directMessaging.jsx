import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, X, MessageCircle, Send, Paperclip,
  MoreVertical, Smile, Mic, Plus, Camera, Image, 
  FileText, MapPin, Music, Gift
} from 'lucide-react';
import { useConversationMessages, useIsUserOnline } from '../../hooks/hooks';
import RenderContentCard from './messageRender';

export default function Messages({ user }) {
  const [activeTab, setActiveTab] = useState('dm');
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
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

  const isRecipientOnline = useIsUserOnline(recipientId);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!recipientId || !user.id) {
      navigate('/feed', { replace: true });
      return;
    }
    initializeConversation();
  }, [recipientId, user.id, initializeConversation, navigate]);

  useEffect(() => {
    if (!isLoadingMore && messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMore]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current.scrollTop < 50 && hasMore && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      loadMoreMessages().finally(() => setIsLoadingMore(false));
    }
  }, [hasMore, loading, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!content || messages.some(m => m.content === content.data?.message) || loading) return;
    const sendInitialMessage = async () => {
      try {
        await sendMessage(recipientId, content.data?.message || 'Started a conversation', null);
      } catch (err) {
        console.error('Failed to send initial message:', err);
      }
    };
    sendInitialMessage();
  }, [content, messages, loading, sendMessage, recipientId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
      await sendMessage(recipientId, messageInput, replyingTo?.message_id);
      setMessageInput('');
      setReplyingTo(null);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    });
  };

  const handleBack = () => {
    if (window.innerWidth <= 1024) navigate('/feed');
  };

  const getAvatarFallback = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const quickActions = [
    { icon: Camera, label: 'Camera', color: 'text-red-500' },
    { icon: Image, label: 'Gallery', color: 'text-red-600' },
    { icon: FileText, label: 'Document', color: 'text-red-500' },
    { icon: MapPin, label: 'Location', color: 'text-red-600' },
    { icon: Music, label: 'Audio', color: 'text-red-500' },
    { icon: Gift, label: 'Gift', color: 'text-red-600' }
  ];

  return (
    <div className="bg-white rounded-lg overflow-hidden flex flex-col w-full h-screen border border-gray-200">
      {/* Clean Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {window.innerWidth <= 1024 && (
              <button 
                onClick={handleBack}
                className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="relative">
              <img
                src={recipientAvatar || ''}
                alt={`${recipientName}'s avatar`}
                className="h-10 w-10 rounded-full object-cover border-2 border-red-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold hidden absolute top-0 left-0"
                style={{ display: 'none' }}
              >
                {getAvatarFallback(recipientName)}
              </div>
              {isRecipientOnline && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{recipientName}</h3>
              <p className="text-sm text-gray-500">
                {isRecipientOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
          <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Simple Tabs */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-6">
          {[
            { key: 'dm', label: 'Messages', count: messages.length },
            { key: 'files', label: 'Media', count: 12 },
            { key: 'links', label: 'Links', count: 5 }
          ].map(tab => (
            <button
              key={tab.key}
              className={`text-sm font-medium pb-2 px-1 transition-colors ${
                activeTab === tab.key 
                  ? 'text-red-500 border-b-2 border-red-500' 
                  : 'text-gray-500 hover:text-red-400'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Clean Messages Area */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-red-200 border-t-red-500 rounded-full"></div>
          </div>
        )}
        
        {loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-red-200 border-t-red-500 rounded-full"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
            <div className="p-3 bg-red-50 rounded-full">
              <X className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Connection Error</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                onClick={() => initializeConversation()}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div 
              key={message.message_id} 
              className="group"
              onMouseEnter={() => setHoveredMessage(message.message_id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {message.type === 'system' ? (
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                    {message.content}
                  </span>
                </div>
              ) : (
                <div className={`flex ${message.is_current_user ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-xs md:max-w-md relative">
                    <div
                      className={`p-3 rounded-2xl ${
                        message.is_current_user
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {RenderContentCard(message, recipientName)}
                    </div>
                    
                    {/* Simple timestamp */}
                    <div className={`text-xs mt-1 ${
                      message.is_current_user ? 'text-red-400 text-right' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </div>
                    
                    {/* Reply button only */}
                    {hoveredMessage === message.message_id && (
                      <div className={`absolute ${message.is_current_user ? '-left-12' : '-right-12'} top-1/2 -translate-y-1/2`}>
                        <button 
                          className="p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                          onClick={() => setReplyingTo(message)}
                          title="Reply"
                        >
                          <MessageCircle size={16} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Simple Reply Indicator */}
      {replyingTo && (
        <div className="bg-gray-50 p-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Replying to {replyingTo.is_current_user ? 'yourself' : recipientName}
                </p>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <button 
              className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
              onClick={() => setReplyingTo(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Clean Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors min-w-0 flex-shrink-0"
                >
                  <action.icon size={20} className={action.color} />
                  <span className="text-xs text-gray-600 mt-1">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <button
            className={`p-2 rounded-full transition-colors ${
              showQuickActions 
                ? 'bg-red-500 text-white rotate-45' 
                : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <Plus size={20} />
          </button>
          
          <div className="flex-1">
            <div className="flex items-end bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-red-300">
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Paperclip size={18} />
              </button>
              
              <textarea
                ref={inputRef}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none resize-none text-gray-800 placeholder-gray-500 py-2 max-h-32 min-h-[40px]"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              
              <div className="flex items-center space-x-1 p-2">
                <button 
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={18} />
                </button>
                <button 
                  className={`text-gray-400 hover:text-red-500 transition-colors ${
                    isRecording ? 'text-red-500' : ''
                  }`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <button 
            className={`p-2 rounded-full transition-all ${
              messageInput.trim() 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || loading}
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}