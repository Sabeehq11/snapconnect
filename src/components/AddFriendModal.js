import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../hooks/useFriends';
import { colors, theme } from '../utils/colors';

const AddFriendModal = ({ visible, onClose }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { sendFriendRequest } = useFriends();

  const handleSendRequest = async () => {
    if (!emailOrUsername.trim()) {
      Alert.alert('Error', 'Please enter an email or username');
      return;
    }

    setSending(true);
    try {
      const result = await sendFriendRequest(emailOrUsername.trim(), message.trim() || null);
      
      if (result.success) {
        Alert.alert(
          '🎉 Friend Request Sent!',
          `Friend request sent to ${result.receiver.display_name || result.receiver.username}`,
          [{ text: 'Awesome!', onPress: () => {
            setEmailOrUsername('');
            setMessage('');
            onClose();
          }}]
        );
      } else {
        Alert.alert('Oops!', result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={colors.gradients.dark}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="person-add" size={24} color={colors.white} />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Add Friend</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                disabled={sending}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.closeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Ionicons name="at" size={16} color={colors.textSecondary} />
                  <Text style={styles.label}>Email or Username</Text>
                </View>
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={colors.gradients.card}
                    style={styles.inputGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TextInput
                      style={styles.input}
                      value={emailOrUsername}
                      onChangeText={setEmailOrUsername}
                      placeholder="friend@example.com or @username"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!sending}
                    />
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Ionicons name="chatbubble-ellipses" size={16} color={colors.textSecondary} />
                  <Text style={styles.label}>Personal Message</Text>
                  <Text style={styles.optionalLabel}>(Optional)</Text>
                </View>
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={colors.gradients.card}
                    style={styles.inputGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TextInput
                      style={[styles.input, styles.messageInput]}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Hey! Let's connect on SnapConnect 📸"
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                      editable={!sending}
                      textAlignVertical="top"
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.charCount}>{message.length}/200</Text>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendRequest}
                disabled={!emailOrUsername.trim() || sending}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={(!emailOrUsername.trim() || sending) ? 
                    [colors.textMuted, colors.textMuted] : 
                    colors.gradients.accent
                  }
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {sending ? (
                    <View style={styles.sendingContainer}>
                      <ActivityIndicator color={colors.white} size="small" />
                      <Text style={styles.sendButtonText}>Sending...</Text>
                    </View>
                  ) : (
                    <View style={styles.sendingContainer}>
                      <Ionicons name="paper-plane" size={18} color={colors.white} />
                      <Text style={styles.sendButtonText}>Send Friend Request</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoContainer}>
              <LinearGradient
                colors={colors.gradients.card}
                style={styles.infoCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.infoIcon}>
                  <LinearGradient
                    colors={colors.gradients.secondary}
                    style={styles.infoIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="information" size={16} color={colors.white} />
                  </LinearGradient>
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>How it works</Text>
                  <Text style={styles.infoText}>
                    Search by email or username to connect with classmates. They'll get a notification to accept your request!
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  modalContent: {
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  inputContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  inputGradient: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageInput: {
    height: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  optionalLabel: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
  },
  charCount: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'right',
  },
  sendButton: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  sendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
  },
  infoContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  infoCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    padding: theme.spacing.md,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: 18,
  },
});

export default AddFriendModal; 