import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useStories } from '../hooks/useStories';
import StoryTagIcon from '../components/StoryTagIcon';
import LoadingIndicator from '../components/LoadingIndicator';

const { width, height } = Dimensions.get('window');

const CategoryStoriesScreen = ({ navigation, route }) => {
  const { category, categoryTitle, categoryIcon, categoryColor } = route.params;
  const { fetchCategoryStories } = useStories();
  
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    loadCategoryStories();
  }, [category]);

  const loadCategoryStories = async () => {
    try {
      setLoading(true);
      console.log('📖 Loading stories for category:', category);
      
      const categoryStories = await fetchCategoryStories(category);
      console.log('✅ Loaded category stories:', categoryStories.length);
      
      setStories(categoryStories);
    } catch (error) {
      console.error('❌ Error loading category stories:', error);
      Alert.alert('Error', 'Failed to load stories for this category');
    } finally {
      setLoading(false);
    }
  };

  const handleStoryPress = (story, index) => {
    setCurrentStoryIndex(index);
    setViewingStory(story);
  };

  const handleCloseStoryViewer = () => {
    setViewingStory(null);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setViewingStory(stories[nextIndex]);
    } else {
      handleCloseStoryViewer();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setViewingStory(stories[prevIndex]);
    }
  };

  const renderStoryItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item, index)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.media_url }} style={styles.storyImage} />
      
      {/* Story overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.storyOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.storyInfo}>
          <Text style={styles.storyCaption} numberOfLines={2}>
            {item.caption}
          </Text>
          <View style={styles.storyMeta}>
            <Text style={styles.storyUser}>{item.users.display_name}</Text>
            <Text style={styles.storyTime}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <StoryTagIcon tag={categoryTitle} size="large" />
      <Text style={styles.emptyTitle}>No {categoryTitle} Stories Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share a story in this category!
      </Text>
      <TouchableOpacity 
        style={styles.createStoryButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.createStoryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="camera" size={20} color={colors.white} />
          <Text style={styles.createStoryText}>Create Story</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <StoryTagIcon tag={categoryTitle} size="small" />
          <Text style={styles.titleText}>{categoryTitle}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadCategoryStories}
        >
          <Ionicons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={styles.loadingText}>Loading {categoryTitle} stories...</Text>
        </View>
      ) : stories.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.storiesGrid}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Story Viewer Modal */}
      <Modal
        visible={!!viewingStory}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseStoryViewer}
      >
        {viewingStory && (
          <View style={styles.storyViewerContainer}>
            <Image 
              source={{ uri: viewingStory.media_url }} 
              style={styles.fullStoryImage}
              resizeMode="contain"
            />
            
            {/* Story Viewer Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
              style={styles.storyViewerOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Top Controls */}
              <View style={styles.storyViewerTop}>
                <View style={styles.storyProgress}>
                  {stories.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor: index <= currentStoryIndex 
                            ? colors.white 
                            : 'rgba(255,255,255,0.3)'
                        }
                      ]}
                    />
                  ))}
                </View>
                
                <View style={styles.storyViewerHeader}>
                  <View style={styles.storyUserInfo}>
                    <View style={styles.storyUserAvatar}>
                      <Text style={styles.avatarText}>
                        {viewingStory.users.display_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.storyUserName}>
                        {viewingStory.users.display_name}
                      </Text>
                      <Text style={styles.storyTimestamp}>
                        {new Date(viewingStory.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={handleCloseStoryViewer}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Caption */}
              {viewingStory.caption && (
                <View style={styles.storyViewerBottom}>
                  <Text style={styles.fullStoryCaption}>
                    {viewingStory.caption}
                  </Text>
                </View>
              )}
            </LinearGradient>

            {/* Navigation Areas */}
            <TouchableOpacity 
              style={styles.prevArea}
              onPress={handlePrevStory}
              activeOpacity={1}
            />
            <TouchableOpacity 
              style={styles.nextArea}
              onPress={handleNextStory}
              activeOpacity={1}
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 20,
  },
  storiesGrid: {
    padding: 16,
  },
  storyItem: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  storyImage: {
    width: '100%',
    height: 200,
  },
  storyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  storyInfo: {
    gap: 8,
  },
  storyCaption: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyUser: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  storyTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  createStoryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  createStoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  createStoryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Story Viewer Styles
  storyViewerContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  fullStoryImage: {
    width: width,
    height: height,
  },
  storyViewerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  storyViewerTop: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  storyProgress: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  storyViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  storyUserName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  storyTimestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  closeButton: {
    padding: 8,
  },
  storyViewerBottom: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  fullStoryCaption: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  prevArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.3,
  },
  nextArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.3,
  },
});

export default CategoryStoriesScreen; 