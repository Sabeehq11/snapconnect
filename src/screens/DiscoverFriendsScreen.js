import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';

const DiscoverFriendsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(null);

  useEffect(() => {
    loadRecommendedUsers();
  }, []);

  const loadRecommendedUsers = async () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      // Mock recommended users data - in real implementation, this would come from RAG service
      const mockUsers = [
        {
          id: 'user-1',
          display_name: 'Jessica Chen',
          username: 'jess_chen',
          email: 'jess.chen@university.edu',
          shared_interests: ['Computer Science', 'Coffee', 'Study Groups'],
          mutual_friends: 3,
          distance: '0.5 miles',
          snap_score: 1250,
          bio: 'CS major | Coffee enthusiast | Always down for study sessions ☕📚',
        },
        {
          id: 'user-2',
          display_name: 'Marcus Johnson',
          username: 'marcus_j',
          email: 'marcus.j@university.edu',
          shared_interests: ['Basketball', 'Music', 'Campus Events'],
          mutual_friends: 2,
          distance: '1.2 miles',
          snap_score: 890,
          bio: 'Music producer | Basketball player | Event organizer 🎵🏀',
        },
        {
          id: 'user-3',
          display_name: 'Sarah Kim',
          username: 'sarahk_art',
          email: 'sarah.kim@university.edu',
          shared_interests: ['Art', 'Photography', 'Creative Writing'],
          mutual_friends: 1,
          distance: '0.8 miles',
          snap_score: 2100,
          bio: 'Art student | Photography lover | Creative soul 🎨📸',
        },
        {
          id: 'user-4',
          display_name: 'David Rodriguez',
          username: 'dave_r',
          email: 'david.rod@university.edu',
          shared_interests: ['Engineering', 'Gaming', 'Tech'],
          mutual_friends: 4,
          distance: '0.3 miles',
          snap_score: 1680,
          bio: 'Engineering student | Gaming enthusiast | Tech lover 🔧🎮',
        },
        {
          id: 'user-5',
          display_name: 'Emily Zhang',
          username: 'emily_z',
          email: 'emily.zhang@university.edu',
          shared_interests: ['Literature', 'Yoga', 'Hiking'],
          mutual_friends: 2,
          distance: '1.5 miles',
          snap_score: 920,
          bio: 'English major | Yoga instructor | Nature lover 📚🧘‍♀️',
        },
        {
          id: 'user-6',
          display_name: 'Tyler Brown',
          username: 'tyler_b',
          email: 'tyler.brown@university.edu',
          shared_interests: ['Business', 'Fitness', 'Networking'],
          mutual_friends: 3,
          distance: '0.7 miles',
          snap_score: 1450,
          bio: 'Business student | Fitness enthusiast | Future entrepreneur 💼💪',
        },
      ];
      
      setRecommendedUsers(mockUsers);
      setLoading(false);
    }, 1200);
  };

  const handleAddFriend = async (userId, userName) => {
    setAddingFriend(userId);
    
    // Simulate adding friend
    setTimeout(() => {
      Alert.alert(
        'Friend Request Sent!',
        `Your friend request has been sent to ${userName}`,
        [{ text: 'OK', onPress: () => setAddingFriend(null) }]
      );
      
      // Remove user from recommendations
      setRecommendedUsers(prev => prev.filter(u => u.id !== userId));
    }, 1000);
  };

  const renderInterestTag = (interest, index) => (
    <View key={index} style={styles.interestTag}>
      <Text style={styles.interestTagText}>{interest}</Text>
    </View>
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.userCardGradient}
      >
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {item.display_name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.display_name}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
            <View style={styles.userStats}>
              <Text style={styles.userStat}>
                {item.mutual_friends} mutual friends
              </Text>
              <Text style={styles.userStatDot}>•</Text>
              <Text style={styles.userStat}>{item.distance}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.userBio}>{item.bio}</Text>
        
        <View style={styles.interestsContainer}>
          <Text style={styles.interestsLabel}>Shared interests:</Text>
          <View style={styles.interestsList}>
            {item.shared_interests.slice(0, 3).map((interest, index) => 
              renderInterestTag(interest, index)
            )}
          </View>
        </View>
        
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => handleAddFriend(item.id, item.display_name)}
            disabled={addingFriend === item.id}
          >
            <LinearGradient
              colors={addingFriend === item.id ? 
                ['rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.5)'] :
                colors.gradients.primary
              }
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {addingFriend === item.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="person-add" size={16} color={colors.white} />
                  <Text style={styles.addButtonText}>Add Friend</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.viewProfileButton}>
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover Friends</Text>
        <TouchableOpacity onPress={loadRecommendedUsers}>
          <Ionicons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding people you might know...</Text>
        </View>
      ) : (
        <FlatList
          data={recommendedUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  usersList: {
    padding: 20,
  },
  userCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userCardGradient: {
    padding: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStat: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  userStatDot: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  userBio: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  interestsContainer: {
    marginBottom: 16,
  },
  interestsLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 8,
    fontWeight: '600',
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestTagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    marginRight: 12,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  viewProfileButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewProfileText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DiscoverFriendsScreen; 