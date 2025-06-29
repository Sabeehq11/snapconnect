// SnapConnect Modern Dark Blue/Teal Theme
export const colors = {
  // Base colors - modern, bright theme
  white: '#FFFFFF',
  lightBackground: '#F8F9FA',    // Light background for modern look
  cardBackground: '#FFFFFF',     // Clean white cards
  black: '#000000',
  darkest: '#1A1A1A',
  dark: '#2C2C2E',
  medium: '#3A3A3C',
  light: '#48484A',
  lighter: '#636366',
  
  // Primary brand colors (blue/purple theme)
  primary: '#6366F1',            // Modern indigo
  primaryLight: '#8B8DFF',       // Light indigo
  primaryDark: '#4F46E5',        // Dark indigo
  
  // Accent colors - vibrant but tasteful
  accent: '#8B5CF6',             // Modern purple
  accentLight: '#A78BFA',        // Light purple  
  accentDark: '#7C3AED',         // Dark purple
  
  secondary: '#3B82F6',          // Modern blue
  secondaryLight: '#60A5FA',     // Light blue
  secondaryDark: '#2563EB',      // Dark blue
  
  // Social media colors
  snapYellow: '#FFFC00',         // Classic Snapchat yellow
  snapBlue: '#00D4FF',           // Bright blue
  
  // Enhanced gradient combinations for modern UI
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],           // Indigo to purple
    accent: ['#8B5CF6', '#3B82F6'],            // Purple to blue
    secondary: ['#3B82F6', '#06B6D4'],         // Blue to cyan
    snapGradient: ['#6366F1', '#8B5CF6', '#3B82F6'], // Main brand gradient
    bright: ['#FFFC00', '#FFD700'],            // Yellow gradient
    card: ['#FFFFFF', '#F8F9FA'],              // Clean white gradient
    hero: ['#6366F1', '#8B5CF6', '#3B82F6'],   // Hero gradient
    
    // Light mode gradients
    lightCard: ['rgba(255, 255, 255, 0.95)', 'rgba(248, 249, 250, 0.95)'],
    lightGlass: ['rgba(255, 255, 255, 0.8)', 'rgba(248, 249, 250, 0.8)'],
    
    // Dark mode gradients (keep existing)
    dark: ['#161B22', '#1C2128'],
    glassPrimary: ['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)'],
    glassAccent: ['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.2)'],
    glassDark: ['rgba(22, 27, 34, 0.8)', 'rgba(28, 33, 40, 0.8)'],
    
    // Notification colors
    error: ['#EF4444', '#DC2626'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    
    // Animated gradients for modern feel
    ocean: ['#6366F1', '#8B5CF6', '#3B82F6', '#06B6D4'],
    sunset: ['#FFFC00', '#FFD700', '#FFA500', '#FF6B6B'],
    modern: ['#6366F1', '#8B5CF6', '#60A5FA', '#34D399'],
  },
  
  // Text colors for light theme (when needed)
  textPrimaryLight: '#1F2937',        // Dark gray for main text
  textSecondaryLight: '#6B7280',      // Medium gray for secondary text
  textTertiaryLight: '#9CA3AF',       // Light gray for tertiary text
  textMutedLight: '#D1D5DB',          // Very light gray for muted text
  textOnDark: '#FFFFFF',         // White text on dark backgrounds
  textBrand: '#6366F1',          // Brand color for links/highlights
  
  // Dark theme text colors
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#D1D5DB',
  textTertiaryDark: '#9CA3AF',
  textMutedDark: '#6B7280',
  
  // Functional colors - modern, accessible
  success: '#10B981',            // Modern green
  successLight: '#34D399',
  error: '#EF4444',              // Modern red
  errorLight: '#F87171',
  warning: '#F59E0B',            // Modern amber
  warningLight: '#FBBF24',
  info: '#3B82F6',               // Modern blue
  infoLight: '#60A5FA',
  
  // Surface colors - light theme
  surface: '#FFFFFF',
  surfaceElevated: '#F8F9FA',
  surfaceCard: '#FFFFFF',
  surfaceHover: '#F3F4F6',
  
  // Surface colors - dark theme
  surfaceDark: '#161B22',
  surfaceElevatedDark: '#1C2128',
  surfaceCardDark: '#22272E',
  surfaceHoverDark: '#2D333B',
  
  // Border colors
  border: '#E5E7EB',             // Light gray border
  borderLight: '#F3F4F6',        // Very light border
  borderDark: '#D1D5DB',         // Medium border
  borderBrand: '#6366F1',        // Brand color border
  
  // Shadows for modern cards
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowHeavy: 'rgba(0, 0, 0, 0.25)',
  shadowBrand: 'rgba(99, 102, 241, 0.25)',
  
  // Status colors
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  busy: '#EF4444',
  
  // Chat colors
  ownMessage: '#6366F1',
  ownMessageText: '#FFFFFF',
  otherMessage: '#F3F4F6',
  otherMessageText: '#1F2937',
  
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
  purple: '#8B5CF6',          // Purple
  pink: '#EC4899',            // Pink
  teal: '#14B8A6',            // Teal
  orange: '#F97316',          // Orange
  cyan: '#06B6D4',            // Cyan
  lime: '#84CC16',            // Lime
  
  // Surface colors
  background: '#1A1A1F',        // Main background
  backgroundSecondary: '#22272E', // Secondary background
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