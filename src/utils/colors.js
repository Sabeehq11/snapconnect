// SnapConnect Modern Dark Blue/Teal Theme
export const colors = {
  // Base dark colors - deeper, richer blacks
  black: '#060A0D',          // Deep dark blue-black
  darkest: '#0F1419',        // Very dark blue-grey
  dark: '#161B22',           // Dark blue-grey
  darker: '#1C2128',         // Medium dark blue-grey
  medium: '#22272E',         // Medium blue-grey
  light: '#2D333B',          // Light blue-grey
  lighter: '#373E47',        // Lighter blue-grey
  
  // Primary brand colors (blue/teal theme)
  primary: '#00A8E8',        // Bright cyan blue
  primaryLight: '#00BCD4',   // Light cyan
  primaryDark: '#0077A3',    // Dark cyan blue
  
  // Accent colors - teal family
  accent: '#00D4AA',         // Bright teal
  accentLight: '#26E5B8',    // Light teal
  accentDark: '#00B894',     // Dark teal
  
  secondary: '#0084FF',      // Electric blue
  secondaryLight: '#42A5F5', // Light blue
  secondaryDark: '#1976D2',  // Dark blue
  
  // Enhanced gradient combinations for glassmorphism
  gradients: {
    primary: ['#00A8E8', '#00D4AA'],           // Cyan blue to teal
    accent: ['#00D4AA', '#0084FF'],            // Teal to electric blue
    secondary: ['#0084FF', '#00BCD4'],         // Electric blue to cyan
    dark: ['#161B22', '#1C2128'],              // Dark blue-grey gradient
    hero: ['#00A8E8', '#00D4AA', '#0084FF'],   // Triple blue/teal gradient
    card: ['#161B22', '#1C2128', '#22272E'],   // Card gradient
    error: ['#EF4444', '#DC2626'],             // Red gradient for notifications
    muted: ['#6B7280', '#4B5563'],             // Muted gradient for disabled states
    
    // Glassmorphism gradients
    glassPrimary: ['rgba(0, 168, 232, 0.2)', 'rgba(0, 212, 170, 0.2)'],
    glassAccent: ['rgba(0, 212, 170, 0.2)', 'rgba(0, 132, 255, 0.2)'],
    glassSecondary: ['rgba(0, 132, 255, 0.2)', 'rgba(0, 188, 212, 0.2)'],
    glassDark: ['rgba(22, 27, 34, 0.8)', 'rgba(28, 33, 40, 0.8)'],
    glassLight: ['rgba(0, 188, 212, 0.1)', 'rgba(0, 168, 232, 0.05)'],
    
    // Animated gradients - blue/teal themed
    ocean: ['#00A8E8', '#00D4AA', '#0084FF', '#26E5B8'],
    deepSea: ['#003459', '#007EA7', '#00A8E8'],
    arctic: ['#B8F2FF', '#00D4AA', '#0077A3'],
    neon: ['#00FFFF', '#00D4AA', '#0084FF'],
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
  surface: '#161B22',
  surfaceElevated: '#1C2128',
  surfaceCard: '#22272E',
  surfaceHover: '#2D333B',
  
  // Glassmorphism surface colors
  glassSurface: 'rgba(22, 27, 34, 0.7)',
  glassElevated: 'rgba(28, 33, 40, 0.8)',
  glassCard: 'rgba(34, 39, 46, 0.6)',
  glassHover: 'rgba(45, 51, 59, 0.7)',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#1F2937',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
  
  // Chat-specific colors
  ownMessage: '#00A8E8',
  ownMessageText: '#FFFFFF',
  otherMessage: '#22272E',
  otherMessageText: '#D1D5DB',
  messageHover: '#2D333B',
  
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
  glow: 'rgba(0, 168, 232, 0.4)',
  glowAccent: 'rgba(0, 212, 170, 0.4)',
  glowSecondary: 'rgba(0, 132, 255, 0.4)',
  
  // Legacy support (mapped to new colors)
  white: '#FFFFFF',
  pink: '#EC4899',         // Keep pink for legacy compatibility
  purple: '#0084FF',       // Map to electric blue
  lightPurple: '#42A5F5',  // Map to light blue
  mediumGray: '#22272E',
  lightGray: '#6B7280',
  darkGray: '#161B22',
};

// Enhanced theme configuration with glassmorphism and neumorphism
export const theme = {
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Enhanced shadows with glassmorphism and neumorphism
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
    xl: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 6.27,
      elevation: 12,
    },
    glow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    glowAccent: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 8,
    },
    // Neumorphism shadows
    neuInner: {
      shadowColor: colors.shadowDark,
      shadowOffset: { width: -2, height: -2 },
      shadowOpacity: 0.5,
      shadowRadius: 3,
    },
    neuOuter: {
      shadowColor: colors.shadowLight,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    },
    neuPressed: {
      shadowColor: colors.shadowDark,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
  },
  
  // Glassmorphism effects
  glassmorphism: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(20px)',
    },
    dark: {
      backgroundColor: 'rgba(26, 26, 31, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
    },
    primary: {
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      backdropFilter: 'blur(20px)',
    },
    card: {
      backgroundColor: 'rgba(47, 47, 53, 0.6)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
    },
  },
  
  // Neumorphism effects
  neumorphism: {
    flat: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.shadowDark,
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 8,
    },
    raised: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.shadowDark,
      shadowOffset: { width: -6, height: -6 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 12,
    },
    pressed: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.shadowDark,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  
  // Enhanced typography with modern fonts
  typography: {
    fontFamily: {
      primary: 'Inter',
      secondary: 'Poppins',
      mono: 'SFMono-Regular',
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 48,
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  
  // Animation configurations
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 800,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Blur effects
  blur: {
    light: 10,
    medium: 20,
    heavy: 40,
  },
};

// Component-specific theme presets
export const componentThemes = {
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      ...theme.shadows.md,
    },
    glass: {
      ...theme.glassmorphism.primary,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    neu: {
      ...theme.neumorphism.raised,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  },
  card: {
    default: {
      backgroundColor: colors.surfaceCard,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    glass: {
      ...theme.glassmorphism.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
    },
    neu: {
      ...theme.neumorphism.flat,
      padding: theme.spacing.lg,
    },
  },
  modal: {
    overlay: {
      backgroundColor: colors.overlay,
      backdropFilter: `blur(${theme.blur.medium}px)`,
    },
    content: {
      ...theme.glassmorphism.dark,
      borderRadius: theme.borderRadius.xxl,
      padding: theme.spacing.xl,
      margin: theme.spacing.lg,
    },
  },
};

export default colors; 