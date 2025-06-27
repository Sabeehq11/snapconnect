import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';

const MoodTracker = () => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [currentMood, setCurrentMood] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(5);
  const [reflection, setReflection] = useState('');
  const [friendMoods, setFriendMoods] = useState([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Mood configurations with colors and emojis
  const moodConfig = {
    1: { emoji: '😢', label: 'Terrible', color: '#EF4444', description: 'Really struggling today' },
    2: { emoji: '😰', label: 'Very Bad', color: '#F97316', description: 'Having a tough time' },
    3: { emoji: '😞', label: 'Bad', color: '#F59E0B', description: 'Not feeling great' },
    4: { emoji: '😐', label: 'Below Average', color: '#EAB308', description: 'Could be better' },
    5: { emoji: '😐', label: 'Neutral', color: '#6B7280', description: 'Feeling okay' },
    6: { emoji: '🙂', label: 'Good', color: '#10B981', description: 'Pretty good day' },
    7: { emoji: '😊', label: 'Very Good', color: '#059669', description: 'Feeling positive' },
    8: { emoji: '😄', label: 'Great', color: '#0891B2', description: 'Having a great day' },
    9: { emoji: '🤩', label: 'Amazing', color: '#7C3AED', description: 'Feeling fantastic' },
    10: { emoji: '🥳', label: 'Euphoric', color: '#DC2626', description: 'On top of the world!' }
  };

  useEffect(() => {
    loadTodaysMood();
    loadFriendMoods();
  }, [user]);

  const getTodayKey = () => {
    const today = new Date();
    return `mood_${user?.id}_${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  const loadTodaysMood = async () => {
    try {
      const todayKey = getTodayKey();
      const moodData = await AsyncStorage.getItem(todayKey);
      if (moodData) {
        const parsed = JSON.parse(moodData);
        setCurrentMood(parsed);
        setHasCheckedInToday(true);
      }
    } catch (error) {
      console.error('Error loading mood:', error);
    }
  };

  const loadFriendMoods = async () => {
    try {
      // Generate mock friend moods based on real friends data
      if (!friends || friends.length === 0) return;
      
      const mockFriendMoods = friends.slice(0, 3).map((friend, index) => {
        const moodValue = Math.floor(Math.random() * 10) + 1;
        const timeAgo = ['2h ago', '4h ago', '6h ago'][index];
        
        return {
          id: friend.id,
          name: friend.display_name || friend.username,
          mood: moodValue,
          emoji: moodConfig[moodValue].emoji,
          color: moodConfig[moodValue].color,
          label: moodConfig[moodValue].label,
          timeAgo: timeAgo,
          reflection: ['Studying for finals!', 'Coffee with friends ☕', 'Just finished workout 💪'][index]
        };
      });
      
      setFriendMoods(mockFriendMoods);
    } catch (error) {
      console.error('Error loading friend moods:', error);
    }
  };

  const saveMood = async () => {
    try {
      const moodData = {
        mood: selectedMood,
        reflection: reflection.trim(),
        timestamp: new Date().toISOString(),
        emoji: moodConfig[selectedMood].emoji,
        label: moodConfig[selectedMood].label,
        color: moodConfig[selectedMood].color
      };

      const todayKey = getTodayKey();
      await AsyncStorage.setItem(todayKey, JSON.stringify(moodData));
      
      setCurrentMood(moodData);
      setHasCheckedInToday(true);
      setShowMoodModal(false);
      setReflection('');
      
      Alert.alert('Mood Saved! 🎉', `Thanks for checking in! You're feeling ${moodConfig[selectedMood].label.toLowerCase()} today.`);
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save mood. Please try again.');
    }
  };

  const handleFriendMoodPress = (friendMood) => {
    Alert.alert(
      `${friendMood.name}'s Mood`,
      `Feeling ${friendMood.label.toLowerCase()} (${friendMood.mood}/10)\n\n"${friendMood.reflection}"\n\nUpdated ${friendMood.timeAgo}`,
      [
        { text: 'Send Support', onPress: () => Alert.alert('Sent! 💙', `Supportive message sent to ${friendMood.name}!`) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSelector}>
      <Text style={styles.selectorTitle}>How are you feeling today?</Text>
      <View style={styles.moodGrid}>
        {Object.entries(moodConfig).map(([value, config]) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.moodOption,
              selectedMood === parseInt(value) && styles.selectedMoodOption,
              { borderColor: config.color }
            ]}
            onPress={() => setSelectedMood(parseInt(value))}
            activeOpacity={0.8}
          >
            <Text style={styles.moodEmoji}>{config.emoji}</Text>
            <Text style={styles.moodValue}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.moodDescription}>
        <Text style={[styles.selectedMoodLabel, { color: moodConfig[selectedMood].color }]}>
          {moodConfig[selectedMood].label}
        </Text>
        <Text style={styles.selectedMoodDesc}>
          {moodConfig[selectedMood].description}
        </Text>
      </View>
    </View>
  );

  const renderFriendMood = (friendMood) => (
    <TouchableOpacity
      key={friendMood.id}
      style={styles.friendMoodCard}
      onPress={() => handleFriendMoodPress(friendMood)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${friendMood.color}15`, `${friendMood.color}08`]}
        style={styles.friendMoodGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.friendMoodHeader}>
          <View style={[styles.friendMoodIcon, { backgroundColor: friendMood.color }]}>
            <Text style={styles.friendMoodEmoji}>{friendMood.emoji}</Text>
          </View>
          <View style={styles.friendMoodContent}>
            <Text style={styles.friendName} numberOfLines={1}>{friendMood.name}</Text>
            <Text style={styles.friendMoodLabel}>{friendMood.label} • {friendMood.timeAgo}</Text>
          </View>
          <Text style={styles.friendMoodValue}>{friendMood.mood}/10</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Daily Mood Check-in</Text>
          <Text style={styles.sectionSubtitle}>How are you feeling today?</Text>
        </View>
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => setShowMoodModal(true)}
          disabled={hasCheckedInToday}
        >
          <LinearGradient
            colors={hasCheckedInToday ? colors.gradients.muted : colors.gradients.accent}
            style={styles.checkInButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons 
              name={hasCheckedInToday ? "checkmark" : "heart"} 
              size={20} 
              color={colors.white} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Current Mood Display */}
      {currentMood && (
        <View style={styles.currentMoodCard}>
          <LinearGradient
            colors={[`${currentMood.color}20`, `${currentMood.color}10`]}
            style={styles.currentMoodGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.currentMoodContent}>
              <Text style={styles.currentMoodEmoji}>{currentMood.emoji}</Text>
              <View style={styles.currentMoodText}>
                <Text style={styles.currentMoodLabel}>
                  Today: {currentMood.label} ({currentMood.mood}/10)
                </Text>
                {currentMood.reflection && (
                  <Text style={styles.currentMoodReflection}>
                    "{currentMood.reflection}"
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Friends' Moods */}
      {friendMoods.length > 0 && (
        <View style={styles.friendMoodsSection}>
          <Text style={styles.friendMoodsTitle}>Friends' Moods</Text>
          <View style={styles.friendMoodsList}>
            {friendMoods.map(renderFriendMood)}
          </View>
        </View>
      )}

      {/* Mood Check-in Modal */}
      <Modal
        visible={showMoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#1A1A1F', '#2A2A35']}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Daily Mood Check-in</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowMoodModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Mood Selector */}
                {renderMoodSelector()}

                {/* Reflection Input */}
                <View style={styles.reflectionSection}>
                  <Text style={styles.reflectionTitle}>What's on your mind? (Optional)</Text>
                  <TextInput
                    style={styles.reflectionInput}
                    value={reflection}
                    onChangeText={setReflection}
                    placeholder="Share a quick thought about your day..."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    multiline
                    maxLength={100}
                  />
                  <Text style={styles.characterCount}>{reflection.length}/100</Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={saveMood}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.saveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="heart" size={20} color={colors.white} />
                    <Text style={styles.saveButtonText}>Save Mood Check-in</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
  checkInButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 12,
  },
  checkInButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentMoodCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentMoodGradient: {
    padding: 16,
  },
  currentMoodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentMoodEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  currentMoodText: {
    flex: 1,
  },
  currentMoodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  currentMoodReflection: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  friendMoodsSection: {
    marginTop: 8,
  },
  friendMoodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  friendMoodsList: {
    // Remove maxHeight to avoid truncation since we're not using ScrollView
  },
  friendMoodCard: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  friendMoodGradient: {
    padding: 12,
  },
  friendMoodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendMoodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendMoodEmoji: {
    fontSize: 16,
  },
  friendMoodContent: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  friendMoodLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  friendMoodValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodSelector: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodOption: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedMoodOption: {
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  moodValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  moodDescription: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  selectedMoodLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedMoodDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reflectionSection: {
    marginBottom: 24,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  reflectionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: colors.white,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default MoodTracker; 