import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import ImageWithFallback from './ImageWithFallback';
import StoryTagIcon from './StoryTagIcon';
import { useStories } from '../hooks/useStories';
import { useAuth } from '../context/AuthContext';

const CampusStoriesSection = ({ onStoryPress }) => {
  const [loading, setLoading] = useState(true);
  const [campusStories, setCampusStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);
  const { fetchCategoryStories } = useStories();
  const { user } = useAuth();

  useEffect(() => {
    loadCampusStories();
  }, []);

  const loadCampusStories = async () => {
    setLoading(true);
    
    try {
      // Fetch stories from all campus categories
      const categories = ['study', 'food', 'fitness', 'events', 'dorm_life', 'social', 'music'];
      const allCampusStories = [];
      
      for (const category of categories) {
        const categoryStories = await fetchCategoryStories(category);
        // Add category info to each story
        const storiesWithCategory = categoryStories.map(story => ({
          ...story,
          category: category,
          tag: getCategoryTag(category),
          tagColor: getCategoryColor(category),
        }));
        allCampusStories.push(...storiesWithCategory);
      }
      
      // Sort by creation date (newest first) and limit to 10 most recent
      const sortedStories = allCampusStories
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      
      setCampusStories(sortedStories);
    } catch (error) {
      console.error('❌ Error loading campus stories:', error);
      // Fallback to empty array if error
      setCampusStories([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTag = (category) => {
    const tagMap = {
      study: '📚 Study',
      food: '🍕 Food',
      fitness: '💪 Fitness',
      events: '🎉 Events',
      dorm_life: '🛋️ Dorm Life',
      social: '👥 Social',
      music: '🎵 Music',
    };
    return tagMap[category] || '🏫 Campus';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      study: colors.primary,
      food: colors.secondary,
      fitness: colors.success,
      events: colors.warning,
      dorm_life: colors.info,
      social: colors.pink,
      music: colors.purple,
    };
    return colorMap[category] || colors.accent;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d`;
    }
  };

  const handleStoryPress = (story) => {
    setViewingStory(story);
    if (onStoryPress) {
      onStoryPress(story);
    }
  };

  const renderCampusStory = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.storyCard, { marginLeft: index === 0 ? 20 : 0 }]}
      activeOpacity={0.8}
      onPress={() => handleStoryPress(item)}
    >
      <View style={styles.storyImageContainer}>
        {item.media_url ? (
          <ImageWithFallback
            source={{ uri: item.media_url }}
            style={styles.storyImage}
            fallbackStyle={styles.storyImageFallback}
            fallbackComponent={
              <StoryTagIcon 
                tag={item.tag} 
                size="small" 
                showBackground={false}
                style={styles.storyImageFallback}
              />
            }
          />
        ) : (
          <StoryTagIcon 
            tag={item.tag} 
            size="small" 
            showBackground={false}
            style={styles.storyImageFallback}
          />
        )}
        
        {/* Story Tag */}
        <View style={[styles.storyTag, { backgroundColor: item.tagColor }]}>
          <Text style={styles.storyTagText}>{item.tag}</Text>
        </View>
        
        {/* Views indicator */}
        <View style={styles.viewsIndicator}>
          <Ionicons name="eye" size={12} color={colors.white} />
          <Text style={styles.viewsText}>{item.views?.length || 0}</Text>
        </View>
      </View>
      
      <View style={styles.storyInfo}>
        <Text style={styles.storyUser} numberOfLines={1}>
          {item.profiles?.display_name || item.user || 'Anonymous'}
        </Text>
        <Text style={styles.storyCaption} numberOfLines={2}>
          {item.caption || 'Check out this story!'}
        </Text>
        <Text style={styles.storyTime}>{formatTimeAgo(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Campus Stories</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadCampusStories}>
          <Ionicons name="refresh" size={20} color={colors.white} opacity={0.7} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading campus stories...</Text>
        </View>
      ) : (
        <FlatList
          data={campusStories}
          renderItem={renderCampusStory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      )}

      {/* Story Viewer Modal */}
      <Modal
        visible={!!viewingStory}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewingStory(null)}
      >
        {viewingStory && (
          <View style={styles.storyViewerOverlay}>
            <TouchableOpacity 
              style={styles.closeBackground}
              activeOpacity={1}
              onPress={() => setViewingStory(null)}
            />
            
            <View style={styles.storyViewerContainer}>
              <LinearGradient
                colors={['#1A1A1F', '#2A2A3F']}
                style={styles.storyViewerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header */}
                <View style={styles.storyViewerHeader}>
                  <View style={styles.storyViewerUserInfo}>
                    <View style={styles.storyViewerAvatar}>
                      <Text style={styles.storyViewerAvatarText}>
                        {(viewingStory.profiles?.display_name || viewingStory.user || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.storyViewerUserText}>
                      <Text style={styles.storyViewerUserName}>
                        {viewingStory.profiles?.display_name || viewingStory.user || 'Anonymous'}
                      </Text>
                      <Text style={styles.storyViewerTime}>
                        {formatTimeAgo(viewingStory.created_at)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.storyViewerCloseButton}
                    onPress={() => setViewingStory(null)}
                  >
                    <Ionicons name="close" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.storyViewerContent}>
                  <View style={styles.storyViewerImageContainer}>
                    {viewingStory.media_url ? (
                      <ImageWithFallback
                        source={{ uri: viewingStory.media_url }}
                        style={styles.storyViewerImage}
                        fallbackStyle={styles.storyViewerImageFallback}
                        fallbackComponent={
                          <StoryTagIcon 
                            tag={viewingStory.tag} 
                            size="xlarge" 
                            showBackground={true}
                          />
                        }
                      />
                    ) : (
                      <StoryTagIcon 
                        tag={viewingStory.tag} 
                        size="xlarge" 
                        showBackground={true}
                      />
                    )}
                    
                    {/* Tag overlay */}
                    <View style={[styles.storyViewerTag, { backgroundColor: viewingStory.tagColor }]}>
                      <Text style={styles.storyViewerTagText}>{viewingStory.tag}</Text>
                    </View>
                  </View>

                  {/* Caption */}
                  {viewingStory.caption && (
                    <View style={styles.storyViewerCaptionContainer}>
                      <Text style={styles.storyViewerCaption}>
                        {viewingStory.caption}
                      </Text>
                    </View>
                  )}

                  {/* Stats */}
                  <View style={styles.storyViewerStats}>
                    <View style={styles.storyViewerStat}>
                      <Ionicons name="eye" size={16} color={colors.textSecondary} />
                      <Text style={styles.storyViewerStatText}>
                        {viewingStory.views?.length || 0} views
                      </Text>
                    </View>
                  </View>

                  {/* React Button */}
                  <TouchableOpacity 
                    style={styles.reactButton}
                    onPress={() => Alert.alert('React', 'Story reaction feature coming soon!')}
                  >
                    <LinearGradient
                      colors={colors.gradients.primary}
                      style={styles.reactButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="heart" size={20} color={colors.white} />
                      <Text style={styles.reactButtonText}>React</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
  storiesContainer: {
    paddingRight: 20,
  },
  storyCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  storyImageContainer: {
    position: 'relative',
    height: 120,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  storyImageFallback: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  storyTagText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  viewsIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  viewsText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 3,
  },
  storyInfo: {
    padding: 12,
  },
  storyUser: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  storyCaption: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  storyTime: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '500',
  },
  // Story Viewer Modal Styles
  storyViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  storyViewerContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  storyViewerGradient: {
    padding: 20,
  },
  storyViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  storyViewerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storyViewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storyViewerAvatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  storyViewerUserText: {
    flex: 1,
  },
  storyViewerUserName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  storyViewerTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  storyViewerCloseButton: {
    padding: 8,
  },
  storyViewerContent: {
    alignItems: 'center',
  },
  storyViewerImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  storyViewerImage: {
    width: 200,
    height: 250,
    borderRadius: 16,
  },
  storyViewerImageFallback: {
    width: 200,
    height: 250,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyViewerTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  storyViewerTagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  storyViewerCaptionContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  storyViewerCaption: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  storyViewerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  storyViewerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyViewerStatText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  reactButton: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 120,
  },
  reactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  reactButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CampusStoriesSection; 