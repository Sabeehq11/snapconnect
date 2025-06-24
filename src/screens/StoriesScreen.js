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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';

const { width } = Dimensions.get('window');

const StoriesScreen = () => {
  const [stories, setStories] = useState([]);
  const [spotlightStories, setSpotlightStories] = useState([]);
  const [publicStories, setPublicStories] = useState([]);
  const { user } = useAuth();

  // Ensure arrays are never undefined
  const safeStories = stories || [];
  const safeSpotlightStories = spotlightStories || [];
  const safePublicStories = publicStories || [];

  // Mock data for stories
  useEffect(() => {
    setStories([
      {
        id: 'my-story',
        user: 'My Story',
        isOwnStory: true,
        hasStory: false,
        avatar: null,
      },
      {
        id: '2',
        user: 'Daniel',
        isOwnStory: false,
        hasStory: true,
        avatar: null,
      },
      {
        id: '3',
        user: 'Olivia',
        isOwnStory: false,
        hasStory: true,
        avatar: null,
      },
      {
        id: '4',
        user: 'James',
        isOwnStory: false,
        hasStory: true,
        avatar: null,
      },
    ]);

    setSpotlightStories([
      {
        id: '1',
        title: 'Campus Life',
        subtitle: 'Recent highlights',
        image: null,
        type: 'recent',
      },
      {
        id: '2',
        title: 'Public',
        subtitle: 'Popular stories',
        image: null,
        type: 'public',
      },
    ]);

    setPublicStories([
      {
        id: '1',
        title: 'Study Session',
        subtitle: 'Lorem ipsum',
        image: null,
        user: 'Emma',
      },
      {
        id: '2',
        title: 'Campus Event',
        subtitle: 'Lorem ipsum',
        image: null,
        user: 'Alex',
      },
      {
        id: '3',
        title: 'Coffee Break',
        subtitle: 'Lorem ipsum',
        image: null,
        user: 'Sarah',
      },
    ]);
  }, []);

  const renderStoryItem = ({ item }) => (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.7}>
      <View style={styles.storyAvatarContainer}>
        <LinearGradient
          colors={item?.isOwnStory 
            ? (colors.gradients?.primary || ['#6366F1', '#8B5CF6'])
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
          {item.isOwnStory ? (
            <Ionicons name="add" size={24} color={colors.white} />
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

  const renderSpotlightCard = (item, index) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.spotlightCard, index === 1 && styles.spotlightCardRight]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item?.type === 'recent' 
          ? ['#FF6B6B', '#FF8E8E'] 
          : ['#4ECDC4', '#44A08D']
        }
        style={styles.spotlightGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.spotlightContent}>
          <Text style={styles.spotlightTitle}>{item.title}</Text>
          <Text style={styles.spotlightSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPublicStoryItem = ({ item }) => (
    <TouchableOpacity style={styles.publicStoryItem} activeOpacity={0.7}>
              <View style={styles.publicStoryCard}>
          <View style={styles.publicStoryImageContainer}>
            <LinearGradient
              colors={colors.gradients?.primary || ['#6366F1', '#8B5CF6']}
              style={styles.publicStoryImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            <Ionicons name="image" size={32} color={colors.white} />
          </LinearGradient>
        </View>
        <View style={styles.publicStoryInfo}>
          <Text style={styles.publicStoryTitle}>{item?.title || 'Story'}</Text>
          <Text style={styles.publicStorySubtitle}>{item?.subtitle || 'Loading...'}</Text>
          <Text style={styles.publicStoryUser}>by {item?.user || 'User'}</Text>
        </View>
      </View>
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
            data={safeStories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item?.id || 'story'}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
          />
        </View>

        {/* Spotlight Section */}
        <View style={styles.spotlightSection}>
          <Text style={styles.sectionTitle}>Spotlight</Text>
          <View style={styles.spotlightContainer}>
            {safeSpotlightStories.map((item, index) => renderSpotlightCard(item, index))}
          </View>
        </View>

        {/* Public Stories Section */}
        <View style={styles.publicStoriesSection}>
          <Text style={styles.sectionTitle}>Public Stories</Text>
          <FlatList
            data={safePublicStories}
            renderItem={renderPublicStoryItem}
            keyExtractor={(item) => item?.id || 'public-story'}
            numColumns={2}
            columnWrapperStyle={styles.publicStoriesRow}
            contentContainerStyle={styles.publicStoriesContainer}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
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
  spotlightSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
  },
  spotlightContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  spotlightCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  spotlightCardRight: {
    marginLeft: 0,
  },
  spotlightGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  spotlightContent: {
    alignItems: 'flex-start',
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  spotlightSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  publicStoriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  publicStoriesContainer: {
    gap: 12,
  },
  publicStoriesRow: {
    justifyContent: 'space-between',
    gap: 12,
  },
  publicStoryItem: {
    flex: 1,
    marginBottom: 12,
  },
  publicStoryCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  publicStoryImageContainer: {
    marginBottom: 12,
  },
  publicStoryImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publicStoryInfo: {
    gap: 2,
  },
  publicStoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  publicStorySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  publicStoryUser: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
});

export default StoriesScreen; 