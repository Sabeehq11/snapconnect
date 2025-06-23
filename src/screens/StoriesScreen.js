import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const StoriesScreen = () => {
  const [stories, setStories] = useState([]);
  const { user } = useAuth();

  // Mock data for now - will be replaced with Firebase data
  useEffect(() => {
    setStories([
      {
        id: '1',
        user: 'Your Story',
        isOwnStory: true,
        hasStory: false,
        stories: [],
      },
      {
        id: '2',
        user: 'Alice Johnson',
        isOwnStory: false,
        hasStory: true,
        stories: [
          { id: '1', type: 'image', timestamp: '2h ago' },
          { id: '2', type: 'video', timestamp: '1h ago' },
        ],
      },
      {
        id: '3',
        user: 'Bob Wilson',
        isOwnStory: false,
        hasStory: true,
        stories: [
          { id: '1', type: 'image', timestamp: '30m ago' },
        ],
      },
      {
        id: '4',
        user: 'Carol Davis',
        isOwnStory: false,
        hasStory: true,
        stories: [
          { id: '1', type: 'video', timestamp: '45m ago' },
          { id: '2', type: 'image', timestamp: '20m ago' },
        ],
      },
    ]);
  }, []);

  const renderStoryItem = ({ item }) => (
    <TouchableOpacity style={styles.storyItem}>
      <View style={[
        styles.storyAvatar,
        item.isOwnStory && styles.ownStoryAvatar,
        item.hasStory && !item.isOwnStory && styles.hasStoryAvatar,
      ]}>
        <Text style={styles.storyAvatarText}>
          {item.isOwnStory ? '+' : item.user.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.storyUserName} numberOfLines={1}>
        {item.user}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
      </View>

      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesList}
        contentContainerStyle={styles.storiesContainer}
      />

      <View style={styles.content}>
        <Text style={styles.noStoriesText}>
          Stories from your friends will appear here
        </Text>
        <Text style={styles.noStoriesSubtext}>
          Share a moment to get started!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  storiesList: {
    maxHeight: 120,
  },
  storiesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownStoryAvatar: {
    backgroundColor: '#FFFC00',
  },
  hasStoryAvatar: {
    borderWidth: 3,
    borderColor: '#FFFC00',
  },
  storyAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  storyUserName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noStoriesText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  noStoriesSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default StoriesScreen; 