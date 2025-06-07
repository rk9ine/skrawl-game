import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export interface TextProps extends RNTextProps {
  /**
   * Variant of the text
   * - 'heading': Uses secondary font (PatrickHand) with larger size
   * - 'title': Uses primary bold font with large size
   * - 'subtitle': Uses primary font with medium size
   * - 'body': Default, uses primary font with regular size
   * - 'caption': Uses primary font with small size
   */
  variant?: 'heading' | 'title' | 'subtitle' | 'body' | 'caption';
  
  /**
   * Whether to use bold font
   */
  bold?: boolean;
  
  /**
   * Color to use from theme
   * If not provided, uses theme.text
   */
  color?: string;
  
  /**
   * Size override
   * If not provided, uses size from variant
   */
  size?: number;
  
  /**
   * Children to render
   */
  children: React.ReactNode;
}

/**
 * Text component that automatically applies typography styles from the theme
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  bold = false,
  color,
  size,
  style,
  children,
  ...rest
}) => {
  const { theme, typography } = useTheme();
  
  // Determine font family based on variant and bold prop
  let fontFamily = typography.fontFamily.primary;
  if (variant === 'heading') {
    fontFamily = typography.fontFamily.secondary;
  } else if (bold) {
    fontFamily = typography.fontFamily.primaryBold;
  }
  
  // Determine font size based on variant
  let fontSize = typography.fontSizes.md;
  switch (variant) {
    case 'heading':
      fontSize = typography.fontSizes.xxl;
      break;
    case 'title':
      fontSize = typography.fontSizes.xl;
      break;
    case 'subtitle':
      fontSize = typography.fontSizes.lg;
      break;
    case 'body':
      fontSize = typography.fontSizes.md;
      break;
    case 'caption':
      fontSize = typography.fontSizes.sm;
      break;
  }
  
  // Override with size prop if provided
  if (size !== undefined) {
    fontSize = size;
  }
  
  // Determine text color
  const textColor = color || theme.text;
  
  return (
    <RNText
      style={[
        {
          fontFamily,
          fontSize,
          color: textColor,
          // Ensure consistent text rendering across platforms
          includeFontPadding: false, // Android only - removes extra padding
          textAlignVertical: 'center', // Android only - consistent vertical alignment
          // Prevent font scaling issues
          allowFontScaling: false,
        },
        style,
      ]}
      allowFontScaling={false} // Prevent system font scaling from affecting layout
      {...rest}
    >
      {children}
    </RNText>
  );
};

export default Text;
