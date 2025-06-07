import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';

// skribbl.io exact color palette
const AVAILABLE_COLORS = [
  // Row 1: skribbl.io standard colors
  '#FFFFFF', '#C1C1C1', '#EF130B', '#FF7100', '#FFE400', '#00CC00', '#00B2FF', '#231FD3', '#A300BA', '#D37CAA',
  // Row 2: skribbl.io additional colors
  '#A0522D', '#000000', '#4C4C4C', '#740B07', '#C23800', '#E8A317', '#005510', '#00569E', '#0E0865', '#550069',
];

// skribbl.io exact brush sizes (in pixels)
const BRUSH_SIZES = [2, 5, 10, 15, 20, 25];

interface DrawingToolbarProps {
  /**
   * Current drawing tool
   */
  currentTool?: 'pen' | 'bucket';

  /**
   * Current drawing color
   */
  currentColor?: string;

  /**
   * Current brush size
   */
  currentSize?: number;

  /**
   * Callback when tool is selected
   */
  onToolSelect?: (tool: 'pen' | 'bucket') => void;

  /**
   * Callback when color is selected
   */
  onColorSelect?: (color: string) => void;

  /**
   * Callback when brush size is selected
   */
  onSizeSelect?: (size: number) => void;

  /**
   * Callback when undo is pressed
   */
  onUndo?: () => void;

  /**
   * Callback when clear is pressed
   */
  onClear?: () => void;

  /**
   * Callback when the settings button is pressed
   */
  onOpenSettings?: () => void;
}

/**
 * Functional drawing toolbar for the Drawing Battle screen with HTML5 canvas functionality
 * Maintains the current Ionicons style while adding full drawing tool functionality
 */
const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  currentTool = 'pen',
  currentColor = '#000000', // skribbl.io default black
  currentSize = 5, // skribbl.io default size
  onToolSelect,
  onColorSelect,
  onSizeSelect,
  onUndo,
  onClear,
  onOpenSettings,
}) => {
  const { theme, spacing, borderRadius } = useTheme();

  // State for overlay menus
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isBrushSizeVisible, setIsBrushSizeVisible] = useState(false);

  // Animation values
  const [colorPickerAnimation] = useState(new Animated.Value(0));
  const [brushSizeAnimation] = useState(new Animated.Value(0));

  // Ref for container to detect outside clicks
  const containerRef = useRef<View>(null);

  // Close menus when clicking outside
  const closeAllMenus = () => {
    if (isColorPickerVisible) {
      hideColorPicker();
    }
    if (isBrushSizeVisible) {
      hideBrushSize();
    }
  };

  // Animation functions for overlay menus
  const showColorPicker = () => {
    setIsColorPickerVisible(true);
    setIsBrushSizeVisible(false); // Hide brush size if open
    Animated.timing(colorPickerAnimation, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    // Hide brush size menu if visible
    if (isBrushSizeVisible) {
      Animated.timing(brushSizeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const hideColorPicker = () => {
    Animated.timing(colorPickerAnimation, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setIsColorPickerVisible(false);
    });
  };

  const showBrushSize = () => {
    setIsBrushSizeVisible(true);
    setIsColorPickerVisible(false); // Hide color picker if open
    Animated.timing(brushSizeAnimation, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    // Hide color picker menu if visible
    if (isColorPickerVisible) {
      Animated.timing(colorPickerAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const hideBrushSize = () => {
    Animated.timing(brushSizeAnimation, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setIsBrushSizeVisible(false);
    });
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    onColorSelect?.(color);
    hideColorPicker();
  };

  // Handle brush size selection
  const handleSizeSelect = (size: number) => {
    onSizeSelect?.(size);
    hideBrushSize();
  };

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingVertical: spacing.xxs / 2, // Minimal vertical padding
      paddingHorizontal: 0, // No horizontal padding
      borderTopWidth: 1,
      position: 'relative',
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
    // Overlay menu styles - moved up with gap
    overlayMenu: {
      position: 'absolute',
      bottom: '100%',
      marginBottom: spacing.xs, // Add gap between menu and toolbar
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      borderRadius: borderRadius.md,
      zIndex: 1000,
      ...applyThemeShadow('md'),
    },
    overlayMenuContent: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    // Color picker overlay styles
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    colorOverlayButton: {
      width: '9%', // Optimized for 10 colors per row with proper spacing
      aspectRatio: 1,
      marginBottom: 8,
      // Square blocks with consistent border radius
    },
    // Brush size overlay styles
    brushSizeRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    brushSizeOverlayButton: {
      width: 60,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    brushSizePreview: {
      borderRadius: 50,
    },
    // Full screen overlay for click-outside detection
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
  });

  return (
    <>
      {/* Invisible overlay to catch outside clicks */}
      {(isColorPickerVisible || isBrushSizeVisible) && (
        <TouchableWithoutFeedback onPress={closeAllMenus}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View
        ref={containerRef}
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            // No shadow for skribbl.io-like flat design
          }
        ]}
      >
        {/* Color Picker Overlay Menu */}
        {isColorPickerVisible && (
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.overlayMenu,
                {
                  height: colorPickerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 120],
                  }),
                  opacity: colorPickerAnimation,
                }
              ]}
            >
              <View style={styles.overlayMenuContent}>
                <View style={styles.colorGrid}>
                  {AVAILABLE_COLORS.map((color, index) => (
                    <TouchableOpacity
                      key={`color-${index}`}
                      style={[
                        styles.colorOverlayButton,
                        {
                          backgroundColor: color,
                          borderRadius: borderRadius.md,
                          borderWidth: currentColor === color ? 3 : 1,
                          borderColor: currentColor === color ? theme.primary : theme.border,
                        }
                      ]}
                      onPress={() => handleColorSelect(color)}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        )}

        {/* Brush Size Overlay Menu */}
        {isBrushSizeVisible && (
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.overlayMenu,
                {
                  height: brushSizeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 80],
                  }),
                  opacity: brushSizeAnimation,
                }
              ]}
            >
              <View style={styles.overlayMenuContent}>
                <View style={styles.brushSizeRow}>
                  {BRUSH_SIZES.map((size, index) => (
                    <TouchableOpacity
                      key={`size-${index}`}
                      style={[
                        styles.brushSizeOverlayButton,
                        {
                          backgroundColor: currentSize === size ? theme.primary : theme.backgroundAlt,
                          borderRadius: borderRadius.md,
                          borderWidth: 2,
                          borderColor: currentSize === size ? theme.primary : 'transparent',
                        }
                      ]}
                      onPress={() => handleSizeSelect(size)}
                    >
                      <View
                        style={[
                          styles.brushSizePreview,
                          {
                            width: Math.max(size, 8),
                            height: Math.max(size, 8),
                            backgroundColor: currentSize === size ? '#FFFFFF' : theme.text,
                          }
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        )}

      <View style={styles.toolbarRow}>
        {/* Pen Tool */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: currentTool === 'pen' ? theme.primary : theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          onPress={() => onToolSelect?.('pen')}
        >
          <Ionicons
            name="create-outline"
            size={24}
            color={currentTool === 'pen' ? '#FFFFFF' : theme.text}
          />
        </TouchableOpacity>

        {/* Paint Bucket Tool */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: currentTool === 'bucket' ? theme.primary : theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          onPress={() => onToolSelect?.('bucket')}
        >
          <Ionicons
            name="color-fill-outline"
            size={24}
            color={currentTool === 'bucket' ? '#FFFFFF' : theme.text}
          />
        </TouchableOpacity>

        {/* Color Picker Button */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2,
              borderWidth: 2,
              borderColor: currentColor,
            }
          ]}
          onPress={() => isColorPickerVisible ? hideColorPicker() : showColorPicker()}
        >
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: currentColor,
              borderRadius: borderRadius.sm,
            }}
          />
        </TouchableOpacity>

        {/* Brush Size Button */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          onPress={() => isBrushSizeVisible ? hideBrushSize() : showBrushSize()}
        >
          <View
            style={{
              width: Math.max(currentSize, 8),
              height: Math.max(currentSize, 8),
              backgroundColor: theme.text,
              borderRadius: 50,
            }}
          />
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          onPress={onUndo}
        >
          <Ionicons name="arrow-undo" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Clear/Delete Button */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2
            }
          ]}
          onPress={onClear}
        >
          <Ionicons name="trash-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      </View>
    </>
  );
};

export default DrawingToolbar;
