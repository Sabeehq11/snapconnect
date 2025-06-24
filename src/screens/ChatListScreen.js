import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChat';
import { useFriends } from '../hooks/useFriends';
import CreateChatModal from '../components/CreateChatModal';
import { supabase } from '../../lib/supabase';
import { colors, theme } from '../utils/colors';

const ChatListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { chats, loading } = useChats();
  const { friends, refetchFriends } = useFriends();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');

  // Refresh friends when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (refetchFriends) {
        refetchFriends();
      }
    }, [refetchFriends])
  );

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getChatName = (chat) => {
    // Find the other participant(s) in the chat
    const otherParticipants = chat.participants?.filter(p => p.id !== user?.id) || [];
    if (otherParticipants.length === 1) {
      return otherParticipants[0].display_name || otherParticipants[0].username || otherParticipants[0].email;
    } else if (otherParticipants.length > 1) {
      const firstName = otherParticipants[0].display_name || otherParticipants[0].username || otherParticipants[0].email;
      return `${firstName} +${otherParticipants.length - 1}`;
    }
    return 'Chat';
  };

  const getLastMessage = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[0];
      return lastMsg.content || 'Media message';
    }
    return 'Start the conversation...';
  };

  const startChatWithFriend = async (friend) => {
    try {
      // Create a new chat with the friend
      const participants = [user.id, friend.id];
      
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([{ participants }])
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        return;
      }

      if (newChat) {
        // Switch to chats tab first
        setActiveTab('chats');
        
        // Navigate to the new chat
        navigation.navigate('ChatRoom', { 
          chatId: newChat.id, 
          chatName: friend.display_name || friend.username || friend.email 
        });
      }
    } catch (error) {
      console.error('Error starting chat with friend:', error);
    }
  };

  const renderChatItem = ({ item }) => {
    const chatName = getChatName(item);
    const lastMessage = getLastMessage(item);
    const timestamp = formatTimestamp(item.last_message_at || item.created_at);
    
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, chatName })}
      >
        <LinearGradient
          colors={colors.gradients.card}
          style={styles.chatItemGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {chatName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{chatName}</Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => startChatWithFriend(item)}
    >
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.chatItemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatar}>
          <LinearGradient
            colors={colors.gradients.secondary}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {(item.display_name || item.username || item.email).charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>
              {item.display_name || item.username || item.email}
            </Text>
            <Text style={styles.onlineStatus}>●</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            Tap to start a chat
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colors.gradients.dark}
          style={styles.backgroundGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.backgroundGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {activeTab === 'chats' ? 'Messages' : 'Friends'}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
            onPress={() => setActiveTab('chats')}
          >
            <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
              Chats ({chats.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'chats' ? (
          chats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={colors.gradients.card}
                style={styles.emptyCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptyText}>
                  Start connecting with friends and colleagues
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <LinearGradient
                    colors={colors.gradients.accent}
                    style={styles.emptyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.emptyButtonText}>Start Chatting</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={colors.gradients.card}
                style={styles.emptyCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.emptyTitle}>No friends yet</Text>
                <Text style={styles.emptyText}>
                  Add friends to start chatting with them
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              showsVerticalScrollIndicator={false}
            />
          )
        )}

        <CreateChatModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onChatCreated={(chat) => {
            setShowCreateModal(false);
            // Navigate to the new chat
            const chatName = chat.participants?.length > 1 ? 'New Chat' : 'Chat';
            navigation.navigate('ChatRoom', { chatId: chat.id, chatName });
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  addButton: {
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.glow,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  onlineStatus: {
    color: colors.success,
    fontSize: 12,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  chatItem: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  chatItemGradient: {
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  avatar: {
    marginRight: theme.spacing.md,
  },
  avatarGradient: {
    width: 54,
    height: 54,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  chatName: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  timestamp: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  lastMessage: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  emptyButtonText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});

export default ChatListScreen; 