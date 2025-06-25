import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define multiple theme variations
const themes = {
  ocean: {
    name: 'Ocean Blue',
    description: 'Cool blue and teal theme',
    colors: {
      // Base colors
      white: '#FFFFFF',
      black: '#000000',
      
      // Primary colors
      primary: '#6366F1',
      primaryLight: '#8B8DFF',
      primaryDark: '#4F46E5',
      
      // Accent colors
      accent: '#8B5CF6',
      accentLight: '#A78BFA',
      accentDark: '#7C3AED',
      
      secondary: '#3B82F6',
      secondaryLight: '#60A5FA',
      secondaryDark: '#2563EB',
      
      // Gradients
      gradients: {
        primary: ['#6366F1', '#8B5CF6'],
        accent: ['#8B5CF6', '#3B82F6'],
        secondary: ['#3B82F6', '#06B6D4'],
        snapGradient: ['#6366F1', '#8B5CF6', '#3B82F6'],
        error: ['#EF4444', '#DC2626'],
        success: ['#10B981', '#059669'],
        warning: ['#F59E0B', '#D97706'],
      },
      
      // Text colors
      textPrimary: '#FFFFFF',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      textMuted: '#6B7280',
      
      // Functional colors
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      
      // Surface colors
      surface: '#161B22',
      surfaceElevated: '#1C2128',
      surfaceCard: '#22272E',
    }
  },
  
  purple: {
    name: 'Purple Dream',
    description: 'Rich purple and magenta theme',
    colors: {
      // Base colors
      white: '#FFFFFF',
      black: '#000000',
      
      // Primary colors (purple-focused)
      primary: '#8B5CF6',
      primaryLight: '#A78BFA',
      primaryDark: '#7C3AED',
      
      // Accent colors
      accent: '#EC4899',
      accentLight: '#F472B6',
      accentDark: '#DB2777',
      
      secondary: '#A855F7',
      secondaryLight: '#C084FC',
      secondaryDark: '#9333EA',
      
      // Gradients
      gradients: {
        primary: ['#8B5CF6', '#EC4899'],
        accent: ['#EC4899', '#A855F7'],
        secondary: ['#A855F7', '#8B5CF6'],
        snapGradient: ['#8B5CF6', '#EC4899', '#A855F7'],
        error: ['#EF4444', '#DC2626'],
        success: ['#10B981', '#059669'],
        warning: ['#F59E0B', '#D97706'],
      },
      
      // Text colors
      textPrimary: '#FFFFFF',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      textMuted: '#6B7280',
      
      // Functional colors
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#8B5CF6',
      
      // Surface colors
      surface: '#1A1625',
      surfaceElevated: '#241B35',
      surfaceCard: '#2D2040',
    }
  },
  
  forest: {
    name: 'Forest Green',
    description: 'Natural green and emerald theme',
    colors: {
      // Base colors
      white: '#FFFFFF',
      black: '#000000',
      
      // Primary colors (green-focused)
      primary: '#10B981',
      primaryLight: '#34D399',
      primaryDark: '#059669',
      
      // Accent colors
      accent: '#059669',
      accentLight: '#10B981',
      accentDark: '#047857',
      
      secondary: '#34D399',
      secondaryLight: '#6EE7B7',
      secondaryDark: '#10B981',
      
      // Gradients
      gradients: {
        primary: ['#10B981', '#059669'],
        accent: ['#059669', '#34D399'],
        secondary: ['#34D399', '#10B981'],
        snapGradient: ['#10B981', '#059669', '#34D399'],
        error: ['#EF4444', '#DC2626'],
        success: ['#10B981', '#059669'],
        warning: ['#F59E0B', '#D97706'],
      },
      
      // Text colors
      textPrimary: '#FFFFFF',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      textMuted: '#6B7280',
      
      // Functional colors
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#10B981',
      
      // Surface colors
      surface: '#0F1F1A',
      surfaceElevated: '#152B22',
      surfaceCard: '#1B362A',
    }
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('ocean');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on app start
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
      try {
        await AsyncStorage.setItem('selectedTheme', themeKey);
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    }
  };

  const value = {
    currentTheme: themes[currentTheme],
    currentThemeKey: currentTheme,
    themes,
    changeTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 