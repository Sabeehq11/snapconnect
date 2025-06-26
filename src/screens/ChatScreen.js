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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useChats } from '../hooks/useChat';
import { colors, theme } from '../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import ImageWithFallback from '../components/ImageWithFallback';
import QuickDiagnosticsPanel from '../components/QuickDiagnosticsPanel';
import { runFullCleanup } from '../utils/runCleanup';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { chatId, chatName, isGroupChat = false, participants = [] } = route.params || {};
  const { user } = useAuth();
  const { messages, loading, sendMessage, clearChatHistory, deleteMessage } = useChat(chatId);
  const { markChatAsRead } = useChats();
  const [newMessage, setNewMessage] = useState('');
  const [viewingMessage, setViewingMessage] = useState(null);
  const [viewTimer, setViewTimer] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const insets = useSafeAreaInsets();

  const handleChatOptions = () => {
    const options = ['Clear Chat History', 'Cancel'];
    if (!isGroupChat) {
      options.unshift('View Profile');
    }
    
    Alert.alert(
      'Chat Options',
      '',
      options.map((option, index) => ({
        text: option,
        style: option === 'Cancel' ? 'cancel' : option === 'Clear Chat History' ? 'destructive' : 'default',
        onPress: () => {
          if (option === 'View Profile') {
            handleViewProfile();
          } else if (option === 'Clear Chat History') {
            handleClearHistory();
          }
        }
      }))
    );
  };

  const handleViewProfile = () => {
    // For now, show basic info - can be expanded later
    const otherParticipant = participants.find(p => p.id !== user.id);
    if (otherParticipant) {
      Alert.alert(
        'Profile',
        `Name: ${otherParticipant.display_name || otherParticipant.username}\nEmail: ${otherParticipant.email}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearChatHistory();
              Alert.alert('Success', 'Chat history cleared');
            } catch (error) {
              console.error('Clear history error:', error);
              Alert.alert('Error', 'Failed to clear chat history');
            }
          }
        }
      ]
    );
  };

  const handleDeleteMessage = (message) => {
    // Only allow deleting own messages
    if (message.sender_id !== user.id) {
      Alert.alert('Error', 'You can only delete your own messages');
      return;
    }

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(message.id);
              // Message will be automatically removed from UI by the deleteMessage function
            } catch (error) {
              console.error('Delete message error:', error);
              Alert.alert('Error', error.message || 'Failed to delete message');
            }
          }
        }
      ]
    );
  };

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
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={handleChatOptions}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      ),
    });

    // Mark chat as read when entering
    if (chatId) {
      markChatAsRead(chatId);
    }
  }, [navigation, chatName, chatId, markChatAsRead, isGroupChat, participants]);

  // Run cleanup once when screen loads
  useEffect(() => {
    const runCleanupOnLoad = async () => {
      try {
        console.log('🧹 Running automatic cleanup on ChatScreen load...');
        await runFullCleanup();
      } catch (error) {
        console.error('❌ Auto-cleanup failed:', error);
      }
    };

    runCleanupOnLoad();
  }, []); // Only run once when component mounts

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

  const handleCameraPress = () => {
    navigation.navigate('MainTabs', { 
      screen: 'Camera', 
      params: { chatId, chatName }
    });
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

  // Helper function to get proper public URL
  const getImageUrl = async (mediaUrl, messageId) => {
    try {
      console.log('🖼️ Processing image URL for message:', messageId, 'URL:', mediaUrl);
      
      // If it's already a full URL, return as is
      if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
        console.log('✅ Using existing public URL:', mediaUrl);
        return mediaUrl;
      }
      
      // If it's a file path, generate public URL
      if (mediaUrl && !mediaUrl.startsWith('http')) {
        console.log('🔄 Generating public URL for file path:', mediaUrl);
        const { data: publicData } = supabase.storage
          .from('media')
          .getPublicUrl(mediaUrl);
        
        console.log('🔗 Generated public URL:', publicData.publicUrl);
        return publicData.publicUrl;
      }
      
      console.warn('⚠️ Invalid media URL format:', mediaUrl);
      return null;
    } catch (error) {
      console.error('❌ Error processing image URL:', error);
      return null;
    }
  };

  // Alternative direct URL builder
  const buildDirectUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    
    // If already a full URL, use it
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }
    
    // Manually construct the public URL
    // Format: https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/path
    const supabaseUrl = supabase.supabaseUrl;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${mediaUrl}`;
    console.log('🔨 Built direct URL:', publicUrl);
    return publicUrl;
  };



  const renderMessage = ({ item }) => {
    if (!item || !item.id) {
      return null;
    }
    
    const isOwnMessage = item.sender_id === user?.id;
    const isDisappeared = item.is_disappeared;
    const isImageMessage = item.message_type === 'image';
    const isSystemMessage = item.message_type === 'system';
    
    if (isDisappeared && !isOwnMessage) {
      return null; // Don't show disappeared messages to other users
    }

    // System messages (like group creation notifications)
    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isImageMessage && styles.imageMessageContainer
        ]}
        onPress={() => handleViewMessage(item)}
        onLongPress={isOwnMessage ? () => handleDeleteMessage(item) : undefined}
        disabled={isOwnMessage && !isImageMessage}
        activeOpacity={0.8}
      >
        {/* Show sender name in group chats for non-own messages */}
        {isGroupChat && !isOwnMessage && (
          <Text style={styles.senderName}>
            {item.sender?.display_name || item.sender?.username || item.sender?.email || 'Unknown User'}
          </Text>
        )}
        
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
              <ImageWithFallback
                mediaUrl={item.media_url}
                messageId={item.id}
                style={styles.messageImage}
                resizeMode="cover"
                onError={(error) => console.log('❌ Image failed for message:', item.id, error)}
              >
                <View style={styles.imageOverlay}>
                  {!isOwnMessage && (
                    <Text style={styles.tapToViewImage}>📸 Tap to view snap</Text>
                  )}
                  <Text style={styles.imageCaption}>{item.content}</Text>
                </View>
              </ImageWithFallback>
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
              data={messages || []}
              renderItem={renderMessage}
              keyExtractor={(item) => item?.id || Math.random().toString()}
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
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleCameraPress}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={24} color={colors.primary} />
                </TouchableOpacity>
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
          visible={!!viewingMessage}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeMessageView}
        >
          {viewingMessage && (
            <View style={styles.messageViewer}>
              <TouchableOpacity 
                style={styles.messageViewerTouchArea}
                onPress={closeMessageView}
                activeOpacity={1}
              >
                {viewingMessage.message_type === 'image' ? (
                  <ImageWithFallback
                    mediaUrl={viewingMessage.media_url}
                    messageId={viewingMessage.id}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                    showFallback={true}
                  />
                ) : (
                  <View style={styles.fullScreenMessageContainer}>
                    <Text style={styles.fullScreenMessageText}>
                      {viewingMessage.content}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Close button */}
              <TouchableOpacity 
                style={styles.messageCloseButton}
                onPress={closeMessageView}
              >
                <Ionicons name="close" size={28} color={colors.white} />
              </TouchableOpacity>
              
              {/* Message info */}
              <View style={styles.messageInfo}>
                <Text style={styles.messageInfoText}>
                  From: {viewingMessage?.sender?.display_name || 'Unknown'}
                </Text>
                {viewingMessage.disappear_after_seconds && (
                  <Text style={styles.disappearWarning}>
                    Disappears in {viewingMessage.disappear_after_seconds}s
                  </Text>
                )}
              </View>
            </View>
          )}
        </Modal>

        {/* Diagnostic Panel */}
        {showDiagnostics && (
          <QuickDiagnosticsPanel onClose={() => setShowDiagnostics(false)} />
        )}

        {/* Diagnostic Button - Temporary for debugging */}
        <TouchableOpacity 
          style={styles.diagnosticButton}
          onPress={() => setShowDiagnostics(true)}
        >
          <Text style={styles.diagnosticButtonText}>🔧</Text>
        </TouchableOpacity>
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
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: theme.spacing.sm,
  },
  messageViewer: {
    flex: 1,
    backgroundColor: 'black',
  },
  messageViewerTouchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  messageInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    zIndex: 10,
  },
  messageInfoText: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 4,
  },
  fullScreenMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  imageError: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    color: colors.error,
    fontSize: theme.typography.fontSizes.xl,
    marginBottom: theme.spacing.xs,
  },
  imageErrorSubtext: {
    color: colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    color: colors.primary,
    fontSize: theme.typography.fontSizes.sm,
  },
  // Group chat styles
  senderName: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 8,
    fontWeight: theme.typography.fontWeights.medium,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  systemMessageText: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  // Diagnostic button styles
  diagnosticButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    ...theme.shadows.lg,
  },
  diagnosticButtonText: {
    fontSize: 24,
  },
});

export default ChatScreen; 