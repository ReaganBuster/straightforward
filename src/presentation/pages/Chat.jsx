import { useState } from 'react';
import { useConversations } from '@presentation/hooks/useConversations';
import {useAuth } from '@presentation/hooks/useAuth';
import ChatsSection from '@presentation/components/ChatsSection/ChatsSection';

const Chat = (user) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const { conversations, loading } = useConversations(user?.user_id);

  const handleChatSelect = chat => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <ChatsSection
        // user={user}
        // selectedChat={selectedChat}
        // setSelectedChat={setSelectedChat}
        // activeTab={activeTab}
        // setActiveTab={setActiveTab}
        conversations={conversations}
        loading={loading}
        // handleChatSelect={handleChatSelect}
      />
    </div>
  );
};

export default Chat;
