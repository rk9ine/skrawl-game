import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Canvas, Circle, Fill, Rect } from '@shopify/react-native-skia';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';

interface SkiaCanvasProps {
  /**
   * Whether the user is currently drawing
   */
  isDrawing?: boolean;
}

/**
 * A Skia-based canvas component for the Drawing Battle mode
 * This is a simplified version that just shows a basic Skia canvas
 */
const SkiaCanvas: React.FC<SkiaCanvasProps> = ({ isDrawing = false }) => {
  const { theme, borderRadius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.canvasBackground,
          borderColor: theme.border,
          borderRadius: borderRadius.md,
          ...applyThemeShadow('sm')
        }
      ]}
    >
      <Canvas style={styles.canvas}>
        <Fill color={theme.canvasBackground} />

        {/* Draw some basic shapes to show Skia is working */}
        <Circle cx={100} cy={100} r={50} color={theme.primary + '80'} />
        <Rect x={200} y={200} width={100} height={100} color={theme.success + '80'} />

        {/* Show drawing status */}
        {isDrawing && (
          <Circle cx={50} cy={50} r={20} color={theme.primary} />
        )}
      </Canvas>

      {/* Overlay text to show drawing status */}
      <View style={styles.statusOverlay}>
        <Text style={[styles.statusText, { color: theme.text }]}>
          {isDrawing ? 'Drawing Mode' : 'View Mode'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  statusOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 5,
    zIndex: 20, // Place above everything
  },
  statusText: {
    fontWeight: 'bold',
  },
});

export default SkiaCanvas;
