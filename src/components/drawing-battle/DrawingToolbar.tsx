import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';

interface DrawingToolbarProps {
  /**
   * Callback when the settings button is pressed
   */
  onOpenSettings?: () => void;
}

/**
 * A visual-only toolbar for the Drawing Battle screen
 * This component maintains the visual structure without actual drawing functionality
 */
const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onOpenSettings,
}) => {
  const { theme, spacing, borderRadius } = useTheme();

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingVertical: spacing.xxs / 2, // Minimal vertical padding
      paddingHorizontal: 0, // No horizontal padding
      borderTopWidth: 1,
    },
    toolbarRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    toolButton: {
      width: spacing.md * 2, // Reduced size
      height: spacing.md * 2, // Reduced size
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          // No shadow for skribbl.io-like flat design
        }
      ]}
    >
      <View style={styles.toolbarRow}>
        {/* Placeholder buttons for visual consistency */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          disabled={true}
        >
          <Ionicons name="trash-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          disabled={true}
        >
          <Ionicons name="arrow-undo" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          disabled={true}
        >
          <Ionicons name="brush-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Settings button - actually functional */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          onPress={onOpenSettings}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawingToolbar;
