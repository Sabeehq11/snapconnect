// SnapConnect Modern Dark Theme
export const colors = {
  // Base dark colors
  black: '#0A0A0B',
  darkest: '#111115',
  dark: '#1A1A1F',
  darker: '#242429',
  medium: '#2F2F35',
  light: '#3A3A42',
  lighter: '#4A4A52',
  
  // Primary brand colors (purple/blue theme)
  primary: '#6366F1',        // Indigo
  primaryLight: '#818CF8',   // Light indigo
  primaryDark: '#4F46E5',    // Dark indigo
  
  // Accent colors
  accent: '#06B6D4',         // Cyan
  accentLight: '#22D3EE',    // Light cyan
  accentDark: '#0891B2',     // Dark cyan
  
  secondary: '#8B5CF6',      // Purple
  secondaryLight: '#A78BFA', // Light purple
  secondaryDark: '#7C3AED',  // Dark purple
  
  // Gradient combinations
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],           // Indigo to purple
    accent: ['#06B6D4', '#3B82F6'],            // Cyan to blue
    secondary: ['#8B5CF6', '#EC4899'],         // Purple to pink
    dark: ['#1A1A1F', '#242429'],              // Dark gradient
    hero: ['#6366F1', '#06B6D4', '#8B5CF6'],   // Triple gradient
    card: ['#1A1A1F', '#242429', '#2F2F35'],   // Card gradient
  },
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0A0A0B',
  
  // Functional colors
  success: '#10B981',        // Green
  successLight: '#34D399',
  error: '#EF4444',          // Red
  errorLight: '#F87171',
  warning: '#F59E0B',        // Amber
  warningLight: '#FBBF24',
  info: '#3B82F6',           // Blue
  infoLight: '#60A5FA',
  
  // Surface colors
  surface: '#1A1A1F',
  surfaceElevated: '#242429',
  surfaceCard: '#2F2F35',
  surfaceHover: '#3A3A42',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#1F2937',
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
  
  // Chat-specific colors
  ownMessage: '#6366F1',
  ownMessageText: '#FFFFFF',
  otherMessage: '#2F2F35',
  otherMessageText: '#D1D5DB',
  messageHover: '#3A3A42',
  
  // Status colors
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  busy: '#EF4444',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.25)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Special effects
  glow: 'rgba(99, 102, 241, 0.3)',
  glowAccent: 'rgba(6, 182, 212, 0.3)',
  
  // Legacy support (mapped to new colors)
  white: '#FFFFFF',
  pink: '#EC4899',
  purple: '#8B5CF6',
  lightPurple: '#A78BFA',
  mediumGray: '#2F2F35',
  lightGray: '#6B7280',
  darkGray: '#1A1A1F',
};

// Theme configuration
export const theme = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  shadows: {
    sm: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    md: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    glow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
  },
  
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export default colors; 