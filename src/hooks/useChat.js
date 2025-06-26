import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Clean up any existing subscription first
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!chatId || !user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(display_name, email)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription with unique channel name
    const channelName = `chat-${chatId}-${Math.random().toString(36).substr(2, 9)}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!sender_id(display_name, email)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [chatId, user?.id]); // Only depend on chatId and user.id

  const sendMessage = async (content, messageType = 'text', mediaUrl = null, disappearAfterSeconds = 10, maxViews = 1) => {
    if (!user || !chatId) return;

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          sender_id: user.id,
          content,
          message_type: messageType,
          media_url: mediaUrl,
          disappear_after_seconds: disappearAfterSeconds,
          max_views: maxViews,
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Update chat's last message timestamp
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);
  };

  const clearChatHistory = async () => {
    if (!user || !chatId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      if (error) {
        throw error;
      }

      // Update chat's last message timestamp to now
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      console.log('✅ Chat history cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing chat history:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    if (!user || !chatId) return;

    try {
      // First, check if the message belongs to the current user
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .eq('chat_id', chatId)
        .single();

      if (fetchError) {
        throw new Error('Message not found');
      }

      if (message.sender_id !== user.id) {
        throw new Error('You can only delete your own messages');
      }

      // Delete the message
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // Extra security check

      if (error) {
        throw error;
      }

      // Update local state to remove the deleted message
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      console.log('✅ Message deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    clearChatHistory,
    deleteMessage,
  };
};

export const useChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Clean up any existing subscription first
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        // First, get chats for the user with better deduplication
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select('*')
          .contains('participants', [user.id])
          .order('last_message_at', { ascending: false });

        if (chatsError) {
          console.error('Error fetching chats:', chatsError);
          setLoading(false);
          return;
        }

        // Deduplicate chats by participants (for group chats) or by unique id
        const uniqueChats = [];
        const seenChats = new Set();

        (chatsData || []).forEach(chat => {
          // Create a unique key for the chat
          let chatKey;
          if (chat.is_group_chat) {
            // For group chats, use the chat ID
            chatKey = chat.id;
          } else {
            // For 1-on-1 chats, create a key based on sorted participants
            const sortedParticipants = [...chat.participants].sort();
            chatKey = sortedParticipants.join('-');
          }

          if (!seenChats.has(chatKey)) {
            seenChats.add(chatKey);
            uniqueChats.push(chat);
          }
        });

        // For each unique chat, get the last message, participants info, and unread count
        const enrichedChats = await Promise.all(
          uniqueChats.map(async (chat) => {
            // Get last message
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select(`
                content,
                created_at,
                sender_id,
                sender:users!sender_id(display_name, email)
              `)
              .eq('chat_id', chat.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const lastMessage = lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null;

            // Get participants info
            const { data: participants } = await supabase
              .from('users')
              .select('id, display_name, email, username')
              .in('id', chat.participants);

            // Get unread count - messages where current user hasn't viewed
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', chat.id)
              .neq('sender_id', user.id) // Not sent by current user
              .not('viewed_by', 'cs', `[{"user_id":"${user.id}"}]`); // Not viewed by current user

            return {
              ...chat,
              messages: lastMessage ? [lastMessage] : [], // Use array format for consistency
              participants: participants || [],
              unread_count: unreadCount || 0
            };
          })
        );

        // Final deduplication check - remove any remaining duplicates by participants
        const finalChats = [];
        const finalSeenKeys = new Set();

        enrichedChats.forEach(chat => {
          let finalKey;
          if (chat.is_group_chat) {
            finalKey = chat.id;
          } else {
            // For 1-on-1 chats, ensure we don't have duplicates based on participants
            const otherParticipants = (chat.participants || [])
              .filter(p => p.id !== user.id)
              .map(p => p.id)
              .sort();
            finalKey = otherParticipants.join('-');
          }

          if (!finalSeenKeys.has(finalKey)) {
            finalSeenKeys.add(finalKey);
            finalChats.push(chat);
          }
        });

        setChats(finalChats);
        
        // Calculate total unread count
        const totalUnread = finalChats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
        setTotalUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error in fetchChats:', error);
      }
      setLoading(false);
    };

    fetchChats();

    // Set up real-time subscription with unique channel name
    const channelName = `chats-${user.id}-${Math.random().toString(36).substr(2, 9)}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        () => {
          console.log('Chat change detected, refetching...');
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          console.log('Message change detected, refetching chats...');
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user?.id]); // Only depend on user.id

  const markChatAsRead = async (chatId) => {
    if (!user || !chatId) return;

    try {
      // Get all unread messages in this chat
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id, viewed_by')
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .not('viewed_by', 'cs', `[{"user_id":"${user.id}"}]`);

      if (unreadMessages && unreadMessages.length > 0) {
        // Mark all unread messages as viewed
        const updates = (unreadMessages || []).map(async (message) => {
          const viewedBy = message.viewed_by || [];
          const newViewedBy = [...viewedBy, {
            user_id: user.id,
            viewed_at: new Date().toISOString()
          }];

          return supabase
            .from('messages')
            .update({ viewed_by: newViewedBy })
            .eq('id', message.id);
        });

        await Promise.all(updates);
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const createChat = async (participantIds) => {
    if (!user) return;

    const participants = [user.id, ...participantIds];
    
    const { data, error } = await supabase
      .from('chats')
      .insert([{ participants }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      throw error;
    }

    return data;
  };

  return {
    chats,
    loading,
    totalUnreadCount,
    createChat,
    markChatAsRead,
  };
}; 