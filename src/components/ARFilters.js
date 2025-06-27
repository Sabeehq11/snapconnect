import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

/*
 * AR FILTERS COMPONENT
 * 
 * NOTE: This component provides simple overlay effects that work in Expo Go.
 * True AR filters with face detection require native modules that don't work in Expo Go.
 * 
 * For production builds, you could integrate:
 * - expo-camera with FaceDetector
 * - react-native-vision-camera with face detection
 * - Third-party AR SDKs
 * 
 * Current implementation provides overlay effects that can be applied to photos after capture.
 */

const ARFilters = ({ isVisible, onClose, onFilterSelect, currentFilter }) => {
  const [selectedFilter, setSelectedFilter] = useState(currentFilter || null);

  // Filter configurations
  const filters = [
    {
      id: 'none',
      name: 'None',
      icon: 'close-circle-outline',
      description: 'No filter',
      overlay: null,
      color: colors.textSecondary,
    },
    {
      id: 'glasses',
      name: 'Cool Glasses',
      icon: 'glasses-outline',
      description: 'Virtual sunglasses',
      overlay: 'glasses',
      color: colors.primary,
    },
    {
      id: 'hearts',
      name: 'Heart Eyes',
      icon: 'heart',
      description: 'Heart-shaped eyes',
      overlay: 'hearts',
      color: colors.error,
    },
    {
      id: 'sparkles',
      name: 'Sparkles',
      icon: 'sparkles',
      description: 'Magical sparkles',
      overlay: 'sparkles',
      color: colors.warning,
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: 'color-palette',
      description: 'Rainbow effect',
      overlay: 'rainbow',
      color: colors.info,
    },
    {
      id: 'crown',
      name: 'Crown',
      icon: 'diamond',
      description: 'Royal crown',
      overlay: 'crown',
      color: colors.secondary,
    },
    {
      id: 'mask',
      name: 'Face Mask',
      icon: 'medical',
      description: 'Stylish face mask',
      overlay: 'mask',
      color: colors.success,
    },
    {
      id: 'bunny',
      name: 'Bunny Ears',
      icon: 'ear',
      description: 'Cute bunny ears',
      overlay: 'bunny',
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
                <Text style={styles.modalTitle}>AR Filters</Text>
                <Text style={styles.modalSubtitle}>Choose an overlay effect</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Expo Go Limitation Notice */}
            <View style={styles.limitationNotice}>
              <View style={styles.noticeIcon}>
                <Ionicons name="information-circle" size={20} color={colors.warning} />
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Expo Go Limitation</Text>
                <Text style={styles.noticeText}>
                  Real-time AR face tracking requires native modules. These filters apply simple overlays after photo capture.
                </Text>
              </View>
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

// Filter Overlay Component (for displaying active filter on camera)
export const FilterOverlay = ({ filter, style }) => {
  if (!filter || filter.id === 'none') return null;

  const renderOverlay = () => {
    switch (filter.overlay) {
      case 'glasses':
        return (
          <View style={[styles.overlayContainer, style]}>
            <View style={styles.glassesOverlay}>
              <Text style={styles.overlayEmoji}>🕶️</Text>
            </View>
          </View>
        );
      case 'hearts':
        return (
          <View style={[styles.overlayContainer, style]}>
            <View style={styles.heartsOverlay}>
              <Text style={styles.overlayEmoji}>😍</Text>
            </View>
          </View>
        );
      case 'sparkles':
        return (
          <View style={[styles.overlayContainer, style]}>
            <View style={styles.sparklesOverlay}>
              <Text style={styles.sparkleEmoji}>✨</Text>
              <Text style={[styles.sparkleEmoji, styles.sparkle2]}>⭐</Text>
              <Text style={[styles.sparkleEmoji, styles.sparkle3]}>💫</Text>
            </View>
          </View>
        );
      case 'rainbow':
        return (
          <View style={[styles.overlayContainer, style]}>
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
          <View style={[styles.overlayContainer, style]}>
            <View style={styles.crownOverlay}>
              <Text style={styles.overlayEmoji}>👑</Text>
            </View>
          </View>
        );
      case 'mask':
        return (
          <View style={[styles.overlayContainer, style]}>
            <View style={styles.maskOverlay}>
              <Text style={styles.overlayEmoji}>😷</Text>
            </View>
          </View>
        );
      case 'bunny':
        return (
          <View style={[styles.overlayContainer, style]}>
            <View style={styles.bunnyOverlay}>
              <Text style={styles.overlayEmoji}>🐰</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return renderOverlay();
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
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
  limitationNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  noticeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
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
    minHeight: 120,
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
  // Overlay Styles
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  glassesOverlay: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
  },
  heartsOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
  },
  sparklesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rainbowOverlay: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.7,
  },
  crownOverlay: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
  },
  maskOverlay: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
  },
  bunnyOverlay: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
  },
  overlayEmoji: {
    fontSize: 60,
    textAlign: 'center',
  },
  sparkleEmoji: {
    fontSize: 30,
    position: 'absolute',
  },
  sparkle2: {
    top: '20%',
    right: '20%',
  },
  sparkle3: {
    bottom: '30%',
    left: '15%',
  },
});

export default ARFilters; 