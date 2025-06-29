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
import RAGService from '../utils/ragService';
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