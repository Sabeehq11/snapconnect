import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, theme } from '../utils/colors';

const LiveStatusIndicator = ({ 
  status = 'offline', // 'online', 'typing', 'away', 'busy', 'offline'
  userName,
  style,
  showText = true,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const typingAnim1 = useRef(new Animated.Value(0)).current;
  const typingAnim2 = useRef(new Animated.Value(0)).current;
  const typingAnim3 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = {
    small: { 
      indicator: 8, 
      fontSize: theme.typography.fontSizes.xs,
      padding: theme.spacing.xs,
    },
    medium: { 
      indicator: 12, 
      fontSize: theme.typography.fontSizes.sm,
      padding: theme.spacing.sm,
    },
    large: { 
      indicator: 16, 
      fontSize: theme.typography.fontSizes.md,
      padding: theme.spacing.md,
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    let pulseAnimation;
    let typingAnimation;
    let scaleAnimation;

    if (status === 'online' || status === 'away' || status === 'busy') {
      // Pulse animation for online status
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Subtle scale animation
      scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      scaleAnimation.start();
    } else if (status === 'typing') {
      // Typing animation
      const createTypingAnimation = (animValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      typingAnimation = Animated.parallel([
        createTypingAnimation(typingAnim1, 0),
        createTypingAnimation(typingAnim2, 200),
        createTypingAnimation(typingAnim3, 400),
      ]);
      typingAnimation.start();
    }

    return () => {
      pulseAnimation?.stop();
      typingAnimation?.stop();
      scaleAnimation?.stop();
    };
  }, [status]);

  const getStatusConfig = () => {
    const configs = {
      online: {
        color: colors.success,
        gradient: [colors.success, colors.successLight],
        text: 'Active now',
        glow: colors.success,
      },
      typing: {
        color: colors.primary,
        gradient: colors.gradients.primary,
        text: 'typing...',
        glow: colors.primary,
      },
      away: {
        color: colors.warning,
        gradient: [colors.warning, colors.warningLight],
        text: 'Away',
        glow: colors.warning,
      },
      busy: {
        color: colors.error,
        gradient: [colors.error, colors.errorLight],
        text: 'Busy',
        glow: colors.error,
      },
      offline: {
        color: colors.textMuted,
        gradient: [colors.textMuted, colors.medium],
        text: 'Offline',
        glow: null,
      },
    };

    return configs[status] || configs.offline;
  };

  const statusConfig = getStatusConfig();

  const renderStatusIndicator = () => {
    if (status === 'typing') {
      return (
        <View style={[styles.typingContainer, { width: config.indicator * 2 }]}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                width: config.indicator / 3,
                height: config.indicator / 3,
                opacity: typingAnim1,
                backgroundColor: statusConfig.color,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                width: config.indicator / 3,
                height: config.indicator / 3,
                opacity: typingAnim2,
                backgroundColor: statusConfig.color,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                width: config.indicator / 3,
                height: config.indicator / 3,
                opacity: typingAnim3,
                backgroundColor: statusConfig.color,
              },
            ]}
          />
        </View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.statusIndicator,
          {
            width: config.indicator,
            height: config.indicator,
            transform: [{ scale: pulseAnim }],
          },
          statusConfig.glow && {
            shadowColor: statusConfig.glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: config.indicator / 2,
            elevation: 8,
          },
        ]}
      >
        <LinearGradient
          colors={statusConfig.gradient}
          style={[
            styles.statusGradient,
            {
              width: config.indicator,
              height: config.indicator,
              borderRadius: config.indicator / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    );
  };

  const renderStatusText = () => {
    if (!showText) return null;

    const displayText = userName && status === 'typing' 
      ? `${userName} is ${statusConfig.text}`
      : statusConfig.text;

    return (
      <Animated.Text
        style={[
          styles.statusText,
          {
            fontSize: config.fontSize,
            color: statusConfig.color,
            transform: [{ scale: scaleAnim }],
          },
          status === 'typing' && styles.typingText,
        ]}
      >
        {displayText}
      </Animated.Text>
    );
  };

  if (status === 'offline' && !showText) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { padding: config.padding },
        style,
      ]}
    >
      {renderStatusIndicator()}
      {renderStatusText()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    marginRight: theme.spacing.xs,
  },
  statusGradient: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontWeight: theme.typography.fontWeights.medium,
    fontStyle: 'italic',
  },
  typingText: {
    fontStyle: 'italic',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginRight: theme.spacing.xs,
  },
  typingDot: {
    borderRadius: 10,
  },
});

export default LiveStatusIndicator; 