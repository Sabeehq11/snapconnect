import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';
import RAGService from '../utils/ragService';

const AIChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set up navigation header
    navigation.setOptions({
      headerTitle: 'AI Assistant',
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
        <View style={styles.headerRight}>
          <View style={styles.aiIndicator}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.aiIndicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.aiLabel}>AI</Text>
        </View>
      ),
    });

    // Add welcome message
    addWelcomeMessage();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [navigation]);

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: 'welcome-' + Date.now(),
      content: "Hi there! 👋 I'm your AI assistant. I'm here to help with studying, answer questions, give advice, or just chat! What can I help you with today?",
      timestamp: new Date().toISOString(),
      isAI: true,
      type: 'text'
    };
    setMessages([welcomeMessage]);
  };

  const generateAIResponse = async (userMessage, conversationHistory) => {
    try {
      const response = await RAGService.generateAIChatResponse(user.id, userMessage, conversationHistory);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having a bit of trouble right now, but I'm here to help! Could you try asking again? 😊";
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isAI: false,
      type: 'text'
    };

    // Add user message immediately
    setMessages(prev => [userMessage, ...prev]);
    const currentMessage = newMessage.trim();
    setNewMessage('');
    setLoading(true);
    setTyping(true);

    // Scroll to top
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);

    try {
      // Generate AI response with complete conversation history including the just-sent message
      const completeConversationHistory = [userMessage, ...messages];
      const aiResponseContent = await generateAIResponse(currentMessage, completeConversationHistory);
      
      const aiMessage = {
        id: 'ai-' + Date.now(),
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
        isAI: true,
        type: 'text'
      };

      // Add AI response with a slight delay for natural feel
      setTimeout(() => {
        setMessages(prev => [aiMessage, ...prev]);
        setTyping(false);
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      }, 1000);

    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage = {
        id: 'error-' + Date.now(),
        content: "Sorry, I encountered an error. Please try again! 😅",
        timestamp: new Date().toISOString(),
        isAI: true,
        type: 'text'
      };
      
      setTimeout(() => {
        setMessages(prev => [errorMessage, ...prev]);
        setTyping(false);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isAI = item.isAI;
    
    return (
      <View style={[styles.messageContainer, isAI ? styles.aiMessageContainer : styles.userMessageContainer]}>
        <View style={[styles.messageBubble, isAI ? styles.aiMessageBubble : styles.userMessageBubble]}>
          {isAI ? (
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.aiMessageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.aiMessageHeader}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" style={styles.aiMessageIcon} />
                <Text style={styles.aiMessageLabel}>AI Assistant</Text>
              </View>
              <Text style={styles.aiMessageText}>{item.content}</Text>
              <Text style={styles.aiMessageTime}>{formatTimestamp(item.timestamp)}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.userMessageContent}>
              <Text style={styles.userMessageText}>{item.content}</Text>
              <Text style={styles.userMessageTime}>{formatTimestamp(item.timestamp)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!typing) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, styles.aiMessageBubble]}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.aiMessageGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.aiMessageHeader}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" style={styles.aiMessageIcon} />
              <Text style={styles.aiMessageLabel}>AI Assistant</Text>
            </View>
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>Thinking</Text>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '200ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '400ms' }]} />
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <View>
      {renderTypingIndicator()}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            inverted
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderListHeader}
          />

          {/* Input */}
          <View style={styles.inputContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.inputGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TextInput
                style={styles.textInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Ask me anything..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={1000}
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.sendButton, (!newMessage.trim() || loading) && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={newMessage.trim() && !loading ? colors.gradients.primary : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Ionicons 
                      name="send" 
                      size={18} 
                      color={newMessage.trim() ? colors.white : colors.textSecondary} 
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1F',
  },
  content: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  aiIndicator: {
    marginRight: 6,
  },
  aiIndicatorGradient: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiMessageBubble: {
    borderBottomLeftRadius: 6,
  },
  userMessageBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomRightRadius: 6,
  },
  aiMessageGradient: {
    padding: 16,
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiMessageIcon: {
    marginRight: 6,
  },
  aiMessageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  aiMessageText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 22,
    marginBottom: 8,
  },
  aiMessageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
  },
  userMessageContent: {
    padding: 16,
  },
  userMessageText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 22,
    marginBottom: 8,
  },
  userMessageTime: {
    fontSize: 11,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 1,
    opacity: 0.4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
    maxHeight: 100,
    marginRight: 12,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIChatScreen; 