import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Calendar, Download, QrCode, ChevronLeft, Music, Video, 
  FileText, X, Heart, MessageCircle, Image, ShoppingBag, Gift, Mic,
  Ticket, Coffee, Link, Share2, BookOpen, User, Users, Send, Paperclip,
  MoreVertical, Smile, Plus
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useConversationMessages } from '../../hooks/hooks';
import RenderContentCard from './messageRender';

export default function Messages({ user, onlineUsers }) {
  const [activeTab, setActiveTab] = useState('dm');
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  const location = useLocation();
  const { recipientId, recipientName, recipientAvatar, content } = location.state || {};
  const navigate = useNavigate();
  const onlineStatus = onlineUsers.has(recipientId);

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
  // const fileInputRef = useRef(null);
  const previousScrollHeight = useRef(0);

  useEffect(() => {
    if (!recipientId || !user.id) {
      navigate('/feed', { replace: true });
      return;
    }
    const ensureConversation = async () => {
      await initializeConversation();
    };
    ensureConversation();
  }, [recipientId, user.id, initializeConversation, navigate]);

  useEffect(() => {
    if (!isLoadingMore && shouldScrollToBottom && messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMore, shouldScrollToBottom]);

  useEffect(() => {
    const handleScroll = () => {
      const container = messagesContainerRef.current;
      if (!container) return;

      // Check if user is near the bottom (within 100px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);

      // Load more messages when scrolling to top
      if (container.scrollTop < 50 && hasMore && !loading && !isLoadingMore) {
        setIsLoadingMore(true);
        previousScrollHeight.current = container.scrollHeight;
        loadMoreMessages().finally(() => {
          setIsLoadingMore(false);
          // Maintain scroll position after loading
          setTimeout(() => {
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - previousScrollHeight.current;
            container.scrollTop = container.scrollTop + scrollDifference;
          }, 50);
        });
      }
    };

    const container = messagesContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMoreMessages, isLoadingMore]);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowMoreMenu(false);
        setShowEmojiPicker(false);
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    setIsTyping(true);
    setShouldScrollToBottom(true);
    try {
      await sendMessage(recipientId, messageInput, replyingTo?.message_id);
      setMessageInput('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'audio':
        input.accept = 'audio/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt';
        break;
      default:
        input.accept = '*/*';
    }
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Handle file upload logic here
        console.log('Selected file:', file);
        // You can integrate with your file upload service here
      }
    };
    
    input.click();
    setShowAttachmentMenu(false);
  };

  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    });
  };

  const handleBack = () => {
    if (window.innerWidth <= 1024) navigate('/chat', { replace: true });
  };

  const getAvatarFallback = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const onEmojiClick = (emojiObject) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const attachmentOptions = [
    { icon: Image, label: 'Photo', type: 'image', color: 'text-green-500' },
    { icon: Video, label: 'Video', type: 'video', color: 'text-blue-500' },
    { icon: Mic, label: 'Audio', type: 'audio', color: 'text-purple-500' },
    { icon: FileText, label: 'Document', type: 'document', color: 'text-orange-500' },
  ];

  return (
    <div className="bg-white flex flex-col w-full h-screen relative overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white p-4 border-b border-red-100 flex justify-between items-center relative z-30 shadow-sm flex-shrink-0">
        <div className="flex items-center">
          {window.innerWidth <= 1024 && (
            <button 
              className="mr-3 p-2 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110" 
              onClick={handleBack}
            >
              <ChevronLeft size={20} className="text-red-600" />
            </button>
          )}
          <div className="flex items-center">
            <div className="relative">
              {recipientAvatar ? (
                <img
                  src={recipientAvatar}
                  alt={`${recipientName}'s avatar`}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-red-200 shadow-lg transition-transform duration-200 hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-red-200">
                  {getAvatarFallback(recipientName)}
                </div>
              )}
              <div 
                className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-red-200 absolute top-0 left-0"
                style={{ display: 'none' }}
              >
                {getAvatarFallback(recipientName)}
              </div>
              {onlineStatus && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800 text-lg">{recipientName}</h3>
              {onlineStatus && (
                <p className="text-xs text-green-500 font-medium">Online</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 relative dropdown-container">
          <button 
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
          >
            <MoreVertical size={18} />
          </button>
          {showMoreMenu && (
            <div className="absolute top-12 right-0 w-40 bg-white border border-red-100 rounded-xl shadow-xl z-40 overflow-hidden">
              {[
                { id: 'dm', label: 'Messages' },
                { id: 'files', label: 'Files' },
                { id: 'links', label: 'Links' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full text-left px-4 py-3 text-sm ${
                    activeTab === tab.id
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:bg-red-50 hover:text-red-500'
                  } transition-all duration-200 border-b border-red-50 last:border-b-0`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMoreMenu(false);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 bg-white"
        style={{ 
          height: 'calc(100vh - 140px)', // Account for header and input area
          overscrollBehavior: 'contain'
        }}
      >
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        
        {loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 md:h-5 md:w-5 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500 text-sm">Loading messages...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-red-600 mb-2">Error: {error}</p>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                onClick={() => initializeConversation()}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {[...messages].map((message, index) => (
          <div 
            key={message.message_id} 
            className={`relative group animate-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: `${index * 50}ms` }}
            onMouseEnter={() => setHoveredMessage(message.message_id)}
            onMouseLeave={() => setHoveredMessage(null)}
          >
            {message.type === 'system' ? (
              <div className="text-center py-2">
                <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-xs font-medium shadow-sm">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={`flex items-end space-x-2 ${message.is_current_user ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`max-w-xs md:max-w-md relative ${message.is_current_user ? 'ml-auto' : ''}`}>
                  {RenderContentCard ? RenderContentCard(message, recipientName) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  
                  {message.reply_to && (
                    <div className={`text-xs opacity-75 mb-2 p-2 rounded-lg ${
                      message.is_current_user ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="font-medium">Replying to message</span>
                    </div>
                  )}
                  
                  <div className={`flex items-center mt-1 space-x-2 ${message.is_current_user ? 'justify-end' : ''}`}>
                    <span className={`text-xs ${message.is_current_user ? 'text-red-200' : 'text-gray-400'}`}>
                      {formatTime(message.created_at)}
                    </span>
                    {message.is_current_user && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-red-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-red-300 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`absolute ${message.is_current_user ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 ${
                  hoveredMessage === message.message_id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } transition-all duration-200`}>
                  <button 
                    className="bg-white rounded-full shadow-lg border border-red-100 p-2 hover:bg-red-50 transition-colors duration-200"
                    onClick={() => setReplyingTo(message)}
                  >
                    <MessageCircle size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-end space-x-2 animate-in slide-in-from-bottom-2 duration-300">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
              {getAvatarFallback(recipientName)}
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-red-50">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Reply Preview - Fixed above input */}
      {replyingTo && (
        <div className="bg-red-50 p-3 mx-4 rounded-xl border border-red-100 animate-in slide-in-from-bottom-2 duration-300 flex-shrink-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-600 rounded-full"></div>
              <div>
                <p className="text-xs text-red-600 font-medium">Replying to</p>
                <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                  {replyingTo.is_current_user ? 'yourself' : recipientName}
                </p>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-100 rounded-full transition-all duration-200"
              onClick={() => setReplyingTo(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Input Area - Fixed at bottom */}
      <div className="p-4 bg-white border-t border-red-100 flex-shrink-0 z-30 relative">
        {/* Emoji Picker - positioned above input */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 right-4 mb-2 z-40 flex justify-center">
            <div className="bg-white rounded-xl shadow-2xl border border-red-100 overflow-hidden max-w-sm w-full">
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                width="100%"
                height={300}
                searchDisabled={window.innerWidth < 640}
                skinTonesDisabled={window.innerWidth < 640}
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        )}
        
        {/* Attachment Menu - positioned above input */}
        {showAttachmentMenu && (
          <div className="absolute bottom-full left-4 mb-2 z-40">
            <div className="bg-white rounded-xl shadow-xl border border-red-100 p-2 grid grid-cols-2 gap-2 w-48">
              {attachmentOptions.map((option) => (
                <button
                  key={option.type}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-red-50 transition-all duration-200 group"
                  onClick={() => handleFileUpload(option.type)}
                >
                  <option.icon size={20} className={`${option.color} group-hover:scale-110 transition-transform duration-200`} />
                  <span className="text-xs text-gray-600 mt-1 font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-end bg-gray-50 rounded-2xl p-3 shadow-inner border border-red-100 space-x-3 dropdown-container">
          <button 
            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
            }}
          >
            <Paperclip size={18} />
          </button>
          
          <div className="flex-1 min-h-0 relative">
            <textarea
              placeholder="Type your message..." 
              className="w-full bg-transparent outline-none text-sm py-2 px-2 resize-none min-h-[2.5rem] max-h-32 leading-relaxed"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '2.5rem'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button 
              className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachmentMenu(false);
              }}
            >
              <Smile size={18} />
            </button>
            <button 
              className={`h-10 w-10 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                loading || !messageInput.trim() ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:from-red-600 hover:to-rose-700'
              }`}
              onClick={handleSendMessage}
              disabled={loading || !messageInput.trim()}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send size={16} className="translate-x-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}