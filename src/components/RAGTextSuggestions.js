import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { RAGService } from '../utils/ragService';
import { useAuth } from '../context/AuthContext';

const RAGTextSuggestions = ({ 
  visible, 
  onClose, 
  onSelectSuggestion,
  chatContext = {},
  recentMessages = []
}) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionType, setSuggestionType] = useState('general');

  const suggestionTypes = [
    { id: 'general', title: 'General', icon: '💬', color: colors.primary },
    { id: 'friendly', title: 'Friendly', icon: '😊', color: colors.success },
    { id: 'study', title: 'Study', icon: '📚', color: colors.warning },
    { id: 'hangout', title: 'Hang Out', icon: '🎉', color: colors.accent },
    { id: 'check_in', title: 'Check In', icon: '❤️', color: colors.error },
  ];

  useEffect(() => {
    if (visible) {
      generateSuggestions();
    }
  }, [visible, suggestionType]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const context = {
        chatType: suggestionType,
        recentMessages: recentMessages.slice(0, 5),
        friendName: chatContext.friendName || 'your friend',
        isGroupChat: chatContext.isGroupChat || false,
        timeOfDay: getTimeOfDay(),
        ...chatContext
      };

      const textSuggestions = await RAGService.generateTextSuggestions(user.id, context);
      setSuggestions(textSuggestions);
    } catch (error) {
      console.error('Error generating text suggestions:', error);
      // Fallback suggestions
      setSuggestions(getFallbackSuggestions(suggestionType));
    } finally {
      setLoading(false);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getFallbackSuggestions = (type) => {
    const fallbacks = {
      general: [
        "Hey! How's your day going?",
        "What's up? Hope you're doing well!",
        "Hey there! How are things?",
        "Hi! What are you up to today?",
        "Hope you're having a great day!"
      ],
      friendly: [
        "Thinking of you! Hope your day is awesome 😊",
        "Hey bestie! Miss hanging out with you",
        "You're amazing! Just wanted to remind you ✨",
        "Hope you're crushing whatever you're working on!",
        "Sending good vibes your way! 🌟"
      ],
      study: [
        "How's the studying going? Need a study buddy?",
        "Want to hit the library together later?",
        "How did that exam go? Hope it went well!",
        "Need help with any assignments?",
        "Ready for some intense study sessions? 📚"
      ],
      hangout: [
        "Want to grab coffee and catch up?",
        "Movie night tonight? I'll bring the snacks!",
        "Free this weekend? Let's do something fun!",
        "Beach day? The weather looks perfect!",
        "Game night at my place? Bring your A-game! 🎮"
      ],
      check_in: [
        "How are you feeling today? I'm here if you need to talk",
        "Checking in on you! How's everything going?",
        "You've been on my mind. How are you doing?",
        "Just wanted to see how you're holding up",
        "Thinking of you! Let me know if you need anything ❤️"
      ]
    };
    return fallbacks[type] || fallbacks.general;
  };

  const handleSuggestionPress = (suggestion) => {
    onSelectSuggestion(suggestion);
    onClose();
  };

  const handleTypePress = (type) => {
    setSuggestionType(type.id);
  };

  const renderSuggestionType = (type) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeButton,
        suggestionType === type.id && styles.activeTypeButton
      ]}
      onPress={() => handleTypePress(type)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={suggestionType === type.id 
          ? [type.color, `${type.color}90`]
          : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
        }
        style={styles.typeButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.typeIcon}>{type.icon}</Text>
        <Text style={[
          styles.typeTitle,
          suggestionType === type.id && styles.activeTypeTitle
        ]}>
          {type.title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSuggestion = (suggestion, index) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionCard}
      onPress={() => handleSuggestionPress(suggestion)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
        style={styles.suggestionCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.suggestionText}>{suggestion}</Text>
        <View style={styles.suggestionIcon}>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1A1A1F', '#2A2A35']}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="chatbubbles" size={24} color={colors.primary} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>AI Text Suggestions</Text>
                  <Text style={styles.headerSubtitle}>Perfect messages for any situation</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Suggestion Types */}
            <View style={styles.typesContainer}>
              <Text style={styles.typesTitle}>Choose a style:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typesList}
              >
                {suggestionTypes.map(renderSuggestionType)}
              </ScrollView>
            </View>

            {/* Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>
                {suggestionTypes.find(t => t.id === suggestionType)?.title} Messages:
              </Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Generating suggestions...</Text>
                </View>
              ) : (
                <ScrollView 
                  style={styles.suggestionsList}
                  showsVerticalScrollIndicator={false}
                >
                  {suggestions.map(renderSuggestion)}
                </ScrollView>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={generateSuggestions}
                disabled={loading}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.refreshButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="refresh" size={16} color={colors.white} />
                  <Text style={styles.refreshButtonText}>New Suggestions</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// Add new method to RAGService
RAGService.generateTextSuggestions = async function(userId, context) {
  try {
    console.log('🤖 RAG: Generating context-aware text suggestions for user', userId);
    
    const userContext = await this.getUserContext(userId);
    if (!userContext) throw new Error('Could not retrieve user context');

    // Get the most recent message from someone else (not the current user) for context-aware responses
    // Since messages are ordered oldest to newest, we need to search backwards from the end
    const lastMessage = context.recentMessages && context.recentMessages.length > 0 
      ? [...context.recentMessages].reverse().find(msg => msg.sender_id !== userId)
      : null;

    let prompt = `You are helping ${userContext.user.displayName || 'a college student'} write natural replies to their friend${context.isGroupChat ? 's' : ''}. 

Context:
- Message type: ${context.chatType}
- Time of day: ${context.timeOfDay}
- Friend name: ${context.friendName}
- Is group chat: ${context.isGroupChat}
- Recent conversation: ${context.recentMessages.slice(0, 3).map(m => `"${m.content}"`).join(' → ')}

${lastMessage ? `MOST RECENT MESSAGE TO RESPOND TO: "${lastMessage.content}"

Generate 5 natural, contextual replies that directly respond to "${lastMessage.content}" while matching the ${context.chatType} style.` : `Generate 5 natural conversation starters that match the ${context.chatType} style.`}

Make the suggestions:
- Directly relevant to the last message${lastMessage ? ` ("${lastMessage.content}")` : ''}
- Authentic college student responses
- Appropriate for the ${context.chatType} context
- Varied in tone and length
- Natural conversation flow
- Include relevant emojis sparingly

Message type guidelines:
- general: Natural, contextual responses to what was said
- friendly: Warm, caring responses that show genuine interest  
- study: Academic-focused replies, study help, or exam support
- hangout: Fun, social responses suggesting activities or showing enthusiasm
- check_in: Supportive, empathetic responses showing care

${lastMessage ? `Examples of good contextual responses:
- If they asked "how was your day?" → "Pretty good! Just got back from class, how about you?"
- If they said "stressed about the exam" → "I totally get that! Want to study together?"
- If they shared good news → "That's awesome! So happy for you!"
- If they suggested plans → "Count me in! That sounds fun"` : ''}

Return only the 5 messages, one per line, without numbering or quotes.`;

    const response = await this.callOpenAI(prompt, 0.8, 350);
    
    const suggestions = response
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().replace(/^["']|["']$/g, ''))
      .filter(line => line.length > 0)
      .slice(0, 5);

    return suggestions.length > 0 ? suggestions : this.getFallbackContextualSuggestions(context, userId);
  } catch (error) {
    console.error('❌ RAG: Error generating context-aware suggestions:', error);
    return this.getFallbackContextualSuggestions(context, userId);
  }
};

// Add fallback method for context-aware suggestions
RAGService.getFallbackContextualSuggestions = function(context, userId) {
  // Find the most recent message from someone else (not the current user)
  // Since messages are ordered oldest to newest, we need to search backwards from the end
  const lastMessage = context.recentMessages && context.recentMessages.length > 0 
    ? [...context.recentMessages].reverse().find(msg => msg.sender_id !== userId)
    : null;

  if (lastMessage) {
    const msgLower = lastMessage.content.toLowerCase();
    
    // Context-aware fallback responses
    if (msgLower.includes('hey') && msgLower.includes('what') && msgLower.includes('going')) {
      return [
        "Hey! Not much, just chilling. What about you?",
        "Hey there! Just studying and hanging out. How's it going?",
        "Hi! Nothing too crazy, just the usual college stuff 😊",
        "Hey! Just relaxing. What's up with you?",
        "Hey! Same old, same old. What are you up to?"
      ];
    } else if (msgLower.includes('what') && msgLower.includes('going')) {
      return [
        "Not much, just chilling! What about you?",
        "Just studying and hanging out. How about you?",
        "Nothing too crazy, just the usual college stuff 😊",
        "Just relaxing! What's up with you?",
        "Same old, same old! What are you up to?"
      ];
    } else if (msgLower.includes('how') && (msgLower.includes('day') || msgLower.includes('going'))) {
      return [
        "Pretty good! Just got back from class, how about you?",
        "It's been a solid day! Thanks for asking 😊",
        "Not bad at all! What about yours?",
        "Going well so far! Hope yours is too",
        "Can't complain! How's everything with you?"
      ];
    } else if (msgLower.includes('stress') || msgLower.includes('exam') || msgLower.includes('test')) {
      return [
        "I totally get that! Want to study together?",
        "Exam stress is real 😩 You've got this though!",
        "Been there! Let me know if you need help",
        "Ugh same here. Coffee study session later?",
        "You're gonna crush it! Believe in yourself 💪"
      ];
    } else if (msgLower.includes('hang') || msgLower.includes('free') || msgLower.includes('plans')) {
      return [
        "Count me in! That sounds fun",
        "I'm down! What did you have in mind?",
        "Sounds great! When were you thinking?",
        "Yes! I could use a break anyway",
        "Perfect timing! Let's do it 🎉"
      ];
    } else if (msgLower.includes('good') || msgLower.includes('great') || msgLower.includes('awesome')) {
      return [
        "That's awesome! So happy for you!",
        "Yay! Love hearing good news 😊",
        "That's amazing! Tell me more!",
        "So excited for you! 🎉",
        "That made my day! Great job!"
      ];
    } else if (msgLower.startsWith('hey') || msgLower.startsWith('hi')) {
      return [
        "Hey! How's it going?",
        "Hi there! What's up?",
        "Hey! Good to hear from you 😊",
        "Hi! How are you doing?",
        "Hey! Hope you're having a good day!"
      ];
    }
  }

  // Default fallback by message type
  const fallbacks = {
    general: [
      "Hey! How's your day going?",
      "What's up? Hope you're doing well!",
      "Hey there! How are things?",
      "Hi! What are you up to today?",
      "Hope you're having a great day!"
    ],
    friendly: [
      "Thinking of you! Hope your day is awesome 😊",
      "Hey bestie! Miss hanging out with you",
      "You're amazing! Just wanted to remind you ✨",
      "Hope you're crushing whatever you're working on!",
      "Sending good vibes your way! 🌟"
    ],
    study: [
      "How's the studying going? Need a study buddy?",
      "Want to hit the library together later?",
      "How did that exam go? Hope it went well!",
      "Need help with any assignments?",
      "Ready for some intense study sessions? 📚"
    ],
    hangout: [
      "Want to grab coffee and catch up?",
      "Movie night tonight? I'll bring the snacks!",
      "Free this weekend? Let's do something fun!",
      "Beach day? The weather looks perfect!",
      "Game night at my place? Bring your A-game! 🎮"
    ],
    check_in: [
      "How are you feeling today? I'm here if you need to talk",
      "Checking in on you! How's everything going?",
      "You've been on my mind. How are you doing?",
      "Just wanted to see how you're holding up",
      "Thinking of you! Let me know if you need anything ❤️"
    ]
  };
  
  return fallbacks[context.chatType] || fallbacks.general;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typesContainer: {
    marginBottom: 20,
  },
  typesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  typesList: {
    paddingRight: 20,
  },
  typeButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeTypeButton: {
    transform: [{ scale: 1.05 }],
  },
  typeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 100,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTypeTitle: {
    color: colors.white,
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
    lineHeight: 22,
  },
  suggestionIcon: {
    marginLeft: 12,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  refreshButton: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 160,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default RAGTextSuggestions; 