import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useFriends, useFriendRequests } from '../hooks/useFriends';
import AddFriendModal from '../components/AddFriendModal';
import { colors, theme } from '../utils/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { friends = [] } = useFriends() || {};
  const { receivedRequests = [] } = useFriendRequests() || {};
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditDisplayName(user?.displayName || '');
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    Alert.alert('Profile Updated!', 'Your changes have been saved.');
    setShowEditModal(false);
  };

  const handleViewFriends = () => {
    if (friends?.length > 0) {
      setShowFriendsModal(true);
    } else {
      setShowAddFriendModal(true);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity style={styles.friendItem} activeOpacity={0.8}>
      <View style={styles.friendItemContent}>
        <View style={styles.friendAvatar}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.friendAvatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.friendAvatarText}>
              {(item.display_name || item.username || item.email).charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>
            {item.display_name || item.username || 'No name'}
          </Text>
          {item.username && (
            <Text style={styles.friendUsername}>@{item.username}</Text>
          )}
          <Text style={styles.friendEmail} numberOfLines={1}>{item.email}</Text>
        </View>
        <TouchableOpacity 
          style={styles.chatButton}
          activeOpacity={0.7}
          onPress={() => {
            setShowFriendsModal(false);
            navigation.navigate('Chat', { 
              screen: 'ChatMain',
              params: { friendId: item.id, friendName: item.display_name || item.username }
            });
          }}
        >
          <LinearGradient
            colors={colors.gradients.accent}
            style={styles.chatButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="chatbubble" size={16} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const menuItems = [
    { 
      icon: 'people',
      title: 'My Friends', 
      subtitle: `${friends?.length || 0} friends`,
      onPress: handleViewFriends,
      color: colors.primary,
    },
    { 
      icon: 'person-add',
      title: 'Add Friends', 
      subtitle: 'Find and connect with people',
      onPress: () => setShowAddFriendModal(true),
      color: colors.secondary,
    },
    { 
      icon: 'camera',
      title: 'Memories', 
      subtitle: 'Your saved snaps',
      onPress: () => {},
      color: colors.accent,
    },
    { 
      icon: 'settings',
      title: 'Settings', 
      subtitle: 'App preferences',
      onPress: () => {},
      color: colors.textSecondary,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>SnapConnect</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={colors.gradients?.snapGradient || ['#6366F1', '#8B5CF6', '#3B82F6']}
              style={styles.profileImageBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileImageInner}>
                <LinearGradient
                  colors={colors.gradients?.primary || ['#6366F1', '#8B5CF6']}
                  style={styles.profileImage}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.profileImageText}>
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={colors.gradients?.primary || ['#6366F1', '#8B5CF6']}
                style={styles.statBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statNumber}>24,550</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Snap Score</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {(menuItems || []).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuIconContainer}>
                  <View style={[styles.menuIconBackground, { backgroundColor: item?.color || colors.primary }]}>
                    <Ionicons name={item?.icon || 'help'} size={20} color={colors.white} />
                  </View>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item?.title || 'Menu Item'}</Text>
                  <Text style={styles.menuSubtitle}>{item?.subtitle || 'Loading...'}</Text>
                </View>
                <View style={styles.menuArrow}>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Friend Requests */}
        {(receivedRequests?.length || 0) > 0 && (
          <TouchableOpacity
            style={styles.friendRequestsCard}
            onPress={() => navigation.navigate('FriendRequests')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients?.error || ['#EF4444', '#DC2626']}
              style={styles.friendRequestsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.friendRequestsContent}>
                <Ionicons name="people" size={24} color={colors.white} />
                <View style={styles.friendRequestsText}>
                  <Text style={styles.friendRequestsTitle}>Friend Requests</Text>
                  <Text style={styles.friendRequestsSubtitle}>
                    {(receivedRequests?.length || 0)} pending request{(receivedRequests?.length || 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.friendRequestsBadge}>
                  <Text style={styles.friendRequestsBadgeText}>
                    {receivedRequests?.length || 0}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.modalInput}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              placeholder="Display Name"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveProfile}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.modalSaveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Friends Modal */}
      <Modal
        visible={showFriendsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFriendsModal(false)}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.friendsModal}>
            <View style={styles.friendsHeader}>
              <Text style={styles.friendsTitle}>My Friends</Text>
                              <TouchableOpacity onPress={() => setShowFriendsModal(false)}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            {(friends || []).length > 0 ? (
              <FlatList
                data={friends || []}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                style={styles.friendsList}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
                bounces={true}
              />
            ) : (
              <View style={styles.emptyFriendsContainer}>
                <Text style={styles.emptyFriendsText}>No friends yet</Text>
                <Text style={styles.emptyFriendsSubtext}>Add some friends to see them here!</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <AddFriendModal
        visible={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#1A1A1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#1A1A1F',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImageBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statBackground: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    marginRight: 16,
  },
  menuIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  menuArrow: {
    marginLeft: 8,
  },
  friendRequestsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  friendRequestsGradient: {
    padding: 20,
  },
  friendRequestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendRequestsText: {
    flex: 1,
    marginLeft: 16,
  },
  friendRequestsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  friendRequestsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  friendRequestsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  friendRequestsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: '#2A2A30',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.white,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalCancelButton: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalSaveButton: {
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Friends modal
  friendsModal: {
    backgroundColor: '#2A2A30',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  friendsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  friendItem: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  friendItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  friendAvatar: {
    marginRight: 12,
  },
  friendAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFriendsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFriendsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  emptyFriendsSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default ProfileScreen; 