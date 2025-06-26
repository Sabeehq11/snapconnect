import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/colors';

const LoadingIndicator = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true,
  color = colors.primary,
  style 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Fade in animation
    const fadeAnimation = Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });

    spinAnimation.start();
    pulseAnimation.start();
    fadeAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };

  const indicatorSize = getSize();

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeValue }]}>
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            width: indicatorSize,
            height: indicatorSize,
            transform: [
              { rotate: spin },
              { scale: pulseValue },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[color, `${color}80`, color]}
          style={[styles.spinner, { width: indicatorSize, height: indicatorSize }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.innerCircle, { 
            width: indicatorSize * 0.6, 
            height: indicatorSize * 0.6 
          }]} />
        </LinearGradient>
      </Animated.View>
      
      {showText && (
        <Animated.Text 
          style={[
            styles.loadingText, 
            { 
              fontSize: getTextSize(),
              opacity: fadeValue,
            }
          ]}
        >
          {text}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: colors.background,
    borderRadius: 50,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingIndicator; 