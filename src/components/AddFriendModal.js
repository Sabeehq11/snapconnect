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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
          'Friend Request Sent!',
          `Friend request sent to ${result.receiver.display_name || result.receiver.username}`,
          [{ text: 'OK', onPress: () => {
            setEmailOrUsername('');
            setMessage('');
            onClose();
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send friend request');
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
      animationType="slide"
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
              <Text style={styles.title}>Add Friend</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                disabled={sending}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Email or Username</Text>
              <TextInput
                style={styles.input}
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                placeholder="Enter email or username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!sending}
              />

              <Text style={styles.label}>Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Add a personal message..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!sending}
              />

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.sendButton, (!emailOrUsername.trim() || sending) && styles.sendButtonDisabled]}
                onPress={handleSendRequest}
                disabled={!emailOrUsername.trim() || sending}
              >
                <LinearGradient
                  colors={(!emailOrUsername.trim() || sending) ? [colors.border, colors.border] : colors.gradients.primary}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {sending ? (
                    <ActivityIndicator color={colors.textPrimary} size="small" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send Friend Request</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💡 You can add friends by their email address or username. They'll receive a notification to accept your request.
              </Text>
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
  closeButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
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
  sendButtonDisabled: {
    opacity: 0.6,
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
  infoText: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: 18,
  },
});

export default AddFriendModal; 