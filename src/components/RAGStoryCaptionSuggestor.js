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
import RAGService from '../utils/ragService';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';

const RAGStoryCaptionSuggestor = ({ visible, onClose, onSelectCaption, imageContext = '', storyTag = null }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      console.log('💬 RAG Story Caption: Modal opened, generating captions');
      generateCaptions();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const generateCaptions = async () => {
    if (!user?.id) {
      console.warn('⚠️ RAG Story Caption: No user ID available');
      return;
    }
    
    setLoading(true);
    setSuggestions([]);
    
    try {
      console.log('💬 RAG Story Caption: Generating captions for story post');
      
      // Create context for story captions
      const contextText = `Story post${storyTag ? ` tagged as ${storyTag.label}` : ''}${imageContext ? `. Image context: ${imageContext}` : ''}`;
      
      // Reuse existing RAG caption generation but adapt for stories
      const ragCaptions = await RAGService.generateStudyGroupCaptions(user.id, contextText);
      console.log('✅ RAG Story Caption: Generated captions:', ragCaptions);
      setSuggestions(ragCaptions || []);
      
    } catch (error) {
      console.error('❌ RAG Story Caption: Error generating captions:', error);
      // Set fallback captions on error
      const fallbackCaptions = [
        "Living my best campus life! ✨",
        "Another day, another adventure 📸",
        "Campus vibes hitting different today 🎓",
        "Making memories one snap at a time 💫",
        "This is what college looks like! 🏫"
      ];
      console.log('🔄 RAG Story Caption: Using fallback captions');
      setSuggestions(fallbackCaptions);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCaption = (caption) => {
    console.log('✅ RAG Story Caption: Caption selected:', caption);
    setSelectedIndex(suggestions.indexOf(caption));
    setTimeout(() => {
      onSelectCaption(caption);
      onClose();
      setSelectedIndex(-1);
    }, 200);
  };

  const handleRefresh = () => {
    console.log('🔄 RAG Story Caption: Refreshing captions');
    generateCaptions();
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
                    colors={['#3B82F6', '#1D4ED8']}
                    style={styles.aiIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Story Caption Ideas</Text>
                  <Text style={styles.subtitle}>
                    AI-powered captions for your story
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
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>
                    Generating perfect captions...
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    Based on your style and the content
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <ScrollView 
                    style={styles.suggestionsContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {suggestions.length > 0 ? (
                      <>
                        <View style={styles.suggestionsHeader}>
                          <Text style={styles.suggestionsTitle}>
                            Tap a caption to use it:
                          </Text>
                          <TouchableOpacity 
                            onPress={handleRefresh}
                            style={styles.refreshButton}
                          >
                            <LinearGradient
                              colors={['#8B5CF6', '#7C3AED']}
                              style={styles.refreshGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <Ionicons name="refresh" size={16} color="#FFFFFF" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>

                        {suggestions.map((caption, index) => (
                          <TouchableOpacity
                            key={`caption-${index}`}
                            style={[
                              styles.captionItem,
                              selectedIndex === index && styles.captionItemSelected,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleSelectCaption(caption)}
                          >
                            <LinearGradient
                              colors={selectedIndex === index ? 
                                ['rgba(59, 130, 246, 0.3)', 'rgba(29, 78, 216, 0.3)'] :
                                ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                              }
                              style={styles.captionGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <View style={styles.captionContent}>
                                <Text style={styles.captionText}>
                                  {caption}
                                </Text>
                                <View style={styles.captionActions}>
                                  <Ionicons 
                                    name="chevron-forward" 
                                    size={16} 
                                    color={colors.textSecondary} 
                                  />
                                </View>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}
                      </>
                    ) : (
                      <View style={styles.emptyCaptions}>
                        <Ionicons name="bulb-outline" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No captions available</Text>
                        <Text style={styles.emptySubtext}>Try refreshing or add your own caption</Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Skip Button */}
                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={onClose}
                    >
                      <Text style={styles.skipText}>Skip and post without caption</Text>
                    </TouchableOpacity>
                  </View>
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
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
    color: colors.white,
    flex: 1,
  },
  refreshButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  refreshGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionItem: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  captionItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  captionGradient: {
    padding: 16,
  },
  captionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  captionText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  captionActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCaptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default RAGStoryCaptionSuggestor; 