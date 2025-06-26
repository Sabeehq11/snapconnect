import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import RAGService from '../utils/ragService';
import { useAuth } from '../context/AuthContext';

const RAGCaptionSuggestor = ({ 
  visible, 
  onClose, 
  onSelectCaption, 
  contentType = 'study_group',
  imageContext = '' 
}) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      console.log('🤖 RAG Caption Modal: Opened, starting suggestion generation');
      generateSuggestions();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, contentType]);

  // Add effect to monitor suggestions state changes
  useEffect(() => {
    console.log('🔍 RAG Caption Modal: Suggestions state updated:', {
      suggestionsCount: suggestions.length,
      loading,
      suggestions: suggestions.slice(0, 3) // Log first 3 for debugging
    });
  }, [suggestions, loading]);

  const generateSuggestions = async () => {
    if (!user?.id) {
      console.warn('⚠️ RAG Caption Modal: No user ID available');
      return;
    }
    
    setLoading(true);
    setSuggestions([]); // Clear previous suggestions
    
    try {
      console.log('🤖 RAG Caption Suggestor: Generating suggestions for', contentType);
      
      let ragSuggestions = [];
      
      switch (contentType) {
        case 'study_group':
          ragSuggestions = await RAGService.generateStudyGroupCaptions(user.id, imageContext);
          break;
        case 'academic_stress':
          ragSuggestions = await RAGService.generateAcademicContent(user.id, 'stress');
          break;
        case 'campus_event':
          ragSuggestions = await RAGService.generateEventPrompts(user.id, 'campus_event');
          break;
        case 'trending':
          ragSuggestions = await RAGService.generateTrendingContent(user.id);
          break;
        default:
          ragSuggestions = await RAGService.generateStudyGroupCaptions(user.id, imageContext);
      }
      
      console.log('✅ RAG Caption Modal: Received suggestions:', ragSuggestions);
      setSuggestions(ragSuggestions || []);
      console.log('✅ RAG Caption Suggestor: Generated', ragSuggestions?.length || 0, 'suggestions');
    } catch (error) {
      console.error('❌ RAG Caption Suggestor: Error generating suggestions:', error);
      // Set fallback suggestions on error
      const fallbackSuggestions = [
        "AI-powered caption coming soon! 🤖✨",
        "Your study squad is legendary! 📚👥",
        "Making memories one snap at a time 📸💫",
        "College vibes with the best crew 🎓✨",
        "Study session turned photo session 📱📚"
      ];
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCaption = (caption) => {
    console.log('✅ RAG Caption Modal: Caption selected:', caption);
    setSelectedIndex(suggestions.indexOf(caption));
    setTimeout(() => {
      onSelectCaption(caption);
      onClose();
      setSelectedIndex(-1);
    }, 200);
  };

  const handleRefresh = () => {
    console.log('🔄 RAG Caption Suggestor: Refreshing suggestions');
    generateSuggestions();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#1A1A1F', '#2A2A3F']}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.aiIcon}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.aiIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>AI Caption Suggestions</Text>
                  <Text style={styles.subtitle}>
                    Personalized for college students
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366F1" />
                  <Text style={styles.loadingText}>
                    Generating personalized captions...
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    Using your activity and campus trends
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  {/* Debug info */}
                  <Text style={{ color: 'white', fontSize: 12, marginBottom: 10 }}>
                    Debug: {suggestions.length} suggestions, Loading: {loading.toString()}
                  </Text>
                  
                  <ScrollView 
                    style={styles.suggestionsContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {suggestions.length > 0 ? (
                      <>
                        <View style={styles.suggestionsHeader}>
                          <Text style={styles.suggestionsTitle}>
                            Choose a caption that fits your vibe:
                          </Text>
                          <TouchableOpacity 
                            onPress={handleRefresh}
                            style={styles.refreshButton}
                          >
                            <LinearGradient
                              colors={['#10B981', '#059669']}
                              style={styles.refreshGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <Ionicons name="refresh" size={16} color="#FFFFFF" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>

                        {suggestions.map((suggestion, index) => (
                          <TouchableOpacity
                            key={`suggestion-${index}`}
                            style={[
                              styles.suggestionItem,
                              selectedIndex === index && styles.suggestionItemSelected,
                            ]}
                            onPress={() => handleSelectCaption(suggestion)}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={
                                selectedIndex === index
                                  ? ['#6366F1', '#8B5CF6']
                                  : ['#2A2A3F', '#3A3A5F']
                              }
                              style={styles.suggestionGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <View style={styles.suggestionContent}>
                                <Text style={styles.suggestionText}>
                                  {suggestion}
                                </Text>
                                <View style={styles.suggestionMeta}>
                                  <Ionicons 
                                    name="sparkles" 
                                    size={12} 
                                    color="rgba(255, 255, 255, 0.6)" 
                                  />
                                  <Text style={styles.suggestionLabel}>
                                    AI Generated
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}

                        <View style={styles.disclaimer}>
                          <Text style={styles.disclaimerText}>
                            ✨ Powered by AI • Personalized for your campus experience
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.emptySuggestions}>
                        <Ionicons name="bulb-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                        <Text style={styles.emptyTitle}>No suggestions available</Text>
                        <Text style={styles.emptySubtitle}>
                          Try again later or check your connection
                        </Text>
                        <TouchableOpacity 
                          onPress={handleRefresh}
                          style={styles.retryButton}
                        >
                          <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            style={styles.retryGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Text style={styles.retryText}>Try Again</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    marginRight: 12,
  },
  aiIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  refreshButton: {
    marginLeft: 12,
  },
  refreshGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionItem: {
    marginBottom: 16,
  },
  suggestionItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  suggestionGradient: {
    borderRadius: 16,
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  suggestionContent: {
    flexDirection: 'column',
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 12,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
    fontWeight: '500',
  },
  disclaimer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  emptySuggestions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  retryGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RAGCaptionSuggestor; 