import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, theme } from '../utils/colors';

const AnimatedGradient = ({ 
  children, 
  style, 
  gradientSets = [colors.gradients.primary, colors.gradients.accent, colors.gradients.secondary],
  duration = 3000,
  animateOnMount = true,
  direction = 'diagonal', // 'horizontal', 'vertical', 'diagonal'
  ...props 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const currentGradientIndex = useRef(0);

  useEffect(() => {
    if (animateOnMount && gradientSets.length > 1) {
      startAnimation();
    }
  }, [animateOnMount, gradientSets.length]);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const getGradientDirection = () => {
    switch (direction) {
      case 'horizontal':
        return { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };
      case 'vertical':
        return { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } };
      case 'diagonal':
      default:
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
    }
  };

  const interpolateGradient = () => {
    if (gradientSets.length <= 1) {
      return gradientSets[0] || colors.gradients.primary;
    }

    const currentIndex = currentGradientIndex.current;
    const nextIndex = (currentIndex + 1) % gradientSets.length;

    const currentGradient = gradientSets[currentIndex];
    const nextGradient = gradientSets[nextIndex];

    // Interpolate between current and next gradient colors
    const interpolatedColors = currentGradient.map((color, index) => {
      const nextColor = nextGradient[index] || nextGradient[nextGradient.length - 1];
      return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [color, nextColor],
      });
    });

    // Update current index when animation completes
    animatedValue.addListener(({ value }) => {
      if (value >= 0.99) {
        currentGradientIndex.current = nextIndex;
      }
    });

    return interpolatedColors;
  };

  const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
  const gradientDirection = getGradientDirection();

  return (
    <AnimatedLinearGradient
      colors={interpolateGradient()}
      style={[styles.container, style]}
      start={gradientDirection.start}
      end={gradientDirection.end}
      {...props}
    >
      {children}
    </AnimatedLinearGradient>
  );
};

// Preset gradient animation components
export const AnimatedHeroGradient = ({ children, style, ...props }) => (
  <AnimatedGradient
    gradientSets={[
      colors.gradients.hero,
      colors.gradients.ocean,
      colors.gradients.deepSea,
      colors.gradients.primary,
      colors.gradients.accent,
    ]}
    duration={5000}
    direction="diagonal"
    style={style}
    {...props}
  >
    {children}
  </AnimatedGradient>
);

export const AnimatedCardGradient = ({ children, style, ...props }) => (
  <AnimatedGradient
    gradientSets={[
      colors.gradients.card,
      colors.gradients.dark,
      ['#2F2F35', '#3A3A42'],
    ]}
    duration={5000}
    direction="vertical"
    style={style}
    {...props}
  >
    {children}
  </AnimatedGradient>
);

export const AnimatedOceanGradient = ({ children, style, ...props }) => (
  <AnimatedGradient
    gradientSets={[
      colors.gradients.ocean,
      colors.gradients.deepSea,
      colors.gradients.arctic,
      colors.gradients.neon,
    ]}
    duration={3000}
    direction="horizontal"
    style={style}
    {...props}
  >
    {children}
  </AnimatedGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedGradient; 