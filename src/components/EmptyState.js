import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import GlassView from './GlassView';
import NeuButton from './NeuButton';

const EmptyState = ({ 
  type = 'general',
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
  customIcon,
  animateOnMount = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animateOnMount) {
      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.duration.slow,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation for icon
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [animateOnMount]);

  const getEmptyStateConfig = () => {
    const configs = {
      noChats: {
        icon: 'chatbubbles-outline',
        iconType: 'Ionicons',
        title: 'No Conversations Yet',
        subtitle: 'Start chatting with your friends to see your conversations here.',
        actionText: 'Start a Chat',
        gradient: colors.gradients.primary,
        illustration: '💬',
      },
      noFriends: {
        icon: 'people-outline',
        iconType: 'Ionicons',
        title: 'No Friends Yet',
        subtitle: 'Add friends to start connecting and sharing moments together.',
        actionText: 'Add Friends',
        gradient: colors.gradients.secondary,
        illustration: '👥',
      },
      noStories: {
        icon: 'camera-outline',
        iconType: 'Ionicons',
        title: 'No Stories to Show',
        subtitle: 'Capture and share your moments with friends.',
        actionText: 'Create Story',
        gradient: colors.gradients.accent,
        illustration: '📸',
      },
      noRequests: {
        icon: 'mail-outline',
        iconType: 'Ionicons',
        title: 'No Friend Requests',
        subtitle: 'When someone sends you a friend request, it will appear here.',
        actionText: null,
        gradient: colors.gradients.deepSea,
        illustration: '📫',
      },
      noResults: {
        icon: 'search-outline',
        iconType: 'Ionicons',
        title: 'No Results Found',
        subtitle: 'Try adjusting your search terms or browse other sections.',
        actionText: 'Clear Search',
        gradient: colors.gradients.arctic,
        illustration: '🔍',
      },
      general: {
        icon: 'alert-circle-outline',
        iconType: 'Ionicons',
        title: 'Nothing Here Yet',
        subtitle: 'Content will appear here when available.',
        actionText: null,
        gradient: colors.gradients.primary,
        illustration: '✨',
      },
    };

    return configs[type] || configs.general;
  };

  const config = getEmptyStateConfig();
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;
  const displayActionText = actionText || config.actionText;
  const IconComponent = config.iconType === 'MaterialIcons' ? MaterialIcons : Ionicons;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <GlassView style={styles.glassContainer} intensity="light" tint="dark">
        {/* Illustration Background */}
        <View style={styles.illustrationContainer}>
          <Animated.View
            style={[
              styles.illustrationBackground,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={config.gradient}
              style={styles.illustrationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          
          {/* Icon or Custom Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {customIcon || (
              <IconComponent
                name={config.icon}
                size={48}
                color={colors.white}
              />
            )}
          </Animated.View>
          
          {/* Emoji Illustration */}
          <Text style={styles.illustration}>{config.illustration}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.subtitle}>{displaySubtitle}</Text>
          
          {displayActionText && onActionPress && (
            <View style={styles.actionContainer}>
              <NeuButton
                size="medium"
                gradient={config.gradient}
                onPress={onActionPress}
                style={styles.actionButton}
              >
                {displayActionText}
              </NeuButton>
            </View>
          )}
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          {[...Array(3)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.decorativeCircle,
                {
                  opacity: 0.1,
                  transform: [
                    { 
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [1, 1.2 + index * 0.1],
                      })
                    }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={config.gradient}
                style={styles.decorativeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          ))}
        </View>
      </GlassView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  glassContainer: {
    width: '100%',
    maxWidth: 320,
    padding: theme.spacing.xl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    position: 'relative',
  },
  illustrationBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    top: -10,
  },
  illustrationGradient: {
    flex: 1,
    borderRadius: 60,
    opacity: 0.2,
  },
  iconContainer: {
    zIndex: 2,
    marginBottom: theme.spacing.sm,
  },
  illustration: {
    fontSize: 24,
    marginTop: theme.spacing.sm,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.normal,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.fontSizes.md,
    marginBottom: theme.spacing.lg,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 140,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -100,
  },
  decorativeGradient: {
    flex: 1,
    borderRadius: 100,
  },
});

export default EmptyState; 