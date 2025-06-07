import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

interface SafeAreaContainerProps {
  /**
   * Content to render inside the safe area
   */
  children: React.ReactNode;
  
  /**
   * Additional styles to apply to the container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Edges to apply safe area insets to
   * Default: ['top', 'bottom']
   */
  edges?: Edge[];
  
  /**
   * Background color to use
   * If not provided, uses theme.background
   */
  backgroundColor?: string;
}

/**
 * A container component that applies safe area insets consistently
 */
export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  style,
  edges = ['top', 'bottom'],
  backgroundColor,
}) => {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: backgroundColor || theme.background },
        style
      ]} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaContainer;
