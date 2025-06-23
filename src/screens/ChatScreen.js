import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { colors, theme } from '../utils/colors';

const { width } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { chatId, chatName } = route.params;
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(chatId);
  const [newMessage, setNewMessage] = useState('');
  const [viewingMessage, setViewingMessage] = useState(null);
  const [viewTimer, setViewTimer] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: chatName,
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.dark,
      },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        color: colors.textPrimary,
        fontWeight: theme.typography.fontWeights.semibold,
      },
    });
  }, [navigation, chatName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleViewMessage = async (message) => {
    if (message.sender_id === user.id) {
      // Users can always view their own messages
      return;
    }

    if (message.is_disappeared) {
      Alert.alert('Message Disappeared', 'This message is no longer available');
      return;
    }

    // Update view count and viewed_by
    try {
      const { supabase } = require('../../lib/supabase');
      
      const viewedBy = message.viewed_by || [];
      const userAlreadyViewed = viewedBy.some(view => view.user_id === user.id);
      
      if (!userAlreadyViewed) {
        const newViewedBy = [...viewedBy, {
          user_id: user.id,
          viewed_at: new Date().toISOString()
        }];

        await supabase
          .from('messages')
          .update({
            view_count: message.view_count + 1,
            viewed_by: newViewedBy
          })
          .eq('id', message.id);
      }

      // Show the message in full screen
      setViewingMessage(message);

      // Start disappear timer
      const timer = setTimeout(() => {
        startDisappearAnimation();
      }, message.disappear_after_seconds * 1000);
      
      setViewTimer(timer);

    } catch (error) {
      console.error('Error updating message view:', error);
      Alert.alert('Error', 'Failed to view message');
    }
  };

  const startDisappearAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setViewingMessage(null);
      fadeAnim.setValue(1);
    });
  };

  const closeMessageView = () => {
    if (viewTimer) {
      clearTimeout(viewTimer);
      setViewTimer(null);
    }
    setViewingMessage(null);
    fadeAnim.setValue(1);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender_id === user.id;
    const isDisappeared = item.is_disappeared;
    
    if (isDisappeared && !isOwnMessage) {
      return null; // Don't show disappeared messages to other users
    }

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}
        onPress={() => handleViewMessage(item)}
        disabled={isOwnMessage}
      >
        <LinearGradient
          colors={isOwnMessage ? colors.gradients.primary : colors.gradients.card}
          style={[
            styles.messageBubble,
            isDisappeared && styles.disappearedMessage
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isDisappeared ? (
            <Text style={styles.disappearedText}>
              {isOwnMessage ? '👁️ Viewed' : 'Message disappeared'}
            </Text>
          ) : (
            <>
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {item.content}
              </Text>
              {!isOwnMessage && (
                <Text style={styles.tapToView}>Tap to view</Text>
              )}
            </>
          )}
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
            ]}>
              {formatTimestamp(item.created_at)}
            </Text>
            {isOwnMessage && item.view_count > 0 && (
              <Text style={styles.viewCount}>
                {item.view_count} view{item.view_count > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const filteredMessages = messages.filter(msg => 
    msg.sender_id === user.id || !msg.is_disappeared
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.backgroundGradient}
      >
        <FlatList
          ref={flatListRef}
          data={filteredMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <LinearGradient
            colors={colors.gradients.card}
            style={styles.inputWrapper}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <LinearGradient
                colors={newMessage.trim() ? colors.gradients.primary : [colors.border, colors.border]}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.sendButtonText}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Full screen message viewer */}
        <Modal
          visible={!!viewingMessage}
          transparent={true}
          animationType="fade"
          onRequestClose={closeMessageView}
        >
          <Animated.View style={[styles.messageViewer, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={colors.gradients.dark}
              style={styles.messageViewerGradient}
            >
              <TouchableOpacity 
                style={styles.messageViewerOverlay}
                onPress={closeMessageView}
              >
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.fullScreenMessage}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.fullScreenMessageText}>
                    {viewingMessage?.content}
                  </Text>
                  <Text style={styles.fullScreenSender}>
                    From: {viewingMessage?.sender?.display_name || 'Unknown'}
                  </Text>
                  <Text style={styles.disappearWarning}>
                    This message will disappear in {viewingMessage?.disappear_after_seconds} seconds
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
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
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: theme.spacing.md,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  disappearedMessage: {
    opacity: 0.6,
  },
  messageText: {
    fontSize: theme.typography.fontSizes.md,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  ownMessageText: {
    color: colors.textPrimary,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  disappearedText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: theme.typography.fontSizes.sm,
  },
  tapToView: {
    color: colors.accent,
    fontSize: theme.typography.fontSizes.xs,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.fontSizes.xs,
  },
  ownTimestamp: {
    color: colors.textSecondary,
  },
  otherTimestamp: {
    color: colors.textMuted,
  },
  viewCount: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.accent,
    fontWeight: theme.typography.fontWeights.medium,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.lg,
  },
  messageViewer: {
    flex: 1,
  },
  messageViewerGradient: {
    flex: 1,
  },
  messageViewerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: colors.overlayDark,
  },
  fullScreenMessage: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  fullScreenMessageText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.xl,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 28,
    fontWeight: theme.typography.fontWeights.medium,
  },
  fullScreenSender: {
    color: colors.accent,
    fontSize: theme.typography.fontSizes.md,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  disappearWarning: {
    color: colors.error,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatScreen; 