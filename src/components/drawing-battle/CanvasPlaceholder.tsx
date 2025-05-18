import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';

/**
 * A placeholder for the canvas that will be implemented later
 */
const CanvasPlaceholder: React.FC = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: 0, // No border radius for edge-to-edge design
      margin: 0, // No margin
      padding: 0, // No padding
    },
  });

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
        name="image-outline"
        size={48}
        color={theme.textSecondary}
      />

      <Text
        variant="heading" // Changed to heading variant to use Patrick Hand font
        size={typography.fontSizes.lg} // Increased font size for better readability
        color={theme.textSecondary}
        style={{ marginTop: spacing.md, textAlign: 'center' }}
      >
        Canvas will be implemented later
      </Text>
    </View>
  );
};

export default CanvasPlaceholder;
