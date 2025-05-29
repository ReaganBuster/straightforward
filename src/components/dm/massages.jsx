import { useState } from 'react';
import { useAuth, useConversations } from '../../hooks/hooks';
import ChatsSection from '../dm/chatsSection';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const { user } = useAuth();
  const { conversations, loading, } = useConversations(user?.id);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <ChatsSection
        user={user}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conversations={conversations}
        loading={loading}
        handleChatSelect={handleChatSelect}
      />
     
    </div>
  );
};

export default Messages;