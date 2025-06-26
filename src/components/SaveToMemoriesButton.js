import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const SaveToMemoriesButton = ({ storyData, onSave, style }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleSave = async () => {
    if (saving || saved) return;
    
    setSaving(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Simulate saving to memories
      // In real implementation, this would save to Supabase memories table
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setSaving(false);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(storyData);
      }
      
      Alert.alert(
        'Saved to Memories! 📸',
        'This snap has been added to your memories collection.',
        [{ text: 'Great!' }]
      );
      
      // Reset saved state after a delay
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
      setSaving(false);
      Alert.alert(
        'Save Failed',
        'Could not save to memories. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getButtonContent = () => {
    if (saved) {
      return {
        icon: 'checkmark-circle',
        colors: [colors.success, colors.success],
        opacity: 1,
      };
    } else if (saving) {
      return {
        icon: 'hourglass',
        colors: ['rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)'],
        opacity: 0.8,
      };
    } else {
      return {
        icon: 'bookmark',
        colors: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
        opacity: 1,
      };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={handleSave}
        disabled={saving || saved}
      >
        <LinearGradient
          colors={buttonContent.colors}
          style={[styles.buttonGradient, { opacity: buttonContent.opacity }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name={buttonContent.icon} 
            size={20} 
            color={saved ? colors.white : colors.background} 
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SaveToMemoriesButton; 