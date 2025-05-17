import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';

interface CanvasPlaceholderProps {
  /**
   * Whether the user is currently drawing
   */
  isDrawing?: boolean;
}

/**
 * A placeholder for the Skia canvas that will be implemented later
 * This component maintains the same interface that the real canvas will use
 */
const CanvasPlaceholder: React.FC<CanvasPlaceholderProps> = ({ isDrawing = false }) => {
  const { theme, typography, spacing } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.canvasBackground,
          borderColor: theme.border,
        }
      ]}
    >
      <Ionicons 
        name={isDrawing ? "brush-outline" : "image-outline"} 
        size={48} 
        color={theme.textSecondary} 
      />
      
      <Text
        variant="subtitle"
        color={theme.textSecondary}
        style={{ marginTop: spacing.md, textAlign: 'center' }}
      >
        {isDrawing 
          ? "Canvas will be implemented with Skia" 
          : "Waiting for drawing to start"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
});

export default CanvasPlaceholder;
