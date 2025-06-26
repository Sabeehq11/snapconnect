import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Image,
  Modal,
  Alert,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';
import { useStories } from '../hooks/useStories';
import ImageWithFallback from '../components/ImageWithFallback';
import CampusStoriesSection from '../components/CampusStoriesSection';
import RAGStoryIdeas from '../components/RAGStoryIdeas';
import BestCampusPlacesSection from '../components/BestCampusPlacesSection';
import RAGStoryCaptionSuggestor from '../components/RAGStoryCaptionSuggestor';
import StoryTagSelector from '../components/StoryTagSelector';

const { width, height } = Dimensions.get('window');

const StoriesScreen = ({ navigation, route }) => {
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyGroup, setStoryGroup] = useState([]);
  const [showStoryIdeas, setShowStoryIdeas] = useState(false);
  const [showCampusStoryPost, setShowCampusStoryPost] = useState(false);
  const [showStoryCaptionSuggestor, setShowStoryCaptionSuggestor] = useState(false);
  const [selectedStoryTag, setSelectedStoryTag] = useState(null);
  const [pendingStoryData, setPendingStoryData] = useState(null);
  const { user } = useAuth();
  const { stories, friendsStories, loading, fetchStories, markStoryAsViewed, deleteStory } = useStories();

  // Handle navigation params (when returning from camera with story or after publishing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Get params from route directly
      const params = route.params;
      
      // Handle campus story creation flow
      if (params?.newCampusStory) {
        // User just created a story for campus posting
        const storyData = params.newCampusStory;
        setPendingStoryData(storyData);
        setSelectedStoryTag(storyData.tag);
        setShowStoryCaptionSuggestor(true);
        
        // Clear the params
        navigation.setParams({ newCampusStory: undefined });
      }
      
      // Handle story published feedback
      if (params?.storyPublished) {
        const publishedTo = params.publishedTo || 'your story';
        
        // Refresh stories to show the new one
        fetchStories();
        
        // Show success feedback
        Alert.alert(
          '🎉 Story Published!', 
          `Your story has been posted to ${publishedTo} and is now live!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
        
        // Clear the params
        navigation.setParams({ 
          storyPublished: undefined,
          publishedTo: undefined 
        });
      }
    });

    return unsubscribe;
  }, [navigation, fetchStories, route.params]);

  // Stories are now managed by the hook, no need for local fetching

  const handleStoryPress = async (storyItem) => {
    if (storyItem.isOwnStory && (!storyItem.stories || storyItem.stories.length === 0)) {
      // Navigate to camera to create story
      navigation.navigate('Camera');
      return;
    }

    if (storyItem.stories && storyItem.stories.length > 0) {
      // Set up story group for navigation
      setStoryGroup(storyItem.stories);
      setCurrentStoryIndex(0);
      
      const firstStory = storyItem.stories[0];
      setViewingStory({
        ...firstStory,
        userName: storyItem.user,
        userAvatar: storyItem.avatar,
        isOwnStory: storyItem.isOwnStory,
        totalStories: storyItem.stories.length
      });

      // Mark story as viewed if not own story
      if (!storyItem.isOwnStory && !firstStory.views?.includes(user.id)) {
        await markStoryAsViewed(firstStory.id);
      }
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      Alert.alert(
        'Delete Story',
        'Are you sure you want to delete this story?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteStory(storyId);
              closeStoryViewer();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete story');
    }
  };

  const handleCampusStoryPost = () => {
    setShowCampusStoryPost(true);
  };

  const handleTagSelected = (tag) => {
    setSelectedStoryTag(tag);
    setShowCampusStoryPost(false);
    // Navigate to camera with tag context
    navigation.navigate('Camera', { 
      campusStoryTag: tag,
      isForCampusStory: true 
    });
  };

  const handleStoryCaptionSelected = (caption) => {
    console.log('✅ Story caption selected:', caption);
    if (pendingStoryData) {
      // Apply caption to pending story and post it
      const storyWithCaption = {
        ...pendingStoryData,
        caption: caption
      };
      // Post the story (this would integrate with your backend)
      console.log('📢 Posting story to campus feed:', storyWithCaption);
      Alert.alert('Success', 'Story posted to campus feed!');
      setPendingStoryData(null);
    }
  };

  const handlePlacePress = (place) => {
    Alert.alert(
      place.title,
      `${place.description}\n\nWould you like to create a story here?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Story', 
          onPress: () => {
            navigation.navigate('Camera', { 
              locationContext: place,
              isForCampusStory: true 
            });
          }
        }
      ]
    );
  };

  const navigateStory = (direction) => {
    if (storyGroup.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentStoryIndex < storyGroup.length - 1 ? currentStoryIndex + 1 : 0;
    } else {
      newIndex = currentStoryIndex > 0 ? currentStoryIndex - 1 : storyGroup.length - 1;
    }
    
    setCurrentStoryIndex(newIndex);
    const story = storyGroup[newIndex];
    setViewingStory({
      ...story,
      userName: viewingStory.userName,
      userAvatar: viewingStory.userAvatar,
      isOwnStory: viewingStory.isOwnStory,
      totalStories: storyGroup.length
    });
    
    // Mark as viewed if not own story
    if (!viewingStory.isOwnStory && !story.views?.includes(user.id)) {
      markStoryAsViewed(story.id);
    }
  };

  // markStoryAsViewed is now provided by the hook

  const closeStoryViewer = () => {
    setViewingStory(null);
    setStoryGroup([]);
    setCurrentStoryIndex(0);
  };

  // Handle back button press when viewing story
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (viewingStory) {
          closeStoryViewer();
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      }
    );

    return () => backHandler.remove();
  }, [viewingStory]);

  const renderStoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.storyItem} 
      activeOpacity={0.7}
      onPress={() => handleStoryPress(item)}
    >
      <View style={styles.storyAvatarContainer}>
        <LinearGradient
          colors={item?.isOwnStory 
            ? (item.hasStory ? colors.gradients?.primary || ['#6366F1', '#8B5CF6'] : ['#666', '#888'])
            : item?.hasStory 
              ? (colors.gradients?.snapGradient || ['#6366F1', '#8B5CF6', '#3B82F6'])
              : (colors.gradients?.accent || ['#8B5CF6', '#3B82F6'])
          }
          style={[
            styles.storyAvatar,
            item.hasStory && !item.isOwnStory && styles.hasStoryBorder,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {item.isOwnStory && !item.hasStory ? (
            <Ionicons name="add" size={24} color={colors.white} />
          ) : item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.storyAvatarText}>
              {item.user.charAt(0).toUpperCase()}
            </Text>
          )}
        </LinearGradient>
      </View>
      <Text style={styles.storyUserName} numberOfLines={1}>
        {item.user}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.headerButton, styles.campusPostButton]} 
            onPress={handleCampusStoryPost}
          >
            <LinearGradient
              colors={colors.gradients.secondary}
              style={styles.campusPostGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="megaphone" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, styles.storyIdeasButton]} 
            onPress={() => setShowStoryIdeas(true)}
          >
            <LinearGradient
              colors={colors.gradients.accent}
              style={styles.storyIdeasGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bulb" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stories Row */}
        <View style={styles.storiesSection}>
          <FlatList
            data={stories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item?.id || 'story'}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
            refreshing={loading}
            onRefresh={fetchStories}
          />
        </View>

        {/* Best Campus Places Section */}
        <BestCampusPlacesSection onPlacePress={handlePlacePress} />

        {/* Story Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.categoriesTitle}>Story Categories</Text>
            <Text style={styles.categoriesSubtitle}>Explore stories by topic</Text>
          </View>
          
          <View style={styles.categoriesGrid}>
            {[
              { id: 'study', title: '📚 Study Stories', color: colors.primary },
              { id: 'food', title: '🍕 Food Stories', color: colors.secondary },
              { id: 'fitness', title: '💪 Fitness', color: colors.success },
              { id: 'events', title: '🎉 Events', color: colors.warning },
              { id: 'dorm_life', title: '🛋️ Dorm Life', color: colors.info },
              { id: 'social', title: '👥 Social', color: colors.pink },
            ].map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('CategoryStories', {
                  category: category.id,
                  categoryTitle: category.title,
                  categoryIcon: category.title.split(' ')[0],
                  categoryColor: category.color
                })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[`${category.color}20`, `${category.color}10`]}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.categoryIcon}>
                    {category.title.split(' ')[0]}
                  </Text>
                  <Text style={styles.categoryTitle}>
                    {category.title.split(' ').slice(1).join(' ')}
                  </Text>
                  <View style={styles.categoryArrow}>
                    <Ionicons name="chevron-forward" size={16} color={category.color} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campus Stories Section */}
        <CampusStoriesSection 
          navigation={navigation}
          onStoryPress={(story) => {
            console.log('Campus story pressed:', story);
            // The CampusStoriesSection now handles viewing internally
          }}
        />

        {/* Empty State */}
        {stories.length <= 1 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Stories Yet</Text>
            <Text style={styles.emptyStateText}>
              Add friends and start sharing your moments!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Story Viewer Modal */}
      <Modal
        visible={!!viewingStory}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeStoryViewer}
      >
        {viewingStory && (
          <View style={styles.storyViewer}>
            {/* Story Progress Indicators */}
            {storyGroup.length > 1 && (
              <View style={styles.storyProgressContainer}>
                {(storyGroup || []).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.storyProgressBar,
                      index === currentStoryIndex && styles.activeProgressBar
                    ]}
                  />
                ))}
              </View>
            )}
            
            {/* Navigation Areas */}
            <TouchableOpacity 
              style={[styles.storyTouchArea, styles.leftTouchArea]}
              onPress={() => navigateStory('prev')}
              activeOpacity={1}
            />
            
            <TouchableOpacity 
              style={[styles.storyTouchArea, styles.rightTouchArea]}
              onPress={() => navigateStory('next')}
              activeOpacity={1}
            />
            
            <ImageWithFallback
              mediaUrl={viewingStory.media_url}
              messageId={viewingStory.id || 'story'}
              style={styles.fullScreenStory}
              resizeMode="contain"
              showFallback={true}
            />
            
            {/* Story Header */}
            <View style={styles.storyHeader}>
              <View style={styles.storyUserInfo}>
                {viewingStory.userAvatar ? (
                  <Image source={{ uri: viewingStory.userAvatar }} style={styles.storyUserAvatar} />
                ) : (
                  <View style={styles.storyUserAvatarPlaceholder}>
                    <Text style={styles.storyUserAvatarText}>
                      {viewingStory.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.storyHeaderText}>
                  <Text style={styles.storyUserName}>{viewingStory.userName}</Text>
                  {viewingStory.totalStories > 1 && (
                    <Text style={styles.storyCounter}>
                      {currentStoryIndex + 1} of {viewingStory.totalStories}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Side Control Panel */}
            <View style={styles.sideControlPanel}>
              <TouchableOpacity 
                onPress={closeStoryViewer} 
                style={styles.sideControlButton}
              >
                <Ionicons name="close" size={28} color={colors.white} />
              </TouchableOpacity>
              
              {/* Delete Button - Only for own stories */}
              {viewingStory.isOwnStory && (
                <TouchableOpacity 
                  onPress={() => handleDeleteStory(viewingStory.id)} 
                  style={[styles.sideControlButton, styles.deleteControlButton]}
                >
                  <Ionicons name="trash" size={24} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom Exit Button */}
            <TouchableOpacity 
              style={styles.bottomExitButton}
              onPress={closeStoryViewer}
              activeOpacity={0.8}
            >
              <View style={styles.bottomExitButtonBackground}>
                <Ionicons name="chevron-down" size={24} color={colors.white} />
                <Text style={styles.bottomExitText}>Tap to exit</Text>
              </View>
            </TouchableOpacity>

            {/* Story Caption */}
            {viewingStory.caption && (
              <View style={styles.storyCaption}>
                <Text style={styles.storyCaptionText}>{viewingStory.caption}</Text>
              </View>
            )}

            {/* Story Footer */}
            <View style={styles.storyFooter}>
              <Text style={styles.storyTime}>
                {new Date(viewingStory.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              {viewingStory.views && (
                <Text style={styles.storyViews}>
                  👁️ {viewingStory.views.length} view{viewingStory.views.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Story Ideas Modal */}
      <RAGStoryIdeas
        visible={showStoryIdeas}
        onClose={() => setShowStoryIdeas(false)}
        onSelectIdea={(idea) => {
          console.log('Selected story idea:', idea);
          // Navigate to camera with the idea as context
          navigation.navigate('Camera', { storyIdea: idea });
        }}
      />

      {/* Campus Story Tag Selector Modal */}
      <StoryTagSelector
        visible={showCampusStoryPost}
        onClose={() => setShowCampusStoryPost(false)}
        onSelectTag={handleTagSelected}
      />

      {/* Story Caption Suggestions Modal */}
      <RAGStoryCaptionSuggestor
        visible={showStoryCaptionSuggestor}
        onClose={() => setShowStoryCaptionSuggestor(false)}
        onSelectCaption={handleStoryCaptionSelected}
        storyTag={selectedStoryTag}
        imageContext={pendingStoryData?.imageContext || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#1A1A1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 12,
  },
  campusPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  campusPostGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyIdeasButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  storyIdeasGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  storiesSection: {
    backgroundColor: '#1A1A1F',
    paddingBottom: 20,
  },
  storiesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  storyAvatarContainer: {
    marginBottom: 8,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hasStoryBorder: {
    borderWidth: 3,
    borderColor: colors.snapYellow,
  },
  storyAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  storyUserName: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  storyViewer: {
    flex: 1,
    backgroundColor: 'black',
  },
  storyProgressContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  storyProgressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  activeProgressBar: {
    backgroundColor: colors.white,
  },
  storyTouchArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 5,
  },
  leftTouchArea: {
    left: 0,
  },
  rightTouchArea: {
    right: 0,
  },
  fullScreenStory: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  storyHeaderText: {
    flex: 1,
    marginLeft: 8,
  },
  storyCounter: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  deleteControlButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
  },
  storyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  storyUserAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyUserAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  storyCaption: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  storyCaptionText: {
    fontSize: 14,
    color: colors.white,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  storyViews: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sideControlPanel: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -50 }],
    flexDirection: 'column',
    gap: 16,
    zIndex: 10,
  },
  sideControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomExitButton: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomExitButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomExitText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  // Categories Section
  categoriesSection: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  categoriesHeader: {
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  categoryArrow: {
    marginLeft: 8,
  },
  
});

export default StoriesScreen; 