import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';

const AnimatedTabIcon = ({ 
  name, 
  iconType = 'Ionicons', 
  focused, 
  color, 
  size = 24,
  style,
  showPulse = true,
  gradientColors = colors.gradients.primary,
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const IconComponent = iconType === 'MaterialIcons' ? MaterialIcons : Ionicons;

  useEffect(() => {
    // Scale and opacity animation for focus state
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.7,
        duration: theme.animations.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: focused ? 1 : 0,
        duration: theme.animations.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle rotation animation when focused
    if (focused) {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: theme.animations.duration.slow,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: theme.animations.duration.slow,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  useEffect(() => {
    // Continuous pulse animation when focused
    if (focused && showPulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
      return () => pulseAnimation.stop();
    }
  }, [focused, showPulse]);

  const getIconContainerStyle = () => {
    if (focused) {
      return {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        overflow: 'hidden',
      };
    }
    return {
      justifyContent: 'center',
      alignItems: 'center',
    };
  };

  const renderFocusedIcon = () => (
    <View style={getIconContainerStyle()}>
      {/* Glow effect */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[...gradientColors, 'transparent']}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: 24 },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      {/* Main gradient background */}
      <LinearGradient
        colors={gradientColors}
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: 24 },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Glass overlay */}
      <View style={styles.glassOverlay} />
      
      {/* Icon */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { 
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '5deg'],
              })
            },
          ],
          opacity: opacityAnim,
        }}
      >
        <IconComponent 
          name={name} 
          size={size} 
          color={colors.white} 
        />
      </Animated.View>
    </View>
  );

  const renderUnfocusedIcon = () => (
    <Animated.View
      style={[
        getIconContainerStyle(),
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <IconComponent 
        name={name} 
        size={size} 
        color={color} 
      />
    </Animated.View>
  );

  return focused ? renderFocusedIcon() : renderUnfocusedIcon();
};

// Specialized tab icons with unique animations
export const ChatTabIcon = ({ focused, color, size, hasNotifications = false, notificationCount = 0 }) => (
  <View style={{ position: 'relative' }}>
    <AnimatedTabIcon
      name="chatbubbles"
      focused={focused}
      color={color}
      size={size}
      gradientColors={colors.gradients.primary}
      showPulse={true}
    />
    {hasNotifications && (
      <View style={styles.notificationBadge}>
        <LinearGradient
          colors={colors.gradients.error}
          style={styles.notificationGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {notificationCount > 0 && (
            <Text style={styles.notificationText}>
              {notificationCount > 99 ? '99+' : notificationCount.toString()}
            </Text>
          )}
        </LinearGradient>
      </View>
    )}
  </View>
);

export const CameraTabIcon = ({ focused, color, size }) => (
  <AnimatedTabIcon
    name="camera"
    focused={focused}
    color={color}
    size={size}
    gradientColors={colors.gradients.accent}
    showPulse={true}
  />
);

export const StoriesTabIcon = ({ focused, color, size }) => (
  <AnimatedTabIcon
    name="auto-stories"
    iconType="MaterialIcons"
    focused={focused}
    color={color}
    size={size}
    gradientColors={colors.gradients.secondary}
    showPulse={true}
  />
);

export const ProfileTabIcon = ({ focused, color, size }) => (
  <AnimatedTabIcon
    name="person"
    focused={focused}
    color={color}
    size={size}
    gradientColors={colors.gradients.ocean}
    showPulse={true}
  />
);

const styles = StyleSheet.create({
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.dark,
    zIndex: 1000,
  },
  notificationGradient: {
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  notificationText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default AnimatedTabIcon; 