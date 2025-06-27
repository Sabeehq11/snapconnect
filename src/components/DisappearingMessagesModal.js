import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import { supabase } from '../../lib/supabase';

const DisappearingMessagesModal = ({ 
  visible, 
  onClose, 
  chatId, 
  currentSetting, 
  onSettingChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(currentSetting || 'none');

  const settings = [
    {
      id: 'none',
      title: 'Messages do not disappear',
      description: 'Messages stay in the chat permanently',
      icon: 'infinite-outline',
      color: colors.textSecondary,
    },
    {
      id: 'after_viewing',
      title: 'Messages disappear after viewing',
      description: 'Messages disappear once the recipient opens them',
      icon: 'eye-outline',
      color: colors.primary,
    },
    {
      id: '24_hours',
      title: 'Messages disappear after 24 hours',
      description: 'Messages automatically disappear after 24 hours',
      icon: 'time-outline',
      color: colors.accent,
    },
  ];

  const handleSave = async () => {
    if (selectedSetting === currentSetting) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chats')
        .update({ disappearing_setting: selectedSetting })
        .eq('id', chatId);

      if (error) {
        throw error;
      }

      onSettingChange(selectedSetting);
      onClose();
      
      // Show confirmation message
      const settingName = settings.find(s => s.id === selectedSetting)?.title;
      Alert.alert(
        'Setting Updated',
        `Future messages will now follow the "${settingName}" setting.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating disappearing setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSettingOption = (setting) => {
    const isSelected = selectedSetting === setting.id;
    
    return (
      <TouchableOpacity
        key={setting.id}
        style={[
          styles.settingOption,
          isSelected && styles.settingOptionSelected
        ]}
        onPress={() => setSelectedSetting(setting.id)}
        disabled={loading}
      >
        <View style={styles.settingIconContainer}>
          <Ionicons 
            name={setting.icon} 
            size={24} 
            color={isSelected ? colors.white : setting.color} 
          />
        </View>
        
        <View style={styles.settingTextContainer}>
          <Text style={[
            styles.settingTitle,
            isSelected && styles.settingTitleSelected
          ]}>
            {setting.title}
          </Text>
          <Text style={[
            styles.settingDescription,
            isSelected && styles.settingDescriptionSelected
          ]}>
            {setting.description}
          </Text>
        </View>
        
        <View style={styles.radioContainer}>
          <View style={[
            styles.radioOuter,
            isSelected && styles.radioOuterSelected
          ]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
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
        colors={['#1A1A1F', '#2D2D35']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Disappearing Messages</Text>
            
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Choose when messages should disappear in this chat. This setting only affects new messages sent after making this change.
              </Text>
            </View>

            <View style={styles.settingsContainer}>
              {settings.map(renderSettingOption)}
            </View>

            <View style={styles.warningContainer}>
              <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Existing messages will not be affected by this change.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  infoContainer: {
    marginBottom: theme.spacing.xl,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingsContainer: {
    marginBottom: theme.spacing.xl,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  settingOptionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: colors.primary,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: theme.spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingTitleSelected: {
    color: colors.white,
  },
  settingDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  settingDescriptionSelected: {
    color: colors.textSecondary,
  },
  radioContainer: {
    marginLeft: theme.spacing.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

export default DisappearingMessagesModal; 