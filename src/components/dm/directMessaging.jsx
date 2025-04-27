import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Lock, CreditCard, AlertCircle, ArrowLeft, Star } from 'lucide-react';
import { supabase } from '../../services/supabase';

const DirectMessages = ({ user, onBack, postId = null }) => {
  const location = useLocation();
  const { recipientId, recipientName, rate } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessStatus, setAccessStatus] = useState('loading'); // 'loading', 'granted', 'pay-required'
  const [dmFee, setDmFee] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  // Ensure we have consistent user ID
  const currentUserId = user.user_id || user.id;
  
  // Fetch recipient data and access information
  useEffect(() => {
    const fetchRecipientAndAccess = async () => {
      if (!recipientId || !currentUserId) {
        setError('Invalid user information');
        setIsLoading(false);
        return;
      }
      
      try {
        // Get recipient info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', recipientId)
          .single();
          
        if (userError) throw userError;
        setRecipient(userData);
        
        // Check if user has access to DM
        const { data: accessData, error: accessError } = await supabase
          .from('dm_access')
          .select('*')
          .eq('from_user_id', currentUserId)
          .eq('to_user_id', recipientId)
          .maybeSingle();
          
        if (accessError && accessError.code !== 'PGRST116') throw accessError;
        
        if (accessData && accessData.has_access) {
          setAccessStatus('granted');
          fetchMessages();
        } else {
          // Check if there's a post-specific DM fee
          if (postId) {
            const { data: postData, error: postError } = await supabase
              .from('posts')
              .select('dm_fee, monetization_model')
              .eq('post_id', postId)
              .single();
              
            if (postError && postError.code !== 'PGRST116') throw postError;
            
            if (postData && postData.monetization_model === 'paid-dm' && postData.dm_fee) {
              setDmFee(postData.dm_fee);
              setAccessStatus('pay-required');
            } else {
              // Check user's global DM settings
              const { data: dmSettingsData, error: dmSettingsError } = await supabase
                .from('user_settings')
                .select('dm_fee')
                .eq('user_id', recipientId)
                .single();
                
              if (dmSettingsError && dmSettingsError.code !== 'PGRST116') throw dmSettingsError;
              
              if (dmSettingsData && dmSettingsData.dm_fee) {
                setDmFee(dmSettingsData.dm_fee);
                setAccessStatus('pay-required');
              } else {
                // Default - no fee required
                setAccessStatus('granted');
                fetchMessages();
              }
            }
          } else {
            // No post context, check general DM settings
            const { data: dmSettingsData, error: dmSettingsError } = await supabase
              .from('user_settings')
              .select('dm_fee')
              .eq('user_id', recipientId)
              .single();
              
            if (dmSettingsError && dmSettingsError.code !== 'PGRST116') throw dmSettingsError;
            
            if (dmSettingsData && dmSettingsData.dm_fee) {
              setDmFee(dmSettingsData.dm_fee);
              setAccessStatus('pay-required');
            } else {
              setAccessStatus('granted');
              fetchMessages();
            }
          }
        }
      } catch (err) {
        console.error('Error fetching recipient info:', err);
        setError('Failed to load conversation. Please try again.');
        setAccessStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (recipientId && currentUserId) {
      fetchRecipientAndAccess();
    }
  }, [currentUserId, recipientId, postId]);
  
  // Fetch existing messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`)
        .or(`from_user_id.eq.${recipientId},to_user_id.eq.${recipientId}`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read
      const unreadIds = data
        .filter(msg => msg.to_user_id === currentUserId && !msg.is_read)
        .map(msg => msg.message_id);
        
      if (unreadIds.length > 0) {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .in('message_id', unreadIds);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    }
  };
  
  // Subscribe to new messages
  useEffect(() => {
    if (accessStatus !== 'granted' || !currentUserId || !recipientId) return;
  
    const subscription = supabase
      .channel('direct_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages',
        filter: `(from_user_id=eq.${recipientId} AND to_user_id=eq.${currentUserId}) OR (from_user_id=eq.${currentUserId} AND to_user_id=eq.${recipientId})`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
        
        // Mark as read if message is to current user
        if (payload.new.to_user_id === currentUserId) {
          supabase
            .from('direct_messages')
            .update({ is_read: true })
            .eq('message_id', payload.new.message_id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [recipientId, currentUserId, accessStatus]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || accessStatus !== 'granted') return;
    
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          from_user_id: currentUserId,
          to_user_id: recipientId,
          message: newMessage,
          is_read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };
  
  const handlePayForAccess = async () => {
    if (isPaying) return;
    setIsPaying(true);
    
    try {
      // Check if user has enough balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('user_id', currentUserId)
        .single();
        
      if (userError) throw userError;
      
      if (userData.balance < dmFee) {
        setError('Insufficient balance. Please add funds to your wallet.');
        setIsPaying(false);
        return;
      }
      
      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          from_user_id: currentUserId,
          to_user_id: recipientId,
          amount: dmFee,
          transaction_type: 'dm_access',
          related_post_id: postId
        });
        
      if (transactionError) throw transactionError;
      
      // Update DM access
      const { error: accessError } = await supabase
        .from('dm_access')
        .insert({
          from_user_id: currentUserId,
          to_user_id: recipientId,
          has_access: true,
          paid_amount: dmFee,
          post_id: postId
        });
        
      if (accessError) throw accessError;
      
      // Update user balances
      await supabase.rpc('transfer_funds', {
        sender_id: currentUserId,
        receiver_id: recipientId,
        amount: dmFee
      });
      
      setAccessStatus('granted');
      fetchMessages();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200">
        <button onClick={onBack} className="mr-2 text-gray-600 hover:text-red-600">
          <ArrowLeft size={20} />
        </button>
        
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-200">
          <img 
            src={recipient?.avatar_url || "/api/placeholder/32/32"} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {e.target.src = "/api/placeholder/32/32"}}
          />
        </div>
        
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {recipient?.name || recipientName || 'User'}
            {recipient?.is_verified && (
              <Star size={14} className="inline-block ml-1 text-red-600 fill-red-600" />
            )}
          </div>
          <div className="text-xs text-gray-500">@{recipient?.username || 'user'}</div>
        </div>
      </div>
      
      {/* Messages or Payment UI */}
      <div className="flex-1 overflow-y-auto p-3" ref={messageContainerRef}>
        {accessStatus === 'pay-required' ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-red-50 rounded-full p-3 mb-4 text-red-600">
              <Lock size={24} />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect with {recipient?.name || recipientName || 'this user'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              To exchange messages with this user, you need to pay a one-time fee of {dmFee.toLocaleString()} UGX
            </p>
            
            <button
              onClick={handlePayForAccess}
              disabled={isPaying}
              className={`bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm flex items-center ${
                isPaying ? 'opacity-70 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
              }`}
            >
              {isPaying ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white mr-2 rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} className="mr-2" />
                  Pay {dmFee.toLocaleString()} UGX
                </>
              )}
            </button>
            
            <div className="mt-4 text-xs text-gray-500">
              This is a one-time payment for unlimited messaging with this user
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map(message => (
                <div 
                  key={message.message_id} 
                  className={`flex ${message.from_user_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg px-3 py-2 ${
                      message.from_user_id === currentUserId 
                        ? 'bg-red-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.message}
                    <div 
                      className={`text-xs mt-1 ${
                        message.from_user_id === currentUserId 
                          ? 'text-red-200' 
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-50 text-red-800 text-sm rounded-lg flex items-center mx-3 mb-2">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}
      
      {/* Message input */}
      {accessStatus === 'granted' && (
        <div className="p-3 border-t border-gray-200">
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-l-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-r-full ${
                !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessages;