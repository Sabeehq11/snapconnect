import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import GlassView from './GlassView';

const REACTIONS = [
  { emoji: '❤️', name: 'love', color: '#FF6B6B' },
  { emoji: '😂', name: 'laugh', color: '#FFD93D' },
  { emoji: '😮', name: 'wow', color: '#74C0FC' },
  { emoji: '😢', name: 'sad', color: '#8CE99A' },
  { emoji: '😡', name: 'angry', color: '#FFA8A8' },
  { emoji: '👍', name: 'like', color: '#69DB7C' },
];

const MessageReactions = ({ 
  messageId,
  reactions = {},
  onReactionPress,
  onReactionLongPress,
  showReactionPicker = false,
  onReactionPickerClose,
  position = 'bottom',
  style,
}) => {
  const [showPicker, setShowPicker] = useState(showReactionPicker);
  const animatedValues = useRef(
    REACTIONS.reduce((acc, reaction) => {
      acc[reaction.name] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  const pickerScale = useRef(new Animated.Value(0)).current;
  const pickerOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (showReactionPicker) {
      setShowPicker(true);
      Animated.parallel([
        Animated.spring(pickerScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(pickerOpacity, {
          toValue: 1,
          duration: theme.animations.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(pickerScale, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(pickerOpacity, {
          toValue: 0,
          duration: theme.animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowPicker(false);
      });
    }
  }, [showReactionPicker]);

  const handleReactionPress = (reaction) => {
    // Animate the reaction
    const animatedValue = animatedValues[reaction.name];
    
    Animated.sequence([
      Animated.spring(animatedValue, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
    ]).start();

    onReactionPress?.(messageId, reaction.name);
    onReactionPickerClose?.();
  };

  const renderReactionButton = (reaction) => {
    const count = reactions[reaction.name] || 0;
    const hasReacted = count > 0;
    
    if (!hasReacted && !showPicker) return null;

    return (
      <TouchableOpacity
        key={reaction.name}
        style={[
          styles.reactionButton,
          hasReacted && styles.reactionButtonActive,
        ]}
        onPress={() => handleReactionPress(reaction)}
        onLongPress={() => onReactionLongPress?.(messageId, reaction.name)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={{
            transform: [{ scale: animatedValues[reaction.name] }],
          }}
        >
          <LinearGradient
            colors={hasReacted ? [reaction.color, colors.primary] : colors.gradients.glassLight}
            style={styles.reactionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            {count > 0 && (
              <Text style={[
                styles.reactionCount,
                hasReacted && styles.reactionCountActive
              ]}>
                {count}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderReactionPicker = () => (
    <Modal
      visible={showPicker}
      transparent
      animationType="none"
      onRequestClose={onReactionPickerClose}
    >
      <TouchableOpacity
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={onReactionPickerClose}
      >
        <Animated.View
          style={[
            styles.pickerContainer,
            {
              transform: [{ scale: pickerScale }],
              opacity: pickerOpacity,
            },
            position === 'top' && styles.pickerTop,
          ]}
        >
          <GlassView style={styles.pickerContent} intensity="heavy" tint="dark">
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>React to message</Text>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={onReactionPickerClose}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerReactions}>
              {REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction.name}
                  style={styles.pickerReactionButton}
                  onPress={() => handleReactionPress(reaction)}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.pickerReactionContent,
                      {
                        transform: [{ scale: animatedValues[reaction.name] }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[reaction.color, colors.primary]}
                      style={styles.pickerReactionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.pickerReactionEmoji}>{reaction.emoji}</Text>
                    </LinearGradient>
                    <Text style={styles.pickerReactionName}>{reaction.name}</Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </GlassView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const hasReactions = Object.values(reactions).some(count => count > 0);

  return (
    <View style={[styles.container, style]}>
      {hasReactions && (
        <View style={styles.reactionsContainer}>
          {REACTIONS.map(renderReactionButton)}
        </View>
      )}
      {renderReactionPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  reactionButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    minWidth: 40,
    height: 28,
  },
  reactionButtonActive: {
    ...theme.shadows.sm,
  },
  reactionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  reactionCount: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  reactionCountActive: {
    color: colors.white,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: 300,
    maxWidth: '90%',
  },
  pickerTop: {
    marginTop: -100,
  },
  pickerContent: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pickerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  pickerCloseButton: {
    padding: theme.spacing.xs,
  },
  pickerReactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  pickerReactionButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  pickerReactionContent: {
    alignItems: 'center',
  },
  pickerReactionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  pickerReactionEmoji: {
    fontSize: 24,
  },
  pickerReactionName: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});

export default MessageReactions; 