import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';

const FriendsAcademicStatus = () => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [academicUpdates, setAcademicUpdates] = useState([]);

  useEffect(() => {
    generateAcademicUpdates();
  }, [friends]);

  const generateAcademicUpdates = () => {
    // Generate realistic academic updates using actual friends data
    const academicActivities = [
      { activity: 'aced', subject: 'Calculus II', icon: '🎯', type: 'success', color: colors.success },
      { activity: 'finished', subject: 'Chemistry Lab Report', icon: '🔬', type: 'completion', color: colors.info },
      { activity: 'studying for', subject: 'Physics Midterm', icon: '📚', type: 'studying', color: colors.warning },
      { activity: 'completed', subject: 'Computer Science Project', icon: '💻', type: 'completion', color: colors.primary },
      { activity: 'got an A on', subject: 'History Essay', icon: '📜', type: 'success', color: colors.success },
      { activity: 'preparing for', subject: 'Biology Final', icon: '🧬', type: 'studying', color: colors.warning },
      { activity: 'submitted', subject: 'Economics Paper', icon: '📈', type: 'completion', color: colors.info },
      { activity: 'working on', subject: 'Engineering Design', icon: '⚙️', type: 'progress', color: colors.secondary },
      { activity: 'passed', subject: 'Statistics Quiz', icon: '📊', type: 'success', color: colors.success },
      { activity: 'reviewing for', subject: 'Literature Exam', icon: '📖', type: 'studying', color: colors.warning },
      { activity: 'completed', subject: 'Art Portfolio', icon: '🎨', type: 'completion', color: colors.accent },
      { activity: 'mastered', subject: 'Spanish Vocabulary', icon: '🗣️', type: 'success', color: colors.success }
    ];

    const timeframes = [
      { text: 'just now', minutes: 0 },
      { text: '30m ago', minutes: 30 },
      { text: '1h ago', minutes: 60 },
      { text: '2h ago', minutes: 120 },
      { text: '3h ago', minutes: 180 },
      { text: 'yesterday', minutes: 1440 },
      { text: '2 days ago', minutes: 2880 }
    ];

    const encouragements = {
      success: ['Amazing work!', 'Crushing it!', 'So proud!', 'Incredible!', 'Way to go!'],
      completion: ['Great job!', 'Well done!', 'Finished!', 'Awesome!', 'Nice work!'],
      studying: ['You got this!', 'Keep it up!', 'Good luck!', 'Stay strong!', 'Almost there!'],
      progress: ['Making progress!', 'Keep going!', 'Looking good!', 'On track!', 'Great effort!']
    };

    if (!friends || friends.length === 0) {
      // Fallback dummy data if no friends
      const dummyFriends = [
        { id: '1', display_name: 'Alex', username: 'alex_student' },
        { id: '2', display_name: 'Sam', username: 'sam_studies' },
        { id: '3', display_name: 'Jordan', username: 'jordan_ace' }
      ];
      
      const updates = dummyFriends.map((friend, index) => {
        const activity = academicActivities[index % academicActivities.length];
        const timeframe = timeframes[index % timeframes.length];
        const encouragement = encouragements[activity.type][index % encouragements[activity.type].length];
        
        return {
          id: `update-${friend.id}-${index}`,
          friendId: friend.id,
          friendName: friend.display_name,
          username: friend.username,
          activity: activity.activity,
          subject: activity.subject,
          icon: activity.icon,
          type: activity.type,
          color: activity.color,
          timeAgo: timeframe.text,
          encouragement: encouragement,
          timestamp: new Date(Date.now() - timeframe.minutes * 60000),
        };
      });
      
      setAcademicUpdates(updates.sort((a, b) => b.timestamp - a.timestamp));
      return;
    }

    // Generate updates using real friends data
    const updates = friends.slice(0, 8).map((friend, index) => {
      const activity = academicActivities[index % academicActivities.length];
      const timeframe = timeframes[index % timeframes.length];
      const encouragement = encouragements[activity.type][index % encouragements[activity.type].length];
      
      return {
        id: `update-${friend.id}-${index}`,
        friendId: friend.id,
        friendName: friend.display_name || friend.username,
        username: friend.username,
        activity: activity.activity,
        subject: activity.subject,
        icon: activity.icon,
        type: activity.type,
        color: activity.color,
        timeAgo: timeframe.text,
        encouragement: encouragement,
        timestamp: new Date(Date.now() - timeframe.minutes * 60000),
      };
    });

    setAcademicUpdates(updates.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleUpdatePress = (update) => {
    Alert.alert(
      `${update.friendName}'s Academic Update`,
      `${update.friendName} ${update.activity} ${update.subject}!\n\n${update.encouragement}`,
      [
        { 
          text: 'Send Congrats', 
          onPress: () => {
            Alert.alert('Sent!', `Congratulations sent to ${update.friendName}! 🎉`);
          }
        },
        { 
          text: 'Study Together', 
          onPress: () => {
            Alert.alert('Study Buddy!', `Invitation to study sent to ${update.friendName}! 📚`);
          }
        },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const renderAcademicUpdate = ({ item }) => (
    <TouchableOpacity
      style={styles.updateCard}
      activeOpacity={0.8}
      onPress={() => handleUpdatePress(item)}
    >
      <LinearGradient
        colors={[`${item.color}12`, `${item.color}06`]}
        style={styles.updateCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.updateHeader}>
          <View style={[styles.updateIcon, { backgroundColor: item.color }]}>
            <Text style={styles.updateIconText}>{item.icon}</Text>
          </View>
          <View style={styles.updateContent}>
            <View style={styles.updateTitleRow}>
              <Text style={styles.friendName} numberOfLines={1}>
                {item.friendName}
              </Text>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
            <Text style={styles.updateText} numberOfLines={2}>
              {item.activity} <Text style={[styles.subjectText, { color: item.color }]}>{item.subject}</Text>
            </Text>
            <Text style={styles.encouragementText}>
              {item.encouragement}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (academicUpdates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Friends' Academic Status</Text>
          <Text style={styles.sectionSubtitle}>See how your friends are doing</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>No academic updates yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Connect with friends to see their study progress!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Friends' Academic Status</Text>
          <Text style={styles.sectionSubtitle}>Cheer on your study buddies! 📚</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton}>
          <LinearGradient
            colors={colors.gradients.accent}
            style={styles.refreshButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="refresh" size={16} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={academicUpdates}
        renderItem={renderAcademicUpdate}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.updatesList}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 12,
  },
  refreshButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatesList: {
    maxHeight: 300,
  },
  updateCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  updateCardGradient: {
    padding: 16,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  updateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  updateIconText: {
    fontSize: 16,
  },
  updateContent: {
    flex: 1,
    gap: 4,
  },
  updateTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  updateText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  subjectText: {
    fontWeight: '600',
  },
  encouragementText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default FriendsAcademicStatus; 