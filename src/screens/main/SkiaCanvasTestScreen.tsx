import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  LayoutChangeEvent,
  GestureResponderEvent,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  Canvas,
  Path,
  useCanvasRef,
  Group,
  Skia,
  Fill,
} from '@shopify/react-native-skia';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../../components/ui';
import { applyThemeShadow } from '../../utils/styleUtils';


// Define types for our drawing paths
type DrawingPath = {
  path: string;
  color: string;
  strokeWidth: number;
};

// Point type for collecting drawing points
type Point = {
  x: number;
  y: number;
};

// Tool types
type DrawingTool = 'pen' | 'bucket';

// Enhanced color palette - organized logically for better drawing experience
const AVAILABLE_COLORS = [
  // Row 1: Vibrant primary and warm colors
  '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#ADFF2F', '#00FF00', '#00CED1', '#1E90FF', '#4169E1', '#8A2BE2',
  // Row 2: Secondary colors, neutrals, and essentials
  '#FF1493', '#FF69B4', '#8B4513', '#D2691E', '#32CD32', '#008080', '#4682B4', '#9370DB', '#000000', '#FFFFFF',
];

// Available brush sizes (limited to 5 for overlay menu)
const BRUSH_SIZES = [2, 5, 10, 15, 20];

// Helper function to create a smooth path from points
const createSmoothPath = (points: Point[]) => {
  const path = Skia.Path.Make();
  if (points.length < 2) return path;

  path.moveTo(points[0].x, points[0].y);

  // Use quadratic curves for smoother lines
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    path.quadTo(points[i].x, points[i].y, xc, yc);
  }

  // Add the last point
  if (points.length > 1) {
    const lastPoint = points[points.length - 1];
    path.lineTo(lastPoint.x, lastPoint.y);
  }

  return path;
};

const SkiaCanvasTestScreen = () => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const canvasRef = useCanvasRef();

  // Drawing state
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#4361EE');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);

  // Toolbar bar states
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isBrushSizeVisible, setIsBrushSizeVisible] = useState(false);

  // Animation values for toolbar bars
  const colorPickerAnimation = useRef(new Animated.Value(0)).current;
  const brushSizeAnimation = useRef(new Animated.Value(0)).current;

  // Points collection for smooth path creation
  const pointsRef = useRef<Point[]>([]);

  // Handle container touch to dismiss bars
  const handleContainerTouch = () => {
    if (isColorPickerVisible) {
      hideColorPicker();
    }
    if (isBrushSizeVisible) {
      hideBrushSize();
    }
  };

  // Handle touch start
  const handleTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    if (currentTool === 'pen') {
      // Start collecting points for pen tool
      pointsRef.current = [{ x: locationX, y: locationY }];

      // Create initial path with single point
      const path = Skia.Path.Make();
      path.moveTo(locationX, locationY);

      // Update state
      setCurrentPath(path.toSVGString());
      setIsDrawing(true);
    } else if (currentTool === 'bucket') {
      // Handle paint bucket tool - create a filled rectangle as placeholder
      // Note: Real flood fill would require pixel-level canvas manipulation
      handlePaintBucket(locationX, locationY);
    }
  };

  // Handle touch move
  const handleTouchMove = (event: GestureResponderEvent) => {
    if (!isDrawing) return;

    const { locationX, locationY } = event.nativeEvent;

    // Add point to collection
    pointsRef.current.push({ x: locationX, y: locationY });

    // Only update the path every few points to improve performance
    if (pointsRef.current.length % 3 === 0 || pointsRef.current.length <= 3) {
      // Create smooth path from collected points
      const path = createSmoothPath(pointsRef.current);
      setCurrentPath(path.toSVGString());
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDrawing || pointsRef.current.length === 0) return;

    // Save current state to undo stack before adding new path
    setUndoStack(prev => [...prev, paths]);

    // Create final smooth path from all collected points
    const path = createSmoothPath(pointsRef.current);
    const pathString = path.toSVGString();

    // Add the completed path to paths array, but limit total paths for performance
    const newPaths = [
      ...paths,
      {
        path: pathString,
        color: currentColor,
        strokeWidth,
      },
    ];

    // Keep only the last 100 paths to maintain performance
    if (newPaths.length > 100) {
      newPaths.splice(0, newPaths.length - 100);
    }

    setPaths(newPaths);

    // Reset state
    setCurrentPath(null);
    setIsDrawing(false);
    pointsRef.current = [];
  };

  // Handle layout changes
  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setCanvasHeight(height);
  };

  // Clear canvas with confirmation
  const handleClear = () => {
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to clear the entire canvas?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // Save current state to undo stack before clearing
            setUndoStack(prev => [...prev, paths]);
            setPaths([]);
            setCurrentPath(null);
          },
          style: 'destructive'
        },
      ]
    );
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setPaths(previousState);
      setUndoStack(prev => prev.slice(0, -1));
      setCurrentPath(null);
    }
  };

  // Handle paint bucket tool (simplified implementation)
  const handlePaintBucket = (x: number, y: number) => {
    // Save current state to undo stack
    setUndoStack(prev => [...prev, paths]);

    // Create a filled circle at the touch point as a placeholder for flood fill
    const path = Skia.Path.Make();
    path.addCircle(x, y, 20); // 20px radius circle

    const newPath: DrawingPath = {
      path: path.toSVGString(),
      color: currentColor,
      strokeWidth: 0, // No stroke for filled shapes
    };

    setPaths(prev => [...prev, newPath]);
  };

  // Handle tool selection
  const handleToolSelect = (tool: DrawingTool) => {
    setCurrentTool(tool);
  };

  // Animation functions for top overlay menu
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
    setCurrentColor(color);
    hideColorPicker();
  };

  // Handle brush size selection
  const handleBrushSizeSelect = (size: number) => {
    setStrokeWidth(size);
    hideBrushSize();
  };

  // Go back to dashboard
  const handleBack = () => {
    navigation.goBack();
  };

  // Memoize rendered paths to prevent unnecessary re-renders
  const renderedPaths = useMemo(() => {
    return paths.map((path, index) => (
      <Path
        key={`path-${index}`}
        path={path.path}
        color={path.color}
        style={path.strokeWidth === 0 ? "fill" : "stroke"}
        strokeWidth={path.strokeWidth}
        strokeCap="round"
        strokeJoin="round"
        antiAlias={true}
      />
    ));
  }, [paths]);

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text variant="heading">
          Whiteboard
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Main Content Container with Overlay Positioning */}
      <View style={styles.mainContent}>

      {/* Canvas Container */}
      <TouchableOpacity
        style={[styles.content, { padding: spacing.md }]}
        onLayout={onLayout}
        onPress={handleContainerTouch}
        activeOpacity={1}
      >
        <View
          style={[
            styles.canvasContainer,
            {
              backgroundColor: theme.canvasBackground,
              borderRadius: borderRadius.md,
              width: width - (spacing.md * 2),
            }
          ]}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Canvas */}
          <Canvas
            ref={canvasRef}
            style={{
              height: canvasHeight,
              width: width - (spacing.md * 2)
            }}
          >
            {/* Background */}
            <Fill color={theme.canvasBackground} />

            {/* Draw all paths */}
            <Group>
              {/* Memoized completed paths */}
              {renderedPaths}

              {/* Draw current path */}
              {currentPath && (
                <Path
                  path={currentPath}
                  color={currentColor}
                  style="stroke"
                  strokeWidth={strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                  antiAlias={true}
                />
              )}
            </Group>
          </Canvas>
        </View>
      </TouchableOpacity>

        {/* Color Picker Overlay Menu - Above Toolbar */}
        {isColorPickerVisible && (
          <Animated.View
            style={[
              styles.overlayMenu,
              {
                backgroundColor: theme.surface,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                ...applyThemeShadow('md'),
                height: colorPickerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 140], // Increased height for 2-row grid with better spacing
                }),
                opacity: colorPickerAnimation,
                transform: [{
                  translateY: colorPickerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [140, 0], // Slide up from bottom - matches height
                  })
                }]
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
        )}

        {/* Brush Size Overlay Menu - Above Toolbar */}
        {isBrushSizeVisible && (
          <Animated.View
            style={[
              styles.overlayMenu,
              {
                backgroundColor: theme.surface,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                ...applyThemeShadow('md'),
                height: brushSizeAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 80], // Single row height
                }),
                opacity: brushSizeAnimation,
                transform: [{
                  translateY: brushSizeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0], // Slide up from bottom
                  })
                }]
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
                        backgroundColor: strokeWidth === size ? theme.primary : theme.backgroundAlt,
                        borderRadius: borderRadius.md,
                        borderWidth: 2,
                        borderColor: strokeWidth === size ? theme.primary : 'transparent',
                      }
                    ]}
                    onPress={() => handleBrushSizeSelect(size)}
                  >
                    <View
                      style={{
                        width: Math.min(size, 24),
                        height: Math.min(size, 24),
                        borderRadius: Math.min(size, 24) / 2,
                        backgroundColor: strokeWidth === size ? '#FFFFFF' : currentColor,
                      }}
                    />
                    <Text
                      variant="body"
                      size={typography.fontSizes.xs}
                      color={strokeWidth === size ? '#FFFFFF' : theme.text}
                      style={{ marginTop: spacing.xxs }}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

      </View>

      {/* Drawing Toolbar */}
      <View style={[
        styles.toolbar,
        {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          ...applyThemeShadow('sm')
        }
      ]}>
        {/* Pen Tool */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: currentTool === 'pen' ? theme.primary : theme.backgroundAlt,
              borderRadius: borderRadius.md,
            }
          ]}
          onPress={() => handleToolSelect('pen')}
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
              borderRadius: borderRadius.md,
            }
          ]}
          onPress={() => handleToolSelect('bucket')}
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
              borderRadius: borderRadius.md,
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
              borderRadius: borderRadius.md,
            }
          ]}
          onPress={() => isBrushSizeVisible ? hideBrushSize() : showBrushSize()}
        >
          <View
            style={{
              width: strokeWidth,
              height: strokeWidth,
              backgroundColor: theme.text,
              borderRadius: strokeWidth / 2,
              minWidth: 8,
              minHeight: 8,
            }}
          />
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: undoStack.length > 0 ? theme.backgroundAlt : theme.backgroundAlt,
              borderRadius: borderRadius.md,
              opacity: undoStack.length > 0 ? 1 : 0.5,
            }
          ]}
          onPress={handleUndo}
          disabled={undoStack.length === 0}
        >
          <Ionicons
            name="arrow-undo-outline"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        {/* Clear Button */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.md,
            }
          ]}
          onPress={handleClear}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={theme.error}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Overlay menu styles - positioned above toolbar
  overlayMenu: {
    position: 'absolute',
    bottom: 0, // Position at bottom to appear above toolbar
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
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
});

export default SkiaCanvasTestScreen;
