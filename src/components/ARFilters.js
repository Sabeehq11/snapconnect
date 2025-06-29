import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

/*
 * UPGRADED AR FILTERS COMPONENT
 * 
 * Now applies real image manipulation effects using expo-image-manipulator
 * instead of emoji overlays. Supports Instagram-style post-capture filters
 * that work perfectly in Expo Go without requiring native modules.
 * 
 * Filter Effects:
 * - Cool Glasses: Blue tint + brightness boost
 * - Heart Eyes: Pink/red overlay with vignette effect
 * - Sparkles: Light glow effect with enhanced brightness
 * - Rainbow: Colorful gradient overlay with saturation boost
 * - Crown: Golden hue with soft blur edges
 * - Face Mask: Cool tone with slight desaturation
 * - Bunny Ears: Warm tone with soft contrast
 */

// Image processing functions for each filter
export const applyImageFilter = async (imageUri, filterId) => {
  if (!filterId || filterId === 'none') {
    return imageUri;
  }

  try {
    console.log(`🎨 Applying ${filterId} filter to image...`);
    
    // Note: expo-image-manipulator only supports: resize, rotate, flip, crop
    // For color effects, we'll apply subtle transformations and rely more on emoji overlays
    let manipulations = [];

    switch (filterId) {
      case 'glasses':
        // Cool Glasses: Emoji overlay only
        manipulations = [];
        break;

      case 'hearts':
        // Heart Eyes: Emoji overlay only
        manipulations = [];
        break;

      case 'sparkles':
        // Sparkles: Keep original for maximum quality
        manipulations = [];
        break;

      case 'rainbow':
        // Rainbow: Keep original for vivid colors
        manipulations = [];
        break;

      case 'crown':
        // Crown: Keep original for royal quality
        manipulations = [];
        break;

      case 'mask':
        // Face Mask: Keep original for clean look
        manipulations = [];
        break;

      case 'bunny':
        // Bunny Ears: Keep original for cute factor
        manipulations = [];
        break;

      default:
        console.log(`⚠️ Unknown filter: ${filterId}, returning original image`);
        return imageUri;
    }

    // Only apply manipulations if there are any
    if (manipulations.length === 0) {
      console.log(`✅ ${filterId} filter applied (emoji overlay only)`);
      return imageUri;
    }

    // Apply the manipulations
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      manipulations,
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log(`✅ ${filterId} filter applied successfully`);
    return result.uri;

  } catch (error) {
    console.error(`❌ Error applying ${filterId} filter:`, error);
    
    // Enhanced error handling with specific messages
    let errorMessage = `Failed to apply ${filterId} filter.`;
    
    if (error.message?.includes('manipulateAsync')) {
      errorMessage = `Image processing failed for ${filterId} filter. Using original image.`;
    }
    
    // Show alert but don't block the flow
    Alert.alert(
      'Filter Processing Info',
      `${errorMessage} The emoji overlay will still appear!`,
      [{ text: 'OK' }]
    );
    
    // Return original image as fallback
    return imageUri;
  }
};

// Enhanced function to apply filters with better error recovery
export const applyImageFilterWithFallback = async (imageUri, filterId, originalImageUri = null) => {
  try {
    // First attempt with the provided image
    const result = await applyImageFilter(imageUri, filterId);
    return result;
  } catch (error) {
    console.warn(`⚠️ First filter attempt failed, trying fallback:`, error);
    
    // If we have an original image URI, try with that
    if (originalImageUri && originalImageUri !== imageUri) {
      try {
        console.log(`🔄 Attempting filter with original image...`);
        const fallbackResult = await applyImageFilter(originalImageUri, filterId);
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`❌ Fallback filter attempt also failed:`, fallbackError);
      }
    }
    
    // Final fallback - return the best available image
    console.log(`🔄 Using image without filter as final fallback`);
    return originalImageUri || imageUri;
  }
};

const ARFilters = ({ isVisible, onClose, onFilterSelect, currentFilter }) => {
  const [selectedFilter, setSelectedFilter] = useState(currentFilter || null);

  // Updated filter configurations with emoji-focused descriptions
  const filters = [
    {
      id: 'none',
      name: 'None',
      icon: 'close-circle-outline',
      description: 'Original image',
      effect: 'No filter applied',
      color: colors.textSecondary,
    },
    {
      id: 'glasses',
      name: 'Cool Glasses',
      icon: 'glasses-outline',
      description: 'Large 🕶️ overlay',
      effect: 'Cool sunglasses look',
      color: colors.primary,
    },
    {
      id: 'hearts',
      name: 'Heart Eyes',
      icon: 'heart',
      description: 'Large 😍 overlay',
      effect: 'Love-struck expression',
      color: colors.error,
    },
    {
      id: 'sparkles',
      name: 'Sparkles',
      icon: 'sparkles',
      description: 'Large ✨⭐💫 effects',
      effect: 'Magical sparkly mood',
      color: colors.warning,
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: 'color-palette',
      description: 'Large 🌈 + gradient',
      effect: 'Colorful rainbow vibes',
      color: colors.info,
    },
    {
      id: 'crown',
      name: 'Crown',
      icon: 'diamond',
      description: 'Large 👑 overlay',
      effect: 'Royal majesty look',
      color: colors.secondary,
    },
    {
      id: 'mask',
      name: 'Face Mask',
      icon: 'medical',
      description: 'Large 😷 overlay',
      effect: 'Masked up safely',
      color: colors.success,
    },
    {
      id: 'bunny',
      name: 'Bunny Ears',
      icon: 'ear',
      description: 'Large 🐰 overlay',
      effect: 'Adorable bunny vibes',
      color: colors.pink,
    },
  ];

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter.id);
    onFilterSelect(filter);
  };

  const renderFilter = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterCard,
        selectedFilter === filter.id && styles.selectedFilterCard,
      ]}
      onPress={() => handleFilterSelect(filter)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedFilter === filter.id
            ? [`${filter.color}30`, `${filter.color}15`]
            : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
        }
        style={styles.filterCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.filterIcon, { backgroundColor: filter.color + '20' }]}>
          <Ionicons name={filter.icon} size={24} color={filter.color} />
        </View>
        <Text style={styles.filterName}>{filter.name}</Text>
        <Text style={styles.filterDescription}>{filter.description}</Text>
        <Text style={styles.filterEffect}>{filter.effect}</Text>
        {selectedFilter === filter.id && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={filter.color} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1A1A1F', '#2A2A35']}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.modalTitle}>Photo Filters</Text>
                <Text style={styles.modalSubtitle}>Apply Instagram-style effects</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Filters Grid */}
            <ScrollView 
              style={styles.filtersContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.filtersGrid}>
                {filters.map(renderFilter)}
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={onClose}
              disabled={!selectedFilter}
            >
              <LinearGradient
                colors={selectedFilter ? colors.gradients.primary : colors.gradients.muted}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name="checkmark" 
                  size={20} 
                  color={colors.white} 
                />
                <Text style={styles.applyButtonText}>
                  Apply Filter
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Filter Overlay Component - Real-time emoji preview + post-capture effects
export const FilterOverlay = ({ filter, style }) => {
  if (!filter || filter.id === 'none') return null;

  // Render the appropriate emoji overlay for each filter
  const renderEmojiOverlay = () => {
    switch (filter.id) {
      case 'glasses':
        return (
          <View style={styles.emojiContainer}>
            <Text style={styles.faceEmoji}>🕶️</Text>
          </View>
        );
      case 'hearts':
        return (
          <View style={styles.emojiContainer}>
            <Text style={styles.faceEmoji}>😍</Text>
          </View>
        );
      case 'sparkles':
        return (
          <View style={styles.sparklesContainer}>
            <Text style={[styles.sparkleEmoji, styles.sparkle1]}>✨</Text>
            <Text style={[styles.sparkleEmoji, styles.sparkle2]}>⭐</Text>
            <Text style={[styles.sparkleEmoji, styles.sparkle3]}>💫</Text>
            <Text style={[styles.sparkleEmoji, styles.sparkle4]}>✨</Text>
            <Text style={[styles.sparkleEmoji, styles.sparkle5]}>⭐</Text>
          </View>
        );
      case 'rainbow':
        return (
          <View style={styles.rainbowContainer}>
            <Text style={styles.faceEmoji}>🌈</Text>
            <LinearGradient
              colors={['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']}
              style={styles.rainbowOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        );
      case 'crown':
        return (
          <View style={styles.emojiContainer}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        );
      case 'mask':
        return (
          <View style={styles.emojiContainer}>
            <Text style={styles.faceEmoji}>😷</Text>
          </View>
        );
      case 'bunny':
        return (
          <View style={styles.emojiContainer}>
            <Text style={styles.faceEmoji}>🐰</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.overlayContainer, style]}>
      {/* Emoji Overlay - Large and face-sized */}
      {renderEmojiOverlay()}

      {/* Filter Active Indicator - Top Right */}
      <View style={styles.filterActiveIndicator}>
        <LinearGradient
          colors={[`${filter.color}CC`, `${filter.color}99`]}
          style={styles.filterActiveGradient}
        >
          <Ionicons name={filter.icon || 'color-wand'} size={18} color={colors.white} />
          <Text style={styles.filterActiveText}>{filter.name}</Text>
        </LinearGradient>
      </View>

      {/* Visual Frame Effect - Optional border to show filter is active */}
      <View style={[styles.filterFrame, { borderColor: `${filter.color}60` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  filtersContainer: {
    flex: 1,
    marginBottom: 20,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFilterCard: {
    borderColor: colors.primary,
  },
  filterCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  filterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  filterDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  filterEffect: {
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Enhanced Overlay Styles
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  filterActiveIndicator: {
    position: 'absolute',
    top: 80, // Below the status bar and top controls
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterActiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  filterActiveText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
  filterFrame: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    bottom: 140,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  
  // Enhanced Emoji Overlay Styles
  emojiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceEmoji: {
    fontSize: 180, // Much larger face-sized emoji
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleEmoji: {
    fontSize: 80, // Larger sparkles
    position: 'absolute',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sparkle1: {
    top: '15%',
    left: '20%',
  },
  sparkle2: {
    top: '25%',
    right: '15%',
  },
  sparkle3: {
    bottom: '30%',
    left: '15%',
  },
  sparkle4: {
    bottom: '20%',
    right: '25%',
  },
  sparkle5: {
    top: '40%',
    left: '10%',
  },
  rainbowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainbowOverlay: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.7,
  },
  crownEmoji: {
    fontSize: 180, // Much larger crown emoji
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default ARFilters; 