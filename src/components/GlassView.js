import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, theme } from '../utils/colors';

const GlassView = ({ 
  children, 
  style, 
  intensity = 'medium', 
  tint = 'dark',
  borderRadius = theme.borderRadius.xl,
  ...props 
}) => {
  const getGlassStyle = () => {
    const baseStyle = {
      borderRadius,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    };

    const intensityConfig = {
      light: { opacity: 0.1, blur: 10 },
      medium: { opacity: 0.2, blur: 20 },
      heavy: { opacity: 0.3, blur: 30 },
    };

    const tintConfig = {
      light: colors.gradients.glassLight,
      dark: colors.gradients.glassDark,
      primary: colors.gradients.glassPrimary,
      accent: colors.gradients.glassAccent,
      secondary: colors.gradients.glassSecondary,
    };

    return {
      ...baseStyle,
      backgroundColor: `rgba(255, 255, 255, ${intensityConfig[intensity].opacity})`,
    };
  };

  return (
    <View style={[getGlassStyle(), style]} {...props}>
      <LinearGradient
        colors={tint === 'light' ? colors.gradients.glassLight : colors.gradients.glassDark}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default GlassView; 