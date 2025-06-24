import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFriendRequests } from '../hooks/useFriends';
import { colors, theme } from '../utils/colors';

const FriendRequestsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('received');
  
  // Add error boundary for hook
  let hookData;
  try {
    hookData = useFriendRequests();
  } catch (error) {
    console.error('Error in useFriendRequests hook:', error);
    hookData = {
      receivedRequests: [],
      sentRequests: [],
      loading: false,
      respondToRequest: async () => ({ success: false, error: 'Service unavailable' })
    };
  }
  
  const { receivedRequests, sentRequests, loading, respondToRequest } = hookData;

  const handleAcceptRequest = async (requestId) => {
    try {
      const result = await respondToRequest(requestId, 'accept');
      if (result.success) {
        Alert.alert('Success', 'Friend request accepted!');
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      'Reject Friend Request',
      'Are you sure you want to reject this friend request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await respondToRequest(requestId, 'reject');
              if (result.success) {
                Alert.alert('Success', 'Friend request rejected');
              } else if (result.error) {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error rejecting friend request:', error);
              Alert.alert('Error', 'Failed to reject friend request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderReceivedRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.requestCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {(item.sender_display_name || item.sender_username || item.sender_email).charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {item.sender_display_name || item.sender_username || item.sender_email}
              </Text>
              {item.sender_username && (
                <Text style={styles.userHandle}>@{item.sender_username}</Text>
              )}
              <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
            </View>
          </View>
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>"{item.message}"</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectRequest(item.id)}
          >
            <LinearGradient
              colors={[colors.error, colors.errorLight]}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSentRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.requestCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={colors.gradients.secondary}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {(item.receiver_display_name || item.receiver_username || item.receiver_email).charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {item.receiver_display_name || item.receiver_username || item.receiver_email}
              </Text>
              {item.receiver_username && (
                <Text style={styles.userHandle}>@{item.receiver_username}</Text>
              )}
              <Text style={styles.timestamp}>Sent {formatTimestamp(item.created_at)}</Text>
            </View>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>"{item.message}"</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.emptyCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emptyTitle}>
          {activeTab === 'received' ? 'No Friend Requests' : 'No Sent Requests'}
        </Text>
        <Text style={styles.emptyText}>
          {activeTab === 'received' 
            ? 'You have no pending friend requests at the moment.'
            : 'You haven\'t sent any friend requests yet.'
          }
        </Text>
      </LinearGradient>
    </View>
  );

  const currentData = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friend Requests</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              Received ({receivedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              Sent ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading friend requests...</Text>
          </View>
        ) : currentData.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={currentData}
            renderItem={activeTab === 'received' ? renderReceivedRequest : renderSentRequest}
            keyExtractor={(item) => item.id}
            style={styles.requestsList}
            contentContainerStyle={styles.requestsListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 24,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.md,
    marginTop: theme.spacing.md,
  },
  requestsList: {
    flex: 1,
  },
  requestsListContent: {
    padding: theme.spacing.lg,
  },
  requestItem: {
    marginBottom: theme.spacing.md,
  },
  requestCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  userHandle: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    marginTop: 2,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: 4,
  },
  pendingBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  pendingText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
  },
  messageContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rejectButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  acceptButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FriendRequestsScreen; 