import { useState, useEffect } from 'react';
import { MessageSquare, Send, Image, Mic, Clock, Lock, Sparkles, X, Heart, Award, ArrowLeft } from 'lucide-react';

export default function DMPortal() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', content: "You've entered Luna's World. Speak with kindness, leave with sparks.", timestamp: new Date().toISOString() },
    { id: 2, sender: 'luna', content: "I noticed you've been following my journey. What sparked your curiosity?", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('❤️ Flirt & See Where it Goes');
  const [showVibes, setShowVibes] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [blurredContent, setBlurredContent] = useState(true);
  
  // Simulate portal opening animation
  useEffect(() => {
    setTimeout(() => {
      setPortalOpen(true);
    }, 500);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'user',
        content: newMessage,
        timestamp: new Date().toISOString()
      }]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const vibes = ['Curious', 'Impressed', 'Turned On', 'Annoyed', 'Comforted'];

  return (
    <div className={`flex flex-col h-screen bg-gray-900 transition-all duration-700 ${portalOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-red-900 text-white border-b border-red-700">
        <ArrowLeft className="mr-3 cursor-pointer" size={20} />
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">
              <img src="/api/placeholder/40/40" alt="Luna" className="objectatever" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-red-900"></div>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <div className="font-bold">Luna Mystique</div>
            <div className="text-xs text-red-300 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
              Online now
            </div>
          </div>
        </div>
        <div className="flex ml-auto">
          <div className="px-2 py-1 rounded-full bg-red-700 text-xs flex items-center">
            <Sparkles size={12} className="mr-1 text-yellow-300" />
            <span className="text-red-100">{messageType}</span>
          </div>
        </div>
      </div>

      {/* Message Area with Portal Effect */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-red-950 to-gray-900">
        <div className={`transition-all duration-1000 ${portalOpen ? 'scale-100' : 'scale-90'}`}>
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
                message.sender === 'system' 
                  ? 'bg-red-900 text-red-100 border border-red-700 mx-auto text-center italic' 
                  : message.sender === 'user'
                    ? 'bg-red-800 text-white' 
                    : 'bg-gray-800 text-white'
              }`}>
                <div className="text-sm">{message.content}</div>
                <div className="text-xs text-gray-400 mt-1 flex justify-between items-center">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender !== 'system' && (
                    <Lock size={10} className="ml-1 opacity-50" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Blurred Mystery Content */}
        {blurredContent && (
          <div className="my-6 flex justify-center">
            <div className="relative">
              <div className="w-48 h-32 bg-red-800 rounded-lg filter blur-sm flex items-center justify-center overflow-hidden">
                <img src="/api/placeholder/192/128" alt="Mystery content" className="object-cover opacity-30" />
              </div>
              <div 
                onClick={() => setBlurredContent(false)}
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              >
                <Lock className="text-red-300 mb-2" size={24} />
                <div className="px-3 py-1 bg-red-600 rounded-full text-white text-xs font-bold">
                  Unlock Mystery Content
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vibe Reactions */}
        {showVibes && (
          <div className="flex justify-center my-4 bg-gray-800 rounded-full p-2 shadow-lg">
            {vibes.map((vibe) => (
              <div 
                key={vibe} 
                className="mx-2 px-3 py-1 bg-red-900 rounded-full text-white text-xs cursor-pointer hover:bg-red-700 transition-colors"
                onClick={() => setShowVibes(false)}
              >
                {vibe}
              </div>
            ))}
            <div 
              className="mx-2 px-3 py-1 bg-gray-700 rounded-full text-white text-xs cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => setShowVibes(false)}
            >
              <X size={12} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gray-900 border-t border-red-900 p-4">
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full text-red-400 hover:bg-red-900 transition-colors mr-2"
            onClick={() => setShowVibes(!showVibes)}
          >
            <Heart size={20} />
          </button>
          <button className="p-2 rounded-full text-red-400 hover:bg-red-900 transition-colors mr-2">
            <Image size={20} />
          </button>
          <button className="p-2 rounded-full text-red-400 hover:bg-red-900 transition-colors mr-2">
            <Mic size={20} />
          </button>
          <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-transparent text-white w-full focus:outline-none"
              placeholder="Type your message..."
            />
          </div>
          <button 
            onClick={sendMessage}
            className="ml-2 p-3 rounded-full bg-red-700 text-white hover:bg-red-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Message Type Selector */}
        <div className="flex mt-3 overflow-x-auto no-scrollbar">
          {['💬 Just Curious', '❤️ Flirt & See Where it Goes', '💼 Business Proposal', '🧠 Pick Your Brain', '🤫 Private Confession'].map((type) => (
            <div 
              key={type}
              onClick={() => setMessageType(type)}
              className={`mr-2 px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                messageType === type ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-300'
              }`}
            >
              {type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}