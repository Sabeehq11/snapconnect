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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useChats } from '../hooks/useChat';
import { colors, theme } from '../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { chatId, chatName } = route.params;
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(chatId);
  const { markChatAsRead } = useChats();
  const [newMessage, setNewMessage] = useState('');
  const [viewingMessage, setViewingMessage] = useState(null);
  const [viewTimer, setViewTimer] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: chatName,
      headerShown: true,
      headerStyle: {
        backgroundColor: '#1A1A1F',
      },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        color: colors.textPrimary,
        fontWeight: theme.typography.fontWeights.semibold,
      },
    });

    // Mark chat as read when entering
    if (chatId) {
      markChatAsRead(chatId);
    }
  }, [navigation, chatName, chatId, markChatAsRead]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const ensureUserExists = async () => {
    if (!user) return false;

    try {
      const { supabase } = require('../../lib/supabase');
      
      // Check if user exists in users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingUser) {
        return true; // User already exists
      }

      // If user doesn't exist, create the user record
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            display_name: user.displayName || user.email?.split('@')[0] || 'User',
            username: user.username || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            created_at: new Date().toISOString(),
            friends: [],
            snap_score: 0
          }
        ]);

      if (insertError) {
        console.error('Error creating user record:', insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      return false;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Ensure user exists in users table before sending message
      const userExists = await ensureUserExists();
      if (!userExists) {
        Alert.alert('Error', 'Unable to verify user profile. Please try again.');
        return;
      }

      await sendMessage(newMessage.trim());
      setNewMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
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
    const isImageMessage = item.message_type === 'image';
    
    if (isDisappeared && !isOwnMessage) {
      return null; // Don't show disappeared messages to other users
    }

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isImageMessage && styles.imageMessageContainer
        ]}
        onPress={() => handleViewMessage(item)}
        disabled={isOwnMessage}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isOwnMessage ? colors.gradients.primary : colors.gradients.card}
          style={[
            styles.messageBubble,
            isDisappeared && styles.disappearedMessage,
            isImageMessage && styles.imageBubble
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isDisappeared ? (
            <Text style={styles.disappearedText}>
              {isOwnMessage ? '👁️ Viewed' : 'Message disappeared'}
            </Text>
          ) : isImageMessage ? (
            <View style={styles.imageMessageContent}>
              <Image
                source={{ uri: item.media_url }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                {!isOwnMessage && (
                  <Text style={styles.tapToViewImage}>📸 Tap to view snap</Text>
                )}
                <Text style={styles.imageCaption}>{item.content}</Text>
              </View>
            </View>
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

  // Calculate bottom padding based on keyboard and safe area
  const bottomPadding = Math.max(keyboardHeight, insets.bottom);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colors.gradients.dark}
          style={styles.backgroundGradient}
        >
          <KeyboardAvoidingView 
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={[
                styles.messagesContainer,
                { 
                  paddingBottom: 80 + bottomPadding, // Extra padding for input area
                }
              ]}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
            
            {/* Input Container - Fixed at bottom */}
            <View style={[
              styles.inputContainer,
              {
                paddingBottom: bottomPadding,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              }
            ]}>
              <LinearGradient
                colors={colors.gradients.card}
                style={styles.inputWrapper}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TextInput
                  ref={textInputRef}
                  style={styles.textInput}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                  blurOnSubmit={false}
                  onFocus={() => {
                    // Scroll to bottom when input is focused
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={newMessage.trim() ? colors.gradients.primary : colors.gradients.muted}
                    style={styles.sendButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.sendButtonText}>➤</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>

        {/* Message Viewer Modal */}
        <Modal
          transparent={true}
          visible={!!viewingMessage}
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
                {viewingMessage?.message_type === 'image' ? (
                  <View style={styles.fullScreenImageContainer}>
                    <Image
                      source={{ uri: viewingMessage.media_url }}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                    <View style={styles.fullScreenImageOverlay}>
                      <Text style={styles.fullScreenImageCaption}>
                        {viewingMessage.content}
                      </Text>
                      <Text style={styles.fullScreenSender}>
                        From: {viewingMessage?.sender?.display_name || 'Unknown'}
                      </Text>
                      {viewingMessage.disappear_after_seconds && (
                        <Text style={styles.disappearWarning}>
                          This snap will disappear in {viewingMessage.disappear_after_seconds} seconds
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
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
                )}
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1F',
  },
  keyboardContainer: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: theme.spacing.md,
    flexGrow: 1,
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
    paddingTop: theme.spacing.sm,
    backgroundColor: '#1A1A1F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    minHeight: 56,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    color: colors.white,
    fontSize: theme.typography.fontSizes.md,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    minWidth: 50,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: 18,
    textAlign: 'center',
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
  // Image message styles
  imageMessageContainer: {
    marginBottom: theme.spacing.md,
  },
  imageBubble: {
    padding: 4,
    maxWidth: width * 0.65,
  },
  imageMessageContent: {
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  messageImage: {
    width: width * 0.6,
    height: width * 0.6 * 0.75, // 4:3 aspect ratio
    borderRadius: theme.borderRadius.lg,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.sm,
  },
  tapToViewImage: {
    color: colors.white,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
    marginBottom: 2,
  },
  imageCaption: {
    color: colors.white,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
  },
  // Full screen image styles
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  fullScreenImageOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  fullScreenImageCaption: {
    color: colors.white,
    fontSize: theme.typography.fontSizes.lg,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default ChatScreen; 