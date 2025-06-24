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
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useFriends, useFriendRequests } from '../hooks/useFriends';
import AddFriendModal from '../components/AddFriendModal';
import { colors, theme } from '../utils/colors';
import GlassView from '../components/GlassView';
import NeuButton from '../components/NeuButton';
import { AnimatedHeroGradient } from '../components/AnimatedGradient';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { friends } = useFriends();
  const { receivedRequests } = useFriendRequests();
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
    // TODO: Implement profile update in Supabase
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
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.friendItemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
          <View style={styles.friendOnlineIndicator} />
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
      </LinearGradient>
    </TouchableOpacity>
  );

  const menuItems = [
    { 
      icon: 'people',
      iconType: 'Ionicons',
      title: 'My Friends', 
      subtitle: `${friends?.length || 0} connections`,
      onPress: handleViewFriends,
      color: colors.gradients.primary,
    },
    { 
      icon: 'mail',
      iconType: 'Ionicons',
      title: 'Friend Requests', 
      subtitle: 'Manage incoming requests',
      onPress: () => navigation.navigate('FriendRequests'),
      showBadge: receivedRequests?.length > 0,
      badgeCount: receivedRequests?.length || 0,
      color: colors.gradients.secondary,
    },
    { 
      icon: 'camera',
      iconType: 'Ionicons',
      title: 'My Snaps', 
      subtitle: 'Your photo memories',
      color: colors.gradients.accent,
    },
    { 
      icon: 'notifications',
      iconType: 'Ionicons',
      title: 'Notifications', 
      subtitle: 'Manage alerts',
      color: ['#FF6B6B', '#FF8E53'],
    },
    { 
      icon: 'shield-checkmark',
      iconType: 'Ionicons',
      title: 'Privacy & Security', 
      subtitle: 'Account protection',
      color: ['#4ECDC4', '#44A08D'],
    },
    { 
      icon: 'color-palette',
      iconType: 'Ionicons',
      title: 'Appearance', 
      subtitle: 'Themes and display',
      color: ['#A8EDEA', '#7F7FD3'],
    },
    { 
      icon: 'help-circle',
      iconType: 'Ionicons',
      title: 'Help & Support', 
      subtitle: 'Get assistance',
      color: ['#FFECD2', '#FCB69F'],
    },
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity 
      key={index} 
      style={styles.menuItem} 
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.menuItemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIconContainer}>
            <LinearGradient
              colors={item.color}
              style={styles.menuIconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={item.icon} size={22} color={colors.white} />
            </LinearGradient>
            {item.showBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badgeCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuSubtext}>{item.subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={colors.gradients.card}
                style={styles.settingsButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="settings" size={20} color={colors.textPrimary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileContainer}>
            <LinearGradient
              colors={colors.gradients.hero}
              style={styles.profileCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={colors.gradients.secondary}
                    style={styles.avatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.avatarText}>
                      {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </LinearGradient>
                  <View style={styles.onlineIndicator}>
                    <View style={styles.onlineIndicatorInner} />
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.editAvatarButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.editAvatarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="camera" size={12} color={colors.white} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
              {user?.username && (
                <Text style={styles.username}>@{user.username}</Text>
              )}
              <Text style={styles.email}>{user?.email}</Text>
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.statItem} activeOpacity={0.8}>
                  <Text style={styles.statNumber}>{user?.snapScore || 0}</Text>
                  <Text style={styles.statLabel}>Snap Score</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <TouchableOpacity 
                  style={styles.statItem}
                  onPress={handleViewFriends}
                  activeOpacity={0.8}
                >
                  <Text style={styles.statNumber}>{friends?.length || 0}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                  <Text style={styles.addFriendHint}>
                    {friends?.length > 0 ? 'Tap to view' : 'Tap to add'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <TouchableOpacity style={styles.statItem} activeOpacity={0.8}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Active Days</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.primaryActionButton}
                  onPress={handleEditProfile}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.accent}
                    style={styles.primaryActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="create" size={18} color={colors.white} />
                    <Text style={styles.primaryActionText}>Edit Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={() => setShowAddFriendModal(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.secondaryActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="person-add" size={18} color={colors.white} />
                    <Text style={styles.secondaryActionText}>Add Friend</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            {menuItems.map(renderMenuItem)}

            {/* Logout Button */}
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.darker, colors.medium]}
                style={styles.menuItemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <LinearGradient
                      colors={[colors.error, colors.errorLight]}
                      style={styles.menuIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="log-out" size={22} color={colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
                    <Text style={styles.menuSubtext}>Log out of your account</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.error} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Add Friend Modal */}
        <AddFriendModal
          visible={showAddFriendModal}
          onClose={() => setShowAddFriendModal(false)}
        />

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditModal(false)}
        >
          <LinearGradient
            colors={colors.gradients.dark}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={saveProfile}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <LinearGradient
                colors={colors.gradients.card}
                style={styles.inputCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editDisplayName}
                  onChangeText={setEditDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                />
              </LinearGradient>
            </View>
          </LinearGradient>
        </Modal>

        {/* Friends List Modal */}
        <Modal
          visible={showFriendsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowFriendsModal(false)}
        >
          <LinearGradient
            colors={colors.gradients.dark}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFriendsModal(false)}>
                <Text style={styles.modalCancel}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>My Friends ({friends?.length || 0})</Text>
              <TouchableOpacity onPress={() => {
                setShowFriendsModal(false);
                setShowAddFriendModal(true);
              }}>
                <Text style={styles.modalSave}>Add Friend</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.friendsListContainer}>
              {friends?.length > 0 ? (
                <FlatList
                  data={friends}
                  renderItem={renderFriendItem}
                  keyExtractor={(item) => item.id}
                  style={styles.friendsList}
                  contentContainerStyle={styles.friendsListContent}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyFriendsContainer}>
                  <LinearGradient
                    colors={colors.gradients.card}
                    style={styles.emptyFriendsCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.emptyFriendsTitle}>No Friends Yet</Text>
                    <Text style={styles.emptyFriendsText}>
                      Start connecting with classmates by adding them as friends!
                    </Text>
                    <TouchableOpacity 
                      style={styles.addFirstFriendButton}
                      onPress={() => {
                        setShowFriendsModal(false);
                        setShowAddFriendModal(true);
                      }}
                    >
                      <LinearGradient
                        colors={colors.gradients.primary}
                        style={styles.addFirstFriendGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.addFirstFriendText}>Add Your First Friend</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}
            </View>
          </LinearGradient>
        </Modal>
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
  settingsButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  settingsButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  onlineIndicatorInner: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.lg,
    elevation: 8,
  },
  editAvatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: theme.typography.fontSizes.xxl + 4,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  username: {
    fontSize: theme.typography.fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  email: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textMuted,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.xl + 2,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: theme.spacing.md,
  },
  addFriendHint: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textMuted,
    fontWeight: theme.typography.fontWeights.medium,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
    elevation: 4,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
    elevation: 4,
  },
  secondaryActionGradient: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  secondaryActionText: {
    color: colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  menuItem: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
    elevation: 2,
  },
  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  menuIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...theme.shadows.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: theme.typography.fontSizes.md + 1,
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  menuSubtext: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 16,
  },
  logoutItem: {
    marginTop: theme.spacing.lg,
  },
  logoutText: {
    color: colors.error,
  },
  
  // Friend item styles
  friendItem: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
    elevation: 2,
  },
  friendItemGradient: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: theme.spacing.lg,
  },
  friendAvatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
    elevation: 2,
  },
  friendAvatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: theme.typography.fontWeights.bold,
  },
  friendOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md + 1,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  friendUsername: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.xs,
  },
  friendEmail: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.xs,
  },
  chatButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.sm,
    elevation: 2,
  },
  chatButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Friends list modal styles
  friendsListContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  friendsList: {
    flex: 1,
  },
  friendsListContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyFriendsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFriendsCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    ...theme.shadows.lg,
    elevation: 8,
  },
  emptyFriendsTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  emptyFriendsText: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  addFirstFriendButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    ...theme.shadows.md,
    elevation: 4,
  },
  addFirstFriendGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFirstFriendText: {
    color: colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
  },
  modalSave: {
    color: colors.accent,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  inputCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
    elevation: 2,
  },
  inputLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSizes.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default ProfileScreen; 