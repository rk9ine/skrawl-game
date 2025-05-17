import { Platform } from 'react-native';

export const lightTheme = {
  // Primary colors - vibrant blue
  primary: '#4361EE',
  primaryLight: '#738AFF',
  primaryDark: '#2541B2',

  // Secondary colors - coral/orange
  secondary: '#FF6B6B',
  secondaryLight: '#FF9E9E',
  secondaryDark: '#D14545',

  // Background colors
  background: '#FFFFFF',
  backgroundAlt: '#F5F7FA',
  surface: '#FFFFFF',

  // Text colors
  text: '#1A1A2E',
  textSecondary: '#4A4A68',
  textDisabled: '#9E9EAF',

  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // UI element colors
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Canvas colors
  canvasBackground: '#FFFFFF',
  canvasGrid: '#F0F0F0',
};

export const darkTheme = {
  // Primary colors - vibrant blue (slightly adjusted for dark mode)
  primary: '#4361EE',
  primaryLight: '#738AFF',
  primaryDark: '#2541B2',

  // Secondary colors - coral/orange (slightly adjusted for dark mode)
  secondary: '#FF6B6B',
  secondaryLight: '#FF9E9E',
  secondaryDark: '#D14545',

  // Background colors
  background: '#121212',
  backgroundAlt: '#1E1E1E',
  surface: '#242424',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0C0',
  textDisabled: '#6C6C7A',

  // Status colors
  success: '#66BB6A',
  warning: '#FFCA28',
  error: '#EF5350',
  info: '#42A5F5',

  // UI element colors
  border: '#333333',
  divider: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Canvas colors
  canvasBackground: '#1A1A1A',
  canvasGrid: '#2A2A2A',
};

export const typography = {
  fontFamily: {
    primary: 'Nunito_400Regular', // For general text
    primaryBold: 'Nunito_700Bold',
    secondary: 'PatrickHand_400Regular', // For playful elements, game titles, etc.
  },
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
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999, // For fully rounded elements
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

// Combined theme object
export const theme = {
  light: lightTheme,
  dark: darkTheme,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
