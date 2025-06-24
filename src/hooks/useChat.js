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

  return {
    messages,
    loading,
    sendMessage,
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
        // First, get chats for the user
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

        // For each chat, get the last message, participants info, and unread count
        const enrichedChats = await Promise.all(
          (chatsData || []).map(async (chat) => {
            // Get last message
            const { data: lastMessage } = await supabase
              .from('messages')
              .select(`
                content,
                created_at,
                sender_id,
                sender:users!sender_id(display_name, email)
              `)
              .eq('chat_id', chat.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Get participants info
            const { data: participants } = await supabase
              .from('users')
              .select('id, display_name, email')
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
              last_message: lastMessage,
              participants: participants || [],
              unread_count: unreadCount || 0
            };
          })
        );

        setChats(enrichedChats);
        
        // Calculate total unread count
        const totalUnread = enrichedChats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
        setTotalUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error in fetchChats:', error);
      }
      setLoading(false);
    };

    fetchChats();

    // Set up real-time subscription for chat updates with unique channel name
    const channelName = `user-chats-${user.id}-${Math.random().toString(36).substr(2, 9)}`;
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
          // Refetch chats when any chat is updated
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Refetch chats when new messages arrive
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
        const updates = unreadMessages.map(async (message) => {
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