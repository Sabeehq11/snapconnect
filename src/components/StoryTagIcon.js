import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/colors';

const getTagIcon = (tag) => {
  if (!tag) return { emoji: '📷', color: colors.textSecondary };
  
  const tagMap = {
    'study': { emoji: '📚', color: colors.primary },
    'food': { emoji: '🍕', color: colors.secondary },
    'campus': { emoji: '🏫', color: colors.accent },
    'campus life': { emoji: '🏫', color: colors.accent },
    'fitness': { emoji: '💪', color: colors.success },
    'creative': { emoji: '🎨', color: colors.warning },
    'music': { emoji: '🎵', color: colors.purple },
    'gaming': { emoji: '🎮', color: colors.info },
    'social': { emoji: '👥', color: colors.pink },
    'nature': { emoji: '🌸', color: colors.teal },
    'travel': { emoji: '✈️', color: colors.orange },
    'tech': { emoji: '💻', color: colors.cyan },
    'sports': { emoji: '⚽', color: colors.lime },
    'events': { emoji: '🎉', color: colors.warning },
    'tips': { emoji: '🎓', color: colors.primary },
    'dorm': { emoji: '🛋️', color: colors.secondary },
    'dorm life': { emoji: '🛋️', color: colors.secondary },
  };
  
  const normalizedTag = tag.toLowerCase().replace(/[^\w\s]/g, '').trim();
  return tagMap[normalizedTag] || { emoji: '📷', color: colors.textSecondary };
};

const StoryTagIcon = ({ 
  tag, 
  style, 
  size = 'medium',
  showBackground = true,
  customEmoji = null,
  customColor = null 
}) => {
  const tagData = getTagIcon(tag);
  const emoji = customEmoji || tagData.emoji;
  const color = customColor || tagData.color;
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return { container: 60, emoji: 24, background: 60 };
      case 'medium':
        return { container: 80, emoji: 32, background: 80 };
      case 'large':
        return { container: 120, emoji: 48, background: 120 };
      case 'xlarge':
        return { container: 160, emoji: 64, background: 160 };
      default:
        return { container: 80, emoji: 32, background: 80 };
    }
  };
  
  const sizes = getSize();
  
  if (!showBackground) {
    return (
      <View style={[styles.simpleContainer, style, {
        width: sizes.container,
        height: sizes.container,
      }]}>
        <Text style={[styles.emoji, { fontSize: sizes.emoji }]}>
          {emoji}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style, {
      width: sizes.container,
      height: sizes.container,
    }]}>
      <LinearGradient
        colors={[`${color}40`, `${color}20`, `${color}10`]}
        style={[styles.background, {
          width: sizes.background,
          height: sizes.background,
          borderRadius: sizes.background / 2,
        }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.iconContainer, {
          width: sizes.background * 0.7,
          height: sizes.background * 0.7,
          borderRadius: (sizes.background * 0.7) / 2,
          backgroundColor: `${color}80`,
        }]}>
          <Text style={[styles.emoji, { fontSize: sizes.emoji }]}>
            {emoji}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  background: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default StoryTagIcon; 