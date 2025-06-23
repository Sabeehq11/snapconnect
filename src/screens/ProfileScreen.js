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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
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

  const menuItems = [
    { icon: '👥', title: 'Friends', subtitle: `${user?.friends?.length || 0} connections` },
    { icon: '📸', title: 'My Snaps', subtitle: 'Your photo memories' },
    { icon: '🔔', title: 'Notifications', subtitle: 'Manage alerts' },
    { icon: '🔒', title: 'Privacy & Security', subtitle: 'Account protection' },
    { icon: '🎨', title: 'Appearance', subtitle: 'Themes and display' },
    { icon: '❓', title: 'Help & Support', subtitle: 'Get assistance' },
  ];

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
                <View style={styles.onlineIndicator} />
              </View>
              
              <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
              {user?.username && (
                <Text style={styles.username}>@{user.username}</Text>
              )}
              <Text style={styles.email}>{user?.email}</Text>
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user?.snapScore || 0}</Text>
                  <Text style={styles.statLabel}>Snap Score</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user?.friends?.length || 0}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Active Days</Text>
                </View>
              </View>

              {/* Edit Button */}
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <LinearGradient
                  colors={colors.gradients.accent}
                  style={styles.editButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.menuItemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <LinearGradient
                        colors={colors.gradients.primary}
                        style={styles.menuIconBg}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuText}>{item.title}</Text>
                      <Text style={styles.menuSubtext}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]} 
              onPress={handleLogout}
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
                      <Text style={styles.menuIcon}>🚪</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
                    <Text style={styles.menuSubtext}>Log out of your account</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.textPrimary,
  },
  avatarText: {
    fontSize: theme.typography.fontSizes.xxxl + 8,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.textPrimary,
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
    color: colors.accent,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  email: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  editButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  editButtonGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.semibold,
    fontSize: theme.typography.fontSizes.md,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  menuItem: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  menuItemGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    marginRight: theme.spacing.md,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: theme.typography.fontSizes.lg,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textMuted,
  },
  menuArrow: {
    fontSize: theme.typography.fontSizes.xl,
    color: colors.textMuted,
    marginLeft: theme.spacing.md,
  },
  logoutItem: {
    marginTop: theme.spacing.lg,
  },
  logoutText: {
    color: colors.error,
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
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default ProfileScreen; 