import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { currentTheme, currentThemeKey, themes, changeTheme } = useTheme();
  const colors = currentTheme?.colors || {};
  
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);

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

  const handleSaveAccount = () => {
    Alert.alert('Account Updated', 'Your account information has been saved.');
    setShowAccountModal(false);
  };

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
    setShowThemeModal(false);
    Alert.alert('Theme Changed', `Switched to ${themes[themeKey].name} theme!`);
  };

  const settingsItems = [
    {
      icon: 'person-outline',
      title: 'Account Information',
      subtitle: 'Edit your profile details',
      onPress: () => setShowAccountModal(true),
      color: colors.primary,
    },
    {
      icon: 'color-palette-outline',
      title: 'Theme',
      subtitle: `Current: ${currentTheme?.name || 'Default'}`,
      onPress: () => setShowThemeModal(true),
      color: colors.accent,
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Push notification settings',
      onPress: () => {},
      color: colors.secondary,
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={notificationsEnabled ? colors.white : '#f4f3f4'}
        />
      ),
    },
    {
      icon: 'lock-closed-outline',
      title: 'Privacy',
      subtitle: 'Account privacy settings',
      onPress: () => {},
      color: colors.warning,
      rightComponent: (
        <Switch
          value={privateAccount}
          onValueChange={setPrivateAccount}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={privateAccount ? colors.white : '#f4f3f4'}
        />
      ),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Coming Soon', 'Help & Support will be available soon!'),
      color: colors.info,
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => Alert.alert('SnapConnect', 'Version 1.0.0\nBuilt with React Native'),
      color: colors.textSecondary,
    },
  ];

  const renderThemeOption = (themeKey, theme) => (
    <TouchableOpacity
      key={themeKey}
      style={styles.themeOption}
      onPress={() => handleThemeChange(themeKey)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.themePreview}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.themePreviewInner}>
          <View style={[styles.themeColorDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.themeColorDot, { backgroundColor: theme.colors.accent }]} />
          <View style={[styles.themeColorDot, { backgroundColor: theme.colors.secondary }]} />
        </View>
      </LinearGradient>
      <View style={styles.themeInfo}>
        <Text style={styles.themeName}>{theme.name}</Text>
        <Text style={styles.themeDescription}>{theme.description}</Text>
      </View>
      {currentThemeKey === themeKey && (
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
      )}
    </TouchableOpacity>
  );

  // Dynamic styles based on current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface || '#1A1A1F',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.surface || '#1A1A1F',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary || colors.white,
    },
    headerSpacer: {
      width: 32,
    },
    scrollView: {
      flex: 1,
    },
    accountSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    accountHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    accountAvatar: {
      marginRight: 16,
    },
    accountAvatarGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountAvatarText: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.white,
    },
    accountInfo: {
      flex: 1,
    },
    accountName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary || colors.white,
      marginBottom: 4,
    },
    accountEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    settingsSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    settingsItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    lastSettingsItem: {
      borderBottomWidth: 0,
    },
    settingsItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsIconContainer: {
      marginRight: 16,
    },
    settingsIconBackground: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingsTextContainer: {
      flex: 1,
    },
    settingsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary || colors.white,
      marginBottom: 2,
    },
    settingsSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    settingsArrow: {
      marginLeft: 8,
    },
    dangerSection: {
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 40,
    },
    dangerButton: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    dangerGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    dangerText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: colors.surfaceElevated || '#2A2A30',
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    accountModalContent: {
      backgroundColor: colors.surfaceElevated || '#2A2A30',
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
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
      color: colors.textPrimary || colors.white,
    },
    themeList: {
      maxHeight: 400,
      padding: 20,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    themePreview: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themePreviewInner: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeColorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 2,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary || colors.white,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    accountForm: {
      padding: 20,
    },
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary || colors.white,
      marginBottom: 8,
    },
    formInput: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.textPrimary || colors.white,
    },
    disabledInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: colors.textSecondary,
    },
    saveButton: {
      margin: 20,
      borderRadius: 16,
      overflow: 'hidden',
    },
    saveGradient: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary || colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.accountSection}>
          <View style={styles.accountHeader}>
            <View style={styles.accountAvatar}>
              <LinearGradient
                colors={colors.gradients?.primary || ['#6366F1', '#8B5CF6']}
                style={styles.accountAvatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.accountAvatarText}>
                  {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingsItem,
                index === settingsItems.length - 1 && styles.lastSettingsItem
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemContent}>
                <View style={styles.settingsIconContainer}>
                  <View style={[styles.settingsIconBackground, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={20} color={colors.white} />
                  </View>
                </View>
                <View style={styles.settingsTextContainer}>
                  <Text style={styles.settingsTitle}>{item.title}</Text>
                  <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
                </View>
                {item.rightComponent || (
                  <View style={styles.settingsArrow}>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={colors.gradients?.error || ['#EF4444', '#DC2626']}
              style={styles.dangerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
              <Text style={styles.dangerText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary || colors.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.themeList} showsVerticalScrollIndicator={false}>
              {Object.entries(themes).map(([key, theme]) => 
                renderThemeOption(key, theme)
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Modal */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.accountModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Information</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary || colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.accountForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Display Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editDisplayName}
                  onChangeText={setEditDisplayName}
                  placeholder="Enter display name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={user?.email}
                  editable={false}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Member Since</Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={new Date().toLocaleDateString()}
                  editable={false}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveAccount}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={colors.gradients?.primary || ['#6366F1', '#8B5CF6']}
                style={styles.saveGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.saveText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen; 