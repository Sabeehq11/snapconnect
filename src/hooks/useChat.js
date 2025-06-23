import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
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

    // Set up real-time subscription
    const subscription = supabase
      .channel(`chat-${chatId}`)
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
      subscription.unsubscribe();
    };
  }, [chatId, user]);

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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages:messages!last_message_id(content, created_at, sender_id),
          participants:users!inner(id, display_name, email)
        `)
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats(data || []);
      }
      setLoading(false);
    };

    fetchChats();

    // Set up real-time subscription for chat updates
    const subscription = supabase
      .channel('user-chats')
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
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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
    createChat,
  };
}; 