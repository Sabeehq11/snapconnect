import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';

const STORY_TAGS = [
  { id: 'study', emoji: '📚', label: 'Study', color: colors.primary },
  { id: 'food', emoji: '🍕', label: 'Food', color: colors.secondary },
  { id: 'campus', emoji: '🏫', label: 'Campus Life', color: colors.accent },
  { id: 'fitness', emoji: '💪', label: 'Fitness', color: colors.success },
  { id: 'creative', emoji: '🎨', label: 'Creative', color: colors.warning },
  { id: 'music', emoji: '🎵', label: 'Music', color: colors.purple },
  { id: 'gaming', emoji: '🎮', label: 'Gaming', color: colors.info },
  { id: 'social', emoji: '👥', label: 'Social', color: colors.pink },
  { id: 'nature', emoji: '🌸', label: 'Nature', color: colors.teal },
  { id: 'travel', emoji: '✈️', label: 'Travel', color: colors.orange },
  { id: 'tech', emoji: '💻', label: 'Tech', color: colors.cyan },
  { id: 'sports', emoji: '⚽', label: 'Sports', color: colors.lime },
];

const StoryTagSelector = ({ visible, onClose, onSelectTag, selectedTag }) => {
  const [hoveredTag, setHoveredTag] = useState(null);

  const handleTagSelect = (tag) => {
    onSelectTag(tag);
    onClose();
  };

  const renderTagItem = (tag) => {
    const isSelected = selectedTag?.id === tag.id;
    const isHovered = hoveredTag === tag.id;
    
    return (
      <TouchableOpacity
        key={tag.id}
        style={[
          styles.tagItem,
          isSelected && styles.tagItemSelected,
          isHovered && styles.tagItemHovered,
        ]}
        activeOpacity={0.8}
        onPress={() => handleTagSelect(tag)}
        onPressIn={() => setHoveredTag(tag.id)}
        onPressOut={() => setHoveredTag(null)}
      >
        <LinearGradient
          colors={isSelected ? 
            [tag.color, `${tag.color}CC`] : 
            ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
          }
          style={styles.tagItemGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tagContent}>
            <Text style={styles.tagEmoji}>{tag.emoji}</Text>
            <Text style={[
              styles.tagLabel,
              isSelected && styles.tagLabelSelected
            ]}>
              {tag.label}
            </Text>
            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color={colors.white} />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1A1A1F', '#2A2A3F']}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.tagIcon}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.tagIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="pricetag" size={20} color={colors.white} />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Choose a Tag</Text>
                  <Text style={styles.subtitle}>
                    Categorize your story to help others discover it
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.tagsGrid}>
                {STORY_TAGS.map(renderTagItem)}
              </View>
              
              {/* Optional: No Tag Option */}
              <TouchableOpacity
                style={[styles.noTagOption, selectedTag === null && styles.noTagSelected]}
                activeOpacity={0.8}
                onPress={() => handleTagSelect(null)}
              >
                <LinearGradient
                  colors={selectedTag === null ?
                    ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] :
                    ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.01)']
                  }
                  style={styles.noTagGradient}
                >
                  <Ionicons 
                    name="remove-circle-outline" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.noTagText}>No Tag</Text>
                  {selectedTag === null && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagIcon: {
    marginRight: 12,
  },
  tagIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tagItem: {
    width: '48%',
    height: 80,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  tagItemHovered: {
    transform: [{ scale: 0.98 }],
  },
  tagItemGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  tagContent: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  tagEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  tagLabelSelected: {
    color: colors.white,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTagOption: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noTagSelected: {
    borderColor: colors.textSecondary,
    borderWidth: 2,
  },
  noTagGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  noTagText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
});

export default StoryTagSelector; 