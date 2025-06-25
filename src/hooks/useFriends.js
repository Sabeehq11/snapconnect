import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔍 Fetching friends for user:', user.id);
      const { data, error } = await supabase.rpc('get_user_friends');
      if (error) {
        console.error('Error fetching friends:', error);
        // If the function doesn't exist, set empty friends list
        if (error.code === 'PGRST202') {
          console.log('Friends system database functions not found. Please run the SQL script.');
          setFriends([]);
        }
      } else {
        console.log('✅ Fetched friends successfully:', data); // Debug log
        setFriends(data || []);
      }
    } catch (error) {
      console.error('Error in fetchFriends:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

    fetchFriends();

    // Set up real-time subscription for friendships with a truly unique channel name
    const channelName = `friendships-${user.id}-${Math.random().toString(36).substr(2, 9)}`;
    
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          console.log('Friendship change detected, refetching friends...');
          // Add a small delay to ensure DB operations are complete
          setTimeout(fetchFriends, 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        () => {
          console.log('Friend request change detected, refetching friends...');
          // Add a small delay to ensure DB operations are complete
          setTimeout(fetchFriends, 500);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user?.id]); // FIXED: Removed fetchFriends from dependencies to prevent circular dependency

  const sendFriendRequest = async (emailOrUsername, message = null) => {
    try {
      const { data, error } = await supabase.rpc('send_friend_request', {
        receiver_email: emailOrUsername,
        request_message: message
      });

      if (error) {
        if (error.code === 'PGRST202') {
          return { success: false, error: 'Please run the friends system database script first.' };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };

  return {
    friends,
    loading,
    sendFriendRequest,
    refetchFriends: fetchFriends,
  };
};

export const useFriendRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch received requests
      const { data: received, error: receivedError } = await supabase.rpc('get_pending_friend_requests', {
        request_type: 'received'
      });

      if (receivedError) {
        console.error('Error fetching received requests:', receivedError);
        if (receivedError.code === 'PGRST202') {
          setReceivedRequests([]);
        }
      } else {
        setReceivedRequests(received || []);
      }

      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase.rpc('get_pending_friend_requests', {
        request_type: 'sent'
      });

      if (sentError) {
        console.error('Error fetching sent requests:', sentError);
        if (sentError.code === 'PGRST202') {
          setSentRequests([]);
        }
      } else {
        setSentRequests(sent || []);
      }
    } catch (error) {
      console.error('Error in fetchRequests:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

    fetchRequests();

    // Create unique channel name to avoid conflicts with truly unique identifier
    const channelName = `friend-requests-${user.id}-${Math.random().toString(36).substr(2, 9)}`;
    
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        () => {
          console.log('Friend request change detected, refetching...');
          // Add a small delay to ensure DB operations are complete
          setTimeout(fetchRequests, 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          console.log('Friendship change detected, refetching requests...');
          // Add a small delay to ensure DB operations are complete
          setTimeout(fetchRequests, 500);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, fetchRequests]); // Add fetchRequests to dependencies

  const respondToRequest = async (requestId, response) => {
    try {
      const { data, error } = await supabase.rpc('respond_to_friend_request', {
        request_id: requestId,
        response: response
      });

      if (error) {
        if (error.code === 'PGRST202') {
          return { success: false, error: 'Please run the friends system database script first.' };
        }
        throw error;
      }

      // Immediately update local state to reflect the change
      if (response === 'accept' || response === 'reject') {
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      }

      // Force refresh of both requests and friends after successful response
      setTimeout(() => {
        fetchRequests();
      }, 100);

      // Also trigger a friends refetch if this was an accept
      if (response === 'accept') {
        // Import and trigger friends refetch
        setTimeout(() => {
          // This will be handled by the real-time subscription
        }, 200);
      }

      return data;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  };

  return {
    receivedRequests,
    sentRequests,
    loading,
    respondToRequest,
    refetchRequests: fetchRequests,
  };
}; 