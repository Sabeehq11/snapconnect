import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChat';
import CreateChatModal from '../components/CreateChatModal';
import { colors, theme } from '../utils/colors';

const ChatListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { chats, loading } = useChats();
  const [showCreateModal, setShowCreateModal] = useState(false);

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
          <Text style={styles.headerTitle}>Messages</Text>
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

        {chats.length === 0 ? (
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