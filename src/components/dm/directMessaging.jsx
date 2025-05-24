import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Calendar, Download, QrCode, ChevronLeft, Music, Video, 
  FileText, X, Heart, MessageCircle, Image, ShoppingBag, Gift, 
  Ticket, Coffee, Link, Share2, BookOpen, User, Users, Send, Mic, Paperclip,
  AlertCircle, RefreshCw
} from 'lucide-react';

import { useConversationMessages } from '../../hooks/hooks';

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
    dmAccess,
    connectionStatus,
    loadMoreMessages, 
    sendMessage, 
    processPayment,
    requestDmAccess,
    initializeConversation,
    // refreshMessages,
    // addInitialMessage,
    retryConnection,
  } = useConversationMessages(user.id, recipientId, user.id);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Initialize conversation automatically
  useEffect(() => {
    if (!recipientId || !user.id) {
      navigate('/feed', { replace: true });
      return;
    }
  }, [recipientId, user.id, navigate]);

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (!isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMore]);

  // Infinite scroll handler
  useEffect(() => {
  const handleScroll = async () => {
    if (messagesContainerRef.current?.scrollTop < 50 && hasMore && !loading && loadMoreMessages) {
      setIsLoadingMore(true);
      try {
        await loadMoreMessages();
      } catch (error) {
        console.error('Failed to load more messages:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };
  
  const container = messagesContainerRef.current;
  if (container) {
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }
}, [hasMore, loading, loadMoreMessages]);

  // Send initial message from content if provided
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
    
    // Check connection status
    if (connectionStatus !== 'connected') {
      console.error('WebSocket not connected');
      return;
    }

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

  // Handle payment for paid messages
  const handlePayment = async (messageId) => {
    try {
      await processPayment(messageId);
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  // Handle DM access request
  const handleDmAccessRequest = async (amount = null, postId = null) => {
    try {
      await requestDmAccess(recipientId, amount, postId);
    } catch (err) {
      console.error('DM access request failed:', err);
    }
  };

  // Enhanced renderContentCard with payment support
  const renderContentCard = (message) => {
    const isRecipient = !message.is_current_user;
    const baseStyles = `max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
      isRecipient ? 'bg-white text-gray-900' : 'bg-red-500 text-white'
    }`;

    // Handle paid content
    if (message.requires_payment && !message.is_paid) {
      return (
        <div className={`${baseStyles} bg-yellow-50 border border-yellow-200 text-gray-900`}>
          <div className="flex items-center mb-2">
            <Gift size={16} className="text-yellow-500 mr-2" />
            <span className="text-sm font-medium">Paid Message - ${message.payment_amount}</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            This message requires payment to view
          </p>
          <button 
            onClick={() => handlePayment(message.message_id)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm"
          >
            Pay to View - ${message.payment_amount}
          </button>
        </div>
      );
    }

    if (!message.content_type || message.content_type === 'text') {
      return (
        <div className={baseStyles}>
          {message.reply_to_message_id && replyingTo && (
            <div className="flex mb-2">
              <div className="w-1 bg-gray-300 rounded-full mr-2"></div>
              <div className="text-xs text-gray-500 truncate">
                <span className="font-medium">
                  {isRecipient ? recipientName : 'You'}: 
                </span>
                {replyingTo.content || 'Replied to message'}
              </div>
            </div>
          )}
          <div>{message.content || 'No content available'}</div>
        </div>
      );
    }

    switch (message.content_type) {
      case 'article':
        return (
          <div className={`${baseStyles} bg-white text-gray-900`}>
            <div className="border-b border-gray-100 flex justify-between items-center pb-2">
              <div className="flex items-center">
                <FileText size={16} className="text-red-500" />
                <span className="ml-2 font-medium">{message.article_title || 'Untitled Article'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">{message.article_pages || 0} pages</span>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Download size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                <BookOpen size={24} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-700 mb-2">{message.article_preview || 'No preview available'}</p>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm">
                Read Full Report
              </button>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className={`${baseStyles} bg-white text-gray-900`}>
            <div className="border-b border-gray-100 flex justify-between items-center pb-2">
              <div className="flex items-center">
                <Music size={16} className="text-red-500" />
                <span className="ml-2 font-medium">{message.audio_title || 'Untitled Audio'}</span>
              </div>
              <button className="p-1 rounded hover:bg-gray-100">
                <Download size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">No tracks available (stubbed)</p>
            </div>
          </div>
        );
      default:
        return (
          <div className={baseStyles}>
            <p className="text-xs text-gray-500">Unsupported content type: {message.content_type}</p>
            <div>{message.content || 'No content available'}</div>
          </div>
        );
    }
  };

  // Connection status indicator
  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <div className="flex items-center text-yellow-600 text-xs">
            <RefreshCw size={12} className="animate-spin mr-1" />
            Connecting...
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center text-green-600 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Connected
          </div>
        );
      case 'disconnected':
      case 'error':
        return (
          <div className="flex items-center text-red-600 text-xs">
            <AlertCircle size={12} className="mr-1" />
            <span>Disconnected</span>
            <button 
              onClick={retryConnection}
              className="ml-2 text-blue-500 underline hover:text-blue-700"
            >
              Retry
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Format time with EAT timezone
  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    });
  };

  // Back button navigation
  const handleBack = () => {
    if (window.innerWidth <= 1024) navigate('/feed');
  };

  // Avatar fallback
  const getAvatarFallback = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // Check if DMs are restricted and show access request
  const shouldShowDmAccessRequest = dmAccess && !dmAccess.has_access && dmAccess.requires_payment;

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
              <div className="font-medium">{recipientName}</div>
              {renderConnectionStatus()}
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

      {/* DM Access Request Banner */}
      {shouldShowDmAccessRequest && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift size={16} className="text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">
                This user requires payment for DMs - ${dmAccess.required_amount}
              </span>
            </div>
            <button
              onClick={() => handleDmAccessRequest(dmAccess.required_amount)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Pay to Message
            </button>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {loading && messages.length === 0 && (
          <div className="text-center text-gray-500">Loading messages...</div>
        )}
        
        {error && (
          <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle size={16} className="mr-2" />
              Error: {error}
            </div>
            <button
              className="text-blue-500 underline hover:text-blue-700"
              onClick={() => initializeConversation()}
            >
              Retry Connection
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
              <div className={`flex ${message.is_current_user ? 'justify-end' : 'justify-start'} mb-4`}>
                {!message.is_current_user && (
                  <div className="relative mr-2">
                    {recipientAvatar ? (
                      <img
                        src={recipientAvatar}
                        alt={`${recipientName}'s avatar`}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '';
                          e.target.style.backgroundColor = '#f87171';
                          e.target.innerText = getAvatarFallback(recipientName);
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                        {getAvatarFallback(recipientName)}
                      </div>
                    )}
                  </div>
                )}
                <div className="max-w-xs md:max-w-md">
                  {renderContentCard(message)}
                  <div className={`text-xs ${message.is_current_user ? 'text-red-200 text-right' : 'text-gray-400'} mt-1`}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
                {message.is_current_user && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 ml-2 flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
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
        <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-1 h-4 bg-red-500 rounded-full mr-2"></div>
            <div className="text-sm truncate">
              <span className="text-gray-500">Replying to </span>
              <span className="font-medium">{replyingTo.is_current_user ? 'yourself' : recipientName}</span>
              <div className="text-xs text-gray-400 truncate max-w-xs">
                {replyingTo.content}
              </div>
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
            disabled={connectionStatus !== 'connected' || shouldShowDmAccessRequest}
          />
          <div className="flex items-center space-x-2 ml-2">
            <button className="text-gray-500">
              <Mic size={18} />
            </button>
            <button 
              className={`h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center ${
                connectionStatus !== 'connected' || shouldShowDmAccessRequest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
              }`}
              onClick={handleSendMessage}
              disabled={connectionStatus !== 'connected' || shouldShowDmAccessRequest}
            >
              {connectionStatus === 'connecting' ? (
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