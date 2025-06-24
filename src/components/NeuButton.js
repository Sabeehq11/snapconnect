import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, theme } from '../utils/colors';

const NeuButton = ({ 
  children, 
  onPress, 
  style, 
  textStyle,
  variant = 'raised',
  size = 'medium',
  disabled = false,
  gradient = null,
  icon = null,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = {
    small: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSizes.sm,
      borderRadius: theme.borderRadius.md,
    },
    medium: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSizes.md,
      borderRadius: theme.borderRadius.lg,
    },
    large: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      fontSize: theme.typography.fontSizes.lg,
      borderRadius: theme.borderRadius.xl,
    },
  };

  const getButtonStyle = () => {
    const config = sizeConfig[size];
    const baseStyle = {
      ...config,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
    };

    if (variant === 'flat') {
      return {
        ...baseStyle,
        ...theme.neumorphism.flat,
        backgroundColor: disabled ? colors.medium : colors.surface,
      };
    } else if (variant === 'pressed') {
      return {
        ...baseStyle,
        ...theme.neumorphism.pressed,
        backgroundColor: disabled ? colors.medium : colors.surface,
      };
    } else {
      return {
        ...baseStyle,
        ...theme.neumorphism.raised,
        backgroundColor: disabled ? colors.medium : colors.surface,
      };
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.3,
        duration: theme.animations.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    setIsPressed(false);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: theme.animations.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getTextStyle = () => ({
    color: disabled ? colors.textMuted : colors.textPrimary,
    fontSize: sizeConfig[size].fontSize,
    fontWeight: theme.typography.fontWeights.semibold,
    marginLeft: icon ? theme.spacing.sm : 0,
  });

  const buttonContent = (
    <View style={styles.buttonContent}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {typeof children === 'string' ? (
        <Text style={[getTextStyle(), textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      <Animated.View
        style={[
          getButtonStyle(),
          {
            transform: [{ scale: scaleAnim }],
            shadowOpacity: shadowAnim,
          },
          style,
        ]}
      >
        {gradient ? (
          <LinearGradient
            colors={gradient}
            style={[StyleSheet.absoluteFillObject, { borderRadius: sizeConfig[size].borderRadius }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : null}
        {buttonContent}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
});

export default NeuButton; 