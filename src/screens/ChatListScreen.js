import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChat';
import { useFriends } from '../hooks/useFriends';
import CreateChatModal from '../components/CreateChatModal';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import { supabase } from '../../lib/supabase';
import { colors, theme } from '../utils/colors';
import EmptyState from '../components/EmptyState';
import GlassView from '../components/GlassView';
import { AnimatedHeroGradient } from '../components/AnimatedGradient';

const ChatListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { chats = [], loading } = useChats() || {};
  const { friends = [], refetchFriends } = useFriends() || {};
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');

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
    // If it's a group chat, return the group name
    if (chat.is_group_chat && chat.group_name) {
      return chat.group_name;
    }
    
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
    const hasUnread = item.unread_count > 0;
    const isGroupChat = item.is_group_chat;
    
    const handleChatPress = () => {
      navigation.navigate('ChatRoom', { 
        chatId: item.id, 
        chatName,
        isGroupChat,
        participants: item.participants 
      });
    };
    
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={handleChatPress}
        activeOpacity={0.7}
      >
        <View style={styles.chatItemContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={isGroupChat ? colors.gradients.accent : colors.gradients.primary}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isGroupChat ? (
                <Ionicons name="people" size={20} color={colors.white} />
              ) : (
                <Text style={styles.avatarText}>
                  {chatName.charAt(0).toUpperCase()}
                </Text>
              )}
            </LinearGradient>
            <View style={styles.onlineIndicator} />
          </View>
          
          {/* Chat Content */}
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>{chatName}</Text>
              <View style={styles.rightSection}>
                <Text style={styles.timestamp}>{timestamp}</Text>
                {hasUnread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {item.unread_count > 99 ? '99+' : item.unread_count}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => startChatWithFriend(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chatItemContent}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={colors.gradients.accent}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {(item.display_name || item.username || item.email).charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.onlineIndicator} />
        </View>
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.display_name || item.username || item.email}
            </Text>
            <View style={styles.startChatIcon}>
              <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            Tap to start chatting
          </Text>
        </View>
      </View>
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
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.loadingIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chatbubbles" size={32} color={colors.white} />
            </LinearGradient>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>Loading Messages</Text>
            <Text style={styles.loadingText}>Getting your conversations ready...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const filteredChats = chats?.filter(chat => {
    const name = getChatName(chat).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  const filteredFriends = friends?.filter(friend => {
    const name = (friend.display_name || friend.username || friend.email).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeroGradient style={styles.backgroundGradient}>
        {/* Header */}
        <GlassView style={styles.header} intensity="medium" tint="dark">
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowGroupModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.secondary}
                  style={styles.headerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="people" size={20} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.accent}
                  style={styles.headerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add" size={20} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <LinearGradient
              colors={colors.gradients.card}
              style={styles.searchGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search messages..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </LinearGradient>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
              onPress={() => setActiveTab('chats')}
              activeOpacity={0.8}
            >
              {activeTab === 'chats' ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.activeTabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="chatbubbles" size={18} color={colors.white} />
                  <Text style={styles.activeTabText}>
                    Chats {filteredChats.length > 0 && `(${filteredChats.length})`}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabContent}>
                  <Ionicons name="chatbubbles-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.inactiveTabText}>
                    Chats {filteredChats.length > 0 && `(${filteredChats.length})`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
              onPress={() => setActiveTab('friends')}
              activeOpacity={0.8}
            >
              {activeTab === 'friends' ? (
                <LinearGradient
                  colors={colors.gradients.secondary}
                  style={styles.activeTabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="people" size={18} color={colors.white} />
                  <Text style={styles.activeTabText}>
                    Friends {filteredFriends.length > 0 && `(${filteredFriends.length})`}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabContent}>
                  <Ionicons name="people-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.inactiveTabText}>
                    Friends {filteredFriends.length > 0 && `(${filteredFriends.length})`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </GlassView>

        {/* Content */}
        {activeTab === 'chats' ? (
          filteredChats.length === 0 ? (
            <EmptyState
              type="noChats"
              onActionPress={() => setShowCreateModal(true)}
              style={styles.emptyStateContainer}
            />
          ) : (
            <FlatList
              data={filteredChats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          filteredFriends.length === 0 ? (
            <EmptyState
              type="noFriends"
              onActionPress={() => setShowCreateModal(true)}
              style={styles.emptyStateContainer}
            />
          ) : (
            <FlatList
              data={filteredFriends}
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

        <CreateGroupChatModal
          visible={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={(chat) => {
            setShowGroupModal(false);
            // Navigate to the new group chat
            navigation.navigate('ChatRoom', { 
              chatId: chat.id, 
              chatName: chat.group_name,
              isGroupChat: true,
              participants: chat.participants 
            });
          }}
        />
      </AnimatedHeroGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1F',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.glow,
  },
  headerButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.md,
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 80,
  },
  chatItem: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: theme.typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: theme.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: theme.spacing.sm,
  },
  unreadText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  startChatIcon: {
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingTitle: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
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
  emptyStateContainer: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
});

export default ChatListScreen; 