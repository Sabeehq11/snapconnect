import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useFriends } from '../hooks/useFriends';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';

const CreateGroupChatModal = ({ visible, onClose, onGroupCreated }) => {
  const { friends = [], loading: friendsLoading, refetchFriends } = useFriends();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Debug logging and force refresh when modal opens
  useEffect(() => {
    if (visible) {
      console.log('🔥 CreateGroupChatModal opened');
      console.log('👥 Friends loaded:', friends);
      console.log('📊 Friends count:', friends.length);
      console.log('⏳ Friends loading state:', friendsLoading);
      console.log('👤 Current user:', user?.id);
      
      // Log individual friends for debugging
      if (friends && friends.length > 0) {
        friends.forEach((friend, index) => {
          console.log(`👤 Friend ${index + 1}:`, {
            id: friend.id,
            name: friend.display_name || friend.username,
            email: friend.email
          });
        });
      } else {
        console.log('⚠️ No friends data available for group chat');
      }
      
      // Force refresh friends when modal opens
      if (refetchFriends) {
        console.log('🔄 Forcing friends refresh...');
        refetchFriends();
      } else {
        console.log('⚠️ refetchFriends function not available');
      }
    }
  }, [visible, friends, user, friendsLoading, refetchFriends]);

  // Additional debugging effect to monitor friends changes
  useEffect(() => {
    console.log('🔍 Friends data changed:', {
      count: friends.length,
      loading: friendsLoading,
      hasData: friends.length > 0,
      modalVisible: visible
    });
  }, [friends, friendsLoading, visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setGroupName('');
      setSelectedFriends([]);
    }
  }, [visible]);

  const handleToggleFriend = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.find(f => f.id === friend.id);
      if (isSelected) {
        return prev.filter(f => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedFriends.length < 2) {
      Alert.alert('Error', 'Please select at least 2 friends for a group chat');
      return;
    }

    setIsCreating(true);

    try {
      // Create participants array including current user
      const participants = [user.id, ...selectedFriends.map(f => f.id)];

      // Create the group chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert([
          {
            participants,
            last_message_at: new Date().toISOString(),
            group_name: groupName.trim(),
            is_group_chat: true,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (chatError) {
        throw chatError;
      }

      // Send a system message about group creation
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatData.id,
            sender_id: user.id,
            content: `${user.displayName || user.email} created the group "${groupName}"`,
            message_type: 'system',
            disappear_after_seconds: null, // System messages don't disappear
          }
        ]);

      if (messageError) {
        console.warn('Error sending system message:', messageError);
      }

      Alert.alert('Success', 'Group chat created successfully!');
      
      // Reset form
      setGroupName('');
      setSelectedFriends([]);
      
      // Notify parent component
      if (onGroupCreated) {
        onGroupCreated(chatData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      Alert.alert('Error', 'Failed to create group chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderFriendItem = ({ item: friend }) => {
    const isSelected = selectedFriends.find(f => f.id === friend.id);
    
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.selectedFriendItem]}
        onPress={() => handleToggleFriend(friend)}
        activeOpacity={0.7}
      >
        <View style={styles.friendInfo}>
          <View style={styles.friendAvatar}>
            <LinearGradient
              colors={isSelected ? colors.gradients.accent : colors.gradients.primary}
              style={styles.friendAvatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.friendAvatarText}>
                {(friend.display_name || friend.username || friend.email).charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>
              {friend.display_name || friend.username || 'No name'}
            </Text>
            <Text style={styles.friendEmail}>{friend.email}</Text>
          </View>
        </View>
        <View style={styles.checkboxContainer}>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          )}
          {!isSelected && (
            <View style={styles.uncheckedCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Group Chat</Text>
            <TouchableOpacity onPress={onClose} disabled={isCreating}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Group Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name..."
              placeholderTextColor={colors.textTertiary}
              maxLength={50}
              editable={!isCreating}
            />
          </View>

          {/* Selected Friends Count */}
          <View style={styles.selectedCountSection}>
            <Text style={styles.selectedCountText}>
              Selected: {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''}
            </Text>
            {selectedFriends.length >= 2 && (
              <Text style={styles.readyText}>✓ Ready to create group</Text>
            )}
          </View>

          {/* Friends List */}
          <View style={styles.friendsListSection}>
            <Text style={styles.sectionTitle}>Select Friends</Text>
            {friendsLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.emptyText}>Loading friends...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No friends found</Text>
                <Text style={styles.emptySubtext}>Add some friends first to create group chats</Text>
              </View>
            ) : (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, (!groupName.trim() || selectedFriends.length < 2 || isCreating) && styles.disabledButton]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || selectedFriends.length < 2 || isCreating}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={(!groupName.trim() || selectedFriends.length < 2 || isCreating) ? 
                ['#666', '#444'] : colors.gradients.primary}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isCreating ? (
                <Text style={styles.createButtonText}>Creating...</Text>
              ) : (
                <Text style={styles.createButtonText}>Create Group Chat</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2A2A30',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  inputSection: {
    padding: 20,
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.white,
  },
  selectedCountSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  selectedCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  readyText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  friendsListSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  friendsList: {
    flex: 1,
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFriendItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: colors.accent,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    marginRight: 12,
  },
  friendAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  createButton: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CreateGroupChatModal; 