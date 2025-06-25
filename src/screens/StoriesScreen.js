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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';
import { useStories } from '../hooks/useStories';
import ImageWithFallback from '../components/ImageWithFallback';

const { width, height } = Dimensions.get('window');

const StoriesScreen = ({ navigation }) => {
  const [viewingStory, setViewingStory] = useState(null);
  const { user } = useAuth();
  const { stories, friendsStories, loading, fetchStories, markStoryAsViewed } = useStories();

  // Stories are now managed by the hook, no need for local fetching

  const handleStoryPress = async (storyItem) => {
    if (storyItem.isOwnStory && (!storyItem.stories || storyItem.stories.length === 0)) {
      // Navigate to camera to create story
      navigation.navigate('Camera');
      return;
    }

    if (storyItem.stories && storyItem.stories.length > 0) {
      const firstStory = storyItem.stories[0];
      setViewingStory({
        ...firstStory,
        userName: storyItem.user,
        userAvatar: storyItem.avatar,
        isOwnStory: storyItem.isOwnStory
      });

      // Mark story as viewed if not own story
      if (!storyItem.isOwnStory && !firstStory.views.includes(user.id)) {
        await markStoryAsViewed(firstStory.id);
      }
    }
  };

  // markStoryAsViewed is now provided by the hook

  const closeStoryViewer = () => {
    setViewingStory(null);
  };

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
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={colors.white} />
        </TouchableOpacity>
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

        {/* Recent Friends Stories */}
        {friendsStories.length > 0 && (
          <View style={styles.recentStoriesSection}>
            <Text style={styles.sectionTitle}>Recent Stories</Text>
            <FlatList
              data={friendsStories.slice(0, 6)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recentStoryItem}
                  onPress={() => handleStoryPress({
                    ...item,
                    user: item.users.display_name || item.users.username,
                    isOwnStory: false,
                    hasStory: true,
                    stories: [item],
                    avatar: item.users.photo_url
                  })}
                >
                  <ImageWithFallback
                    mediaUrl={item.media_url}
                    messageId={item.id}
                    style={styles.recentStoryImage}
                    resizeMode="cover"
                    showFallback={true}
                  />
                  <Text style={styles.recentStoryUser}>
                    {item.users.display_name || item.users.username}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.recentStoriesRow}
              scrollEnabled={false}
            />
          </View>
        )}

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
            <TouchableOpacity 
              style={styles.storyTouchArea}
              onPress={closeStoryViewer}
              activeOpacity={1}
            >
              <ImageWithFallback
                mediaUrl={viewingStory.media_url}
                messageId={viewingStory.id || 'story'}
                style={styles.fullScreenStory}
                resizeMode="contain"
                showFallback={true}
              />
            </TouchableOpacity>
            
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
                <Text style={styles.storyUserName}>{viewingStory.userName}</Text>
              </View>
              <TouchableOpacity onPress={closeStoryViewer} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Center Close Button */}
            <TouchableOpacity onPress={closeStoryViewer} style={styles.centerCloseButton}>
              <View style={styles.centerCloseButtonBackground}>
                <Ionicons name="close" size={24} color={colors.white} />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
  },
  recentStoriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recentStoriesRow: {
    justifyContent: 'space-between',
    gap: 12,
  },
  recentStoryItem: {
    flex: 1,
    marginBottom: 12,
  },
  recentStoryImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  recentStoryUser: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
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
  storyTouchArea: {
    flex: 1,
  },
  fullScreenStory: {
    flex: 1,
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
   },
      closeButton: {
     padding: 12,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     borderRadius: 20,
   },
   centerCloseButton: {
     position: 'absolute',
     bottom: 120,
     alignSelf: 'center',
     zIndex: 10,
   },
   centerCloseButtonBackground: {
     backgroundColor: 'rgba(0, 0, 0, 0.7)',
     borderRadius: 30,
     padding: 12,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.25,
     shadowRadius: 3.84,
     elevation: 5,
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
});

export default StoriesScreen; 