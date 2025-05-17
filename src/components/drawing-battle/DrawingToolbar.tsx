import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';

interface DrawingToolbarProps {
  /**
   * Whether the user is currently drawing
   */
  isDrawing?: boolean;

  /**
   * Callback when a color is selected
   */
  onSelectColor?: (color: string) => void;

  /**
   * Callback when brush size is changed
   */
  onChangeBrushSize?: (size: number) => void;

  /**
   * Callback when undo button is pressed
   */
  onUndo?: () => void;

  /**
   * Callback when clear button is pressed
   */
  onClear?: () => void;
}

/**
 * Toolbar with drawing tools and controls
 */
const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  isDrawing = false,
  onSelectColor,
  onChangeBrushSize,
  onUndo,
  onClear,
}) => {
  const { theme, spacing, borderRadius } = useTheme();

  // Sample colors for the color picker
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundAlt,
          borderRadius: borderRadius.md,
          ...applyThemeShadow('sm')
        }
      ]}
    >
      {isDrawing ? (
        <>
          {/* Color picker */}
          <View style={styles.colorPicker}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color }
                ]}
                onPress={() => onSelectColor?.(color)}
              />
            ))}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Tool buttons */}
          <View style={styles.toolButtons}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => onChangeBrushSize?.(2)}
            >
              <Ionicons name="ellipse-outline" size={16} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => onChangeBrushSize?.(4)}
            >
              <Ionicons name="ellipse-outline" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => onChangeBrushSize?.(8)}
            >
              <Ionicons name="ellipse-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onUndo}
            >
              <Ionicons name="arrow-undo" size={24} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClear}
            >
              <Ionicons name="trash-outline" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.waitingContainer}>
          <Ionicons name="time-outline" size={24} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Platform.OS === 'ios' ? 48 : 52, // Reduced height
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // Reduced horizontal padding
    marginVertical: 6, // Reduced vertical margin
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  toolButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DrawingToolbar;
