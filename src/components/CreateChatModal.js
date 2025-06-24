import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { colors, theme } from '../utils/colors';

const CreateChatModal = ({ visible, onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const { user } = useAuth();
  const { friends, sendFriendRequest } = useFriends();

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, display_name')
        .neq('id', user.id)
        .limit(20);

      if (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to load users. Please check your connection.');
      } else {
        console.log('Fetched users:', data); // Debug log
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    }
  };

  const handleSendFriendRequest = async (targetUser) => {
    try {
      const result = await sendFriendRequest(targetUser.email);
      if (result.success) {
        Alert.alert('Success', `Friend request sent to ${targetUser.display_name || targetUser.username}!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const friendIds = friends.map(f => f.id);
  
  const filteredFriends = friends.filter(f => {
    const query = searchQuery.toLowerCase();
    return (
      f.email.toLowerCase().includes(query) ||
      (f.display_name && f.display_name.toLowerCase().includes(query)) ||
      (f.username && f.username.toLowerCase().includes(query))
    );
  });

  const filteredNonFriends = users.filter(u => {
    const query = searchQuery.toLowerCase();
    const isNotFriend = !friendIds.includes(u.id);
    const matchesSearch = (
      u.email.toLowerCase().includes(query) ||
      (u.display_name && u.display_name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query))
    );
    return isNotFriend && matchesSearch;
  });

  const dataToShow = activeTab === 'friends' ? filteredFriends : filteredNonFriends;

  const toggleUserSelection = (selectedUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === selectedUser.id);
      if (isSelected) {
        return prev.filter(u => u.id !== selectedUser.id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const createChat = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    // Ensure all selected users are friends
    const selectedFriendIds = selectedUsers.map(u => u.id);
    const allAreFriends = selectedFriendIds.every(id => friendIds.includes(id));
    
    if (!allAreFriends) {
      Alert.alert('Error', 'You can only create chats with friends');
      return;
    }

    setLoading(true);
    try {
      const participants = [user.id, ...selectedUsers.map(u => u.id)];
      
      const { data, error } = await supabase
        .from('chats')
        .insert([{ participants }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      onChatCreated(data);
      onClose();
      setSelectedUsers([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => {
    const isSelected = selectedUsers.find(u => u.id === item.id);
    const isFriend = friendIds.includes(item.id);
    
    return (
      <View style={styles.userItem}>
        <LinearGradient
          colors={isSelected ? colors.gradients.primary : colors.gradients.card}
          style={styles.userItemGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.userContent}
            onPress={() => isFriend ? toggleUserSelection(item) : null}
            disabled={!isFriend}
          >
            <View style={styles.avatar}>
              <LinearGradient
                colors={colors.gradients.accent}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {(item.display_name || item.username || item.email).charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.display_name || item.username || 'No name'}
              </Text>
              {item.username && (
                <Text style={styles.userUsername}>@{item.username}</Text>
              )}
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
          </TouchableOpacity>
          
          {/* Action Button */}
          {isFriend ? (
            isSelected && (
              <View style={styles.checkmarkContainer}>
                <LinearGradient
                  colors={colors.gradients.accent}
                  style={styles.checkmarkBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.checkmark}>✓</Text>
                </LinearGradient>
              </View>
            )
          ) : (
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={() => handleSendFriendRequest(item)}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.addFriendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.addFriendButtonText}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Conversation</Text>
          <TouchableOpacity 
            onPress={createChat} 
            disabled={loading}
            style={[styles.headerButton, loading && styles.headerButtonDisabled]}
          >
            <Text style={[styles.createButton, loading && styles.createButtonDisabled]}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <LinearGradient
            colors={colors.gradients.card}
            style={styles.searchInputContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, username, or email..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
          {/* Debug info */}
          <Text style={styles.debugText}>
            Friends: {friends.length}, Others: {filteredNonFriends.length}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Add Friends ({filteredNonFriends.length})
            </Text>
          </TouchableOpacity>
        </View>

        {selectedUsers.length > 0 && activeTab === 'friends' && (
          <View style={styles.selectedContainer}>
            <LinearGradient
              colors={colors.gradients.card}
              style={styles.selectedCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.selectedTitle}>Selected ({selectedUsers.length}):</Text>
              <FlatList
                data={selectedUsers}
                renderItem={({ item }) => (
                  <View style={styles.selectedUser}>
                    <LinearGradient
                      colors={colors.gradients.accent}
                      style={styles.selectedUserGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.selectedUserText}>
                        {item.display_name || item.username || item.email}
                      </Text>
                    </LinearGradient>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </LinearGradient>
          </View>
        )}

        <FlatList
          data={dataToShow}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          style={styles.usersList}
          contentContainerStyle={styles.usersListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'friends' 
                  ? 'No friends found. Switch to "Add Friends" tab to send friend requests.' 
                  : 'No users found to add as friends'
                }
              </Text>
            </View>
          }
        />
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
  title: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
  },
  createButton: {
    color: colors.accent,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'right',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchInputContainer: {
    borderRadius: theme.borderRadius.lg,
    padding: 2,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg - 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
  },
  debugText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
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
  selectedContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  selectedCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  selectedTitle: {
    color: colors.accent,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.sm,
  },
  selectedUser: {
    marginRight: theme.spacing.sm,
  },
  selectedUserGradient: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  selectedUserText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  usersList: {
    flex: 1,
  },
  usersListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  userItem: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  userItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  userItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: theme.spacing.md,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: 2,
  },
  userUsername: {
    color: colors.accent,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: 2,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
  },
  checkmarkContainer: {
    marginLeft: theme.spacing.md,
  },
  checkmarkBg: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
  addFriendButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginLeft: theme.spacing.md,
  },
  addFriendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFriendButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CreateChatModal; 