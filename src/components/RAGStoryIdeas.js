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

const RAGStoryIdeas = ({ visible, onClose, onSelectIdea }) => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      console.log('💡 RAG Story Ideas Modal: Opened, starting idea generation');
      generateIdeas();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Add effect to monitor ideas state changes
  useEffect(() => {
    console.log('🔍 RAG Story Ideas Modal: Ideas state updated:', {
      ideasCount: ideas.length,
      loading,
      ideas: ideas.slice(0, 3) // Log first 3 for debugging
    });
  }, [ideas, loading]);

  const generateIdeas = async () => {
    if (!user?.id) {
      console.warn('⚠️ RAG Story Ideas Modal: No user ID available');
      return;
    }
    
    setLoading(true);
    setIdeas([]); // Clear previous ideas
    
    try {
      console.log('💡 RAG Story Ideas: Generating campus story ideas for user', user.id);
      
      const ragIdeas = await RAGService.generateCampusStoryIdeas(user.id);
      console.log('🔍 RAG Story Ideas: Raw ideas received:', ragIdeas);
      console.log('🔍 RAG Story Ideas: Ideas array length:', ragIdeas?.length);
      console.log('🔍 RAG Story Ideas: First idea sample:', ragIdeas?.[0]);
      
      console.log('✅ RAG Story Ideas Modal: Received ideas:', ragIdeas);
      setIdeas(ragIdeas || []);
      
      console.log('✅ RAG Story Ideas: Generated', ragIdeas?.length || 0, 'ideas');
    } catch (error) {
      console.error('❌ RAG Story Ideas: Error generating ideas:', error);
      // Set fallback ideas on error
      const fallbackIdeas = [
        "Study Spot: Share your favorite campus hideaway for cramming sessions",
        "Dining Hall: Rate today's mystery meal with dramatic reactions",
        "Campus Life: Show the real behind-the-scenes of student activities",
        "Friend Squad: Capture your study group's pre-exam energy",
        "Dorm Tour: Give a realistic peek into your living space",
        "Class Moments: Document your professors' funniest quotes",
        "Campus Seasons: Show how the campus vibe changes throughout the year",
        "Achievement: Celebrate your small academic victories"
      ];
      console.log('🔄 RAG Story Ideas: Using fallback ideas:', fallbackIdeas.length);
      setIdeas(fallbackIdeas);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = (idea) => {
    console.log('✅ RAG Story Ideas Modal: Idea selected:', idea);
    setSelectedIndex(ideas.indexOf(idea));
    setTimeout(() => {
      onSelectIdea(idea);
      onClose();
      setSelectedIndex(-1);
    }, 200);
  };

  const handleRefresh = () => {
    console.log('🔄 RAG Story Ideas: Refreshing ideas');
    generateIdeas();
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
                    colors={['#10B981', '#059669']}
                    style={styles.aiIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="bulb" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Campus Story Ideas</Text>
                  <Text style={styles.subtitle}>
                    AI-powered content inspiration
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
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.loadingText}>
                    Generating campus story ideas...
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    Based on your activity and trending topics
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  {/* Debug info */}
                  <Text style={{ color: 'white', fontSize: 12, marginBottom: 10 }}>
                    Debug: {ideas.length} ideas, Loading: {loading.toString()}
                  </Text>
                  
                  <ScrollView 
                    style={styles.ideasContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {ideas.length > 0 ? (
                      <>
                        <View style={styles.ideasHeader}>
                          <Text style={styles.ideasTitle}>
                            Pick an idea that sparks your creativity:
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

                        {ideas.map((idea, index) => {
                          // Parse the idea if it's in the format "Title: Description"
                          const ideaParts = idea?.split(':') || [];
                          const ideaTitle = ideaParts[0]?.trim() || `Idea ${index + 1}`;
                          const ideaDescription = ideaParts.slice(1).join(':').trim() || idea || 'No description available';
                          
                          return (
                            <TouchableOpacity
                              key={`idea-${index}`}
                              style={[
                                styles.ideaItem,
                                selectedIndex === index && styles.ideaItemSelected,
                              ]}
                              onPress={() => handleSelectIdea(idea)}
                              activeOpacity={0.8}
                            >
                              <LinearGradient
                                colors={
                                  selectedIndex === index
                                    ? ['#10B981', '#059669']
                                    : ['#2A2A3F', '#3A3A5F']
                                }
                                style={styles.ideaGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <View style={styles.ideaContent}>
                                  <View style={styles.ideaHeader}>
                                    <Ionicons 
                                      name="camera" 
                                      size={18} 
                                      color="#FFFFFF" 
                                      style={styles.ideaIcon}
                                    />
                                    <Text style={styles.ideaNumber}>
                                      {ideaTitle}
                                    </Text>
                                  </View>
                                  <Text style={styles.ideaText}>
                                    {ideaDescription}
                                  </Text>
                                  <View style={styles.ideaMeta}>
                                    <Ionicons 
                                      name="bulb" 
                                      size={12} 
                                      color="rgba(255, 255, 255, 0.6)" 
                                    />
                                    <Text style={styles.ideaLabel}>
                                      AI Suggested
                                    </Text>
                                  </View>
                                </View>
                              </LinearGradient>
                            </TouchableOpacity>
                          );
                        })}

                        <View style={styles.disclaimer}>
                          <Text style={styles.disclaimerText}>
                            💡 Powered by AI • Tailored to your campus experience
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.emptyIdeas}>
                        <Ionicons name="bulb-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                        <Text style={styles.emptyTitle}>No ideas available</Text>
                        <Text style={styles.emptySubtitle}>
                          Try again later or refresh for new story ideas
                        </Text>
                        <TouchableOpacity 
                          onPress={handleRefresh}
                          style={styles.retryButton}
                        >
                          <LinearGradient
                            colors={['#10B981', '#059669']}
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
    height: '85%',
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
  ideasContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  ideasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ideasTitle: {
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
  ideaItem: {
    marginBottom: 16,
  },
  ideaItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  ideaGradient: {
    borderRadius: 16,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  ideaContent: {
    flex: 1,
  },
  ideaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ideaIcon: {
    marginRight: 8,
  },
  ideaNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  ideaText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 12,
  },
  ideaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ideaLabel: {
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
  emptyIdeas: {
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

export default RAGStoryIdeas; 