import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';
import RAGService from '../utils/ragService';
import { useStories } from '../hooks/useStories';
import { uploadStoryImage } from '../utils/imageUploader';

const { width } = Dimensions.get('window');

const StoryPublishScreen = ({ navigation, route }) => {
  const { imageUri, imageInfo } = route.params || {};
  const { user } = useAuth();
  const { createStory, fetchStories } = useStories();
  
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [caption, setCaption] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const storyDestinations = [
    {
      id: 'my_story',
      title: 'My Story',
      subtitle: 'Share with your friends',
      icon: '👤',
      color: colors.primary,
      type: 'personal'
    },
    {
      id: 'study',
      title: 'Study Stories',
      subtitle: 'Campus study life',
      icon: '📚',
      color: colors.primary,
      type: 'campus'
    },
    {
      id: 'food',
      title: 'Food Stories',
      subtitle: 'Campus dining & treats',
      icon: '🍕',
      color: colors.secondary,
      type: 'campus'
    },
    {
      id: 'campus_life',
      title: 'Campus Life',
      subtitle: 'General campus activities',
      icon: '🏫',
      color: colors.accent,
      type: 'campus'
    },
    {
      id: 'fitness',
      title: 'Fitness',
      subtitle: 'Workouts & sports',
      icon: '💪',
      color: colors.success,
      type: 'campus'
    },
    {
      id: 'events',
      title: 'Events',
      subtitle: 'Campus events & parties',
      icon: '🎉',
      color: colors.warning,
      type: 'campus'
    },
    {
      id: 'dorm_life',
      title: 'Dorm Life',
      subtitle: 'Residence hall moments',
      icon: '🛋️',
      color: colors.info,
      type: 'campus'
    },
    {
      id: 'social',
      title: 'Social',
      subtitle: 'Hanging with friends',
      icon: '👥',
      color: colors.pink,
      type: 'campus'
    },
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Beats, jams & performances',
      icon: '🎵',
      color: colors.purple,
      type: 'campus'
    }
  ];

  useEffect(() => {
    if (!imageUri) {
      Alert.alert('Error', 'No image provided');
      navigation.goBack();
    }
  }, [imageUri]);

  const handleDestinationSelect = async (destination) => {
    console.log('📍 Story destination selected:', destination.title);
    setSelectedDestination(destination);
    
    // Immediately show AI suggestions section and start generating
    setShowAiSuggestions(true);
    
    // Generate AI suggestions for all destinations
    await generateAiSuggestions(destination);
  };

  const generateAiSuggestions = async (destination) => {
    if (!user?.id) return;
    
    setLoadingSuggestions(true);
    setAiSuggestions([]);
    
    try {
      console.log('🤖 Generating AI captions for:', destination.title);
      
      // Create context for the specific story type
      const contextText = `Story for ${destination.title.toLowerCase()} category. ${destination.subtitle}`;
      
      const ragCaptions = await RAGService.generateStudyGroupCaptions(user.id, contextText);
      console.log('✅ Generated AI captions:', ragCaptions);
      
      if (ragCaptions && ragCaptions.length > 0) {
        setAiSuggestions(ragCaptions);
      } else {
        // Fallback captions based on destination
        const fallbackCaptions = getFallbackCaptions(destination);
        setAiSuggestions(fallbackCaptions);
      }
      
    } catch (error) {
      console.error('❌ Error generating AI captions:', error);
      const fallbackCaptions = getFallbackCaptions(destination);
      setAiSuggestions(fallbackCaptions);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getFallbackCaptions = (destination) => {
    const fallbacks = {
      my_story: [
        "Just me living my best life ✨",
        "Another day, another adventure 📸",
        "Sharing my world with you 💫",
        "Good vibes and great times 🌟"
      ],
      study: [
        "Late night study sessions hit different 📚",
        "Grinding for that A+ ✨",
        "Library life is the best life 🤓",
        "Study group energy is unmatched 💪"
      ],
      food: [
        "Campus food actually slaps today 🍕",
        "Dining hall adventures continue 😋",
        "This hit the spot perfectly! 🔥",
        "Food coma incoming... worth it 😴"
      ],
      campus_life: [
        "Another day, another campus adventure 🏫",
        "Living my best college life! ✨",
        "Campus vibes are immaculate today 📸",
        "Making memories one day at a time 💫"
      ],
      fitness: [
        "Getting those gains at the rec center 💪",
        "Workout complete, feeling amazing! 🔥",
        "Fitness journey continues strong 💯",
        "Post-workout glow is real ✨"
      ],
      events: [
        "This event is absolutely incredible! 🎉",
        "Campus events never disappoint 🔥",
        "Making memories at this amazing event 📸",
        "The energy here is unmatched! ⚡"
      ],
      dorm_life: [
        "Dorm life adventures continue 🛋️",
        "Home sweet dorm home 🏠",
        "Residence hall shenanigans 😂",
        "Living the dorm life to the fullest! ✨"
      ],
      social: [
        "Squad goals achieved today 👥",
        "Friends make everything better ❤️",
        "Social battery fully recharged! ⚡",
        "Good vibes with great people 🌟"
      ],
      music: [
        "When the beat drops just right 🎵",
        "Music is my therapy 🎧",
        "Jamming to the perfect playlist 🎶",
        "This song hits different 🔥"
      ]
    };
    
    return fallbacks[destination.id] || [
      "Living my best life! ✨",
      "Another amazing day 📸",
      "Making memories that will last forever 💫",
      "Good vibes only 🌟"
    ];
  };

  const handleCaptionSelect = (selectedCaption) => {
    setCaption(selectedCaption);
    console.log('✅ Caption selected:', selectedCaption);
  };

  const handlePublishStory = async () => {
    if (!selectedDestination) {
      Alert.alert('Select Destination', 'Please choose where to post your story');
      return;
    }

    setPosting(true);
    
    try {
      console.log('📤 Publishing story...', {
        destination: selectedDestination.title,
        caption: caption,
        imageUri: imageUri
      });

      // First upload the image to get a public URL
      console.log('📖 Uploading story image...');
      const uploadResult = await uploadStoryImage(imageUri, user.id);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      console.log('✅ Story upload succeeded:', uploadResult);

      // Create the story with the uploaded image URL
      const storyData = await createStory(
        uploadResult.publicUrl,
        'image',
        caption || `Posted to ${selectedDestination.title}`,
        selectedDestination.id,
        selectedDestination.type
      );
      
      console.log('✅ Story published successfully!', storyData);
      
      // Navigate back to Stories tab and show success
      navigation.navigate('MainTabs', { 
        screen: 'Stories',
        params: {
          storyPublished: true,
          publishedTo: selectedDestination.title 
        }
      });
      
    } catch (error) {
      console.error('❌ Error publishing story:', error);
      Alert.alert('Error', `Failed to publish story: ${error.message}`);
    } finally {
      setPosting(false);
    }
  };

  const renderDestinationCard = (destination) => (
    <TouchableOpacity
      key={destination.id}
      style={[
        styles.destinationCard,
        selectedDestination?.id === destination.id && styles.selectedDestinationCard
      ]}
      onPress={() => handleDestinationSelect(destination)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${destination.color}20`, `${destination.color}10`]}
        style={styles.destinationGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.destinationContent}>
          <View style={[styles.destinationIcon, { backgroundColor: destination.color }]}>
            <Text style={styles.destinationIconText}>{destination.icon}</Text>
          </View>
          <View style={styles.destinationText}>
            <Text style={styles.destinationTitle}>{destination.title}</Text>
            <Text style={styles.destinationSubtitle}>{destination.subtitle}</Text>
          </View>
          {selectedDestination?.id === destination.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={destination.color} />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publish Story</Text>
        <TouchableOpacity 
          onPress={handlePublishStory}
          style={[styles.publishButton, (!selectedDestination || posting) && styles.publishButtonDisabled]}
          disabled={!selectedDestination || posting}
        >
          <LinearGradient
            colors={selectedDestination && !posting ? colors.gradients.primary : ['#666', '#888']}
            style={styles.publishGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.publishButtonText}>
              {posting ? 'Publishing...' : 'Publish'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>

        {/* Step 1: Choose Destination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where do you want to share this?</Text>
          <Text style={styles.sectionSubtitle}>Choose your story destination</Text>
          
          <View style={styles.destinationsGrid}>
            {storyDestinations.map(renderDestinationCard)}
          </View>
        </View>

        {/* Step 2: AI Caption Suggestions */}
        {showAiSuggestions && selectedDestination && (
          <View style={styles.section}>
            <View style={styles.captionHeader}>
              <View style={styles.aiIconContainer}>
                <LinearGradient
                  colors={colors.gradients.accent}
                  style={styles.aiIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles" size={16} color={colors.white} />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>AI Caption Suggestions</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Perfect captions for {selectedDestination.title}
            </Text>

            {loadingSuggestions ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Generating perfect captions...</Text>
              </View>
            ) : (
              <View style={styles.suggestionsContainer}>
                {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.suggestionCard,
                      caption === suggestion && styles.selectedSuggestionCard
                    ]}
                    onPress={() => handleCaptionSelect(suggestion)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    {caption === suggestion && (
                      <View style={styles.suggestionSelected}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Custom Caption Input */}
            <View style={styles.customCaptionContainer}>
              <Text style={styles.customCaptionLabel}>Or write your own:</Text>
              <TextInput
                style={styles.customCaptionInput}
                placeholder="Add a caption..."
                placeholderTextColor={colors.textSecondary}
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={200}
              />
            </View>
          </View>
        )}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  publishButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imagePreview: {
    width: width * 0.6,
    height: width * 0.8,
    borderRadius: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  destinationsGrid: {
    gap: 12,
  },
  destinationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedDestinationCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  destinationGradient: {
    padding: 16,
  },
  destinationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destinationIconText: {
    fontSize: 24,
  },
  destinationText: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  destinationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  captionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIconContainer: {
    marginRight: 12,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  suggestionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedSuggestionCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  suggestionText: {
    color: colors.white,
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  suggestionSelected: {
    marginLeft: 8,
  },
  customCaptionContainer: {
    marginTop: 20,
  },
  customCaptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  customCaptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: colors.white,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default StoryPublishScreen; 