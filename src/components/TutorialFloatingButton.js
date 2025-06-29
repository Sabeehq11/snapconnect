import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';

const TutorialFloatingButton = ({ onPress }) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create a subtle pulsing animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnimation },
            { scale: pulseAnimation }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={22} color={colors.white} />
          </View>
        </LinearGradient>
        
        {/* Subtle glow effect */}
        <View style={styles.glowEffect} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24.5,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
});

export default TutorialFloatingButton; 