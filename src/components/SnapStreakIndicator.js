import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const SnapStreakIndicator = ({ 
  streakCount, 
  style, 
  size = 'small',
  animated = true 
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [animated]);

  const getStreakColor = () => {
    if (streakCount >= 30) return colors.error; // Red for 30+ days
    if (streakCount >= 14) return colors.warning; // Yellow for 2+ weeks
    if (streakCount >= 7) return colors.secondary; // Purple for 1+ week
    return colors.primary; // Blue for less than a week
  };

  const getSize = () => {
    switch (size) {
      case 'tiny':
        return { container: 20, text: 8, icon: 10 };
      case 'small':
        return { container: 24, text: 10, icon: 12 };
      case 'medium':
        return { container: 32, text: 12, icon: 16 };
      case 'large':
        return { container: 40, text: 14, icon: 20 };
      default:
        return { container: 24, text: 10, icon: 12 };
    }
  };

  const sizes = getSize();
  const streakColor = getStreakColor();
  
  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          transform: [{ scale: scaleValue }],
        }
      ]}
    >
      {/* Glow effect */}
      {animated && (
        <Animated.View
          style={[
            styles.glowBackground,
            {
              width: sizes.container + 8,
              height: sizes.container + 8,
              borderRadius: (sizes.container + 8) / 2,
              opacity: glowOpacity,
              backgroundColor: `${streakColor}40`,
            }
          ]}
        />
      )}
      
      {/* Main streak indicator */}
      <LinearGradient
        colors={[streakColor, `${streakColor}CC`]}
        style={[
          styles.streakBadge,
          {
            width: sizes.container,
            height: sizes.container,
            borderRadius: sizes.container / 2,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.streakContent}>
          <Ionicons 
            name="flame" 
            size={sizes.icon} 
            color={colors.white} 
            style={styles.fireIcon}
          />
          <Text 
            style={[
              styles.streakText,
              { fontSize: sizes.text }
            ]}
          >
            {streakCount}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    top: -4,
    left: -4,
  },
  streakBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireIcon: {
    marginRight: 2,
  },
  streakText: {
    color: colors.white,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default SnapStreakIndicator; 