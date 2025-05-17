import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnUI, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { useDrawingStore, useAuthStore } from '../../store';
import { Text, SafeAreaContainer } from '../../components/ui';
import { applyThemeShadow } from '../../utils/styleUtils';

// Simple whiteboard implementation with basic drawing features
// Optimized for stability and performance

const WhiteboardScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user, isSkipped } = useAuthStore();

  // Refs for canvas position and dimensions
  const canvasRef = useRef<View>(null);
  const [canvasLayout, setCanvasLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Shared values for better performance
  const isPanning = useSharedValue(false);

  // Get drawing store functions
  const {
    paths,
    currentPath,
    color,
    strokeWidth,
    startPath,
    addToPath,
    endPath,
    clearCanvas,
    setColor,
    setStrokeWidth,
    saveDrawing,
  } = useDrawingStore();

  // Handle canvas layout changes
  const handleCanvasLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setCanvasLayout({ x, y, width, height });

    // Measure the absolute position on screen
    canvasRef.current?.measure((fx, fy, width, height, px, py) => {
      if (px !== undefined && py !== undefined) {
        setCanvasLayout(prev => ({ ...prev, x: px, y: py }));
      }
    });
  }, []);

  // Create basic styles without theme values
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {},
    actionButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    canvasContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    canvas: {
      width: '100%',
      height: '100%',
    },
    toolbarContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    toolbarRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    toolButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorPicker: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    colorOption: {
      width: 30,
      height: 30,
    },
    selectedColor: {
      borderWidth: 2,
      borderColor: '#000',
    },
    strokePicker: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    strokeOption: {
      width: 40,
      height: 40,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    strokePreview: {},
  });

  const handleSaveDrawing = async () => {
    if (paths.length === 0) {
      Alert.alert('Error', 'Cannot save an empty drawing');
      return;
    }

    if (isSkipped) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to save drawings',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Auth' as never)
          },
        ]
      );
      return;
    }

    const userId = user?.id || 'guest';
    const drawing = await saveDrawing(userId);

    if (drawing) {
      Alert.alert('Success', 'Drawing saved successfully');
    } else {
      Alert.alert('Error', 'Failed to save drawing');
    }
  };

  // Transform screen coordinates to canvas coordinates
  const transformCoordinates = useCallback((x: number, y: number) => {
    // Adjust for canvas position on screen
    const adjustedX = x - canvasLayout.x;
    const adjustedY = y - canvasLayout.y;

    // Ensure coordinates are within canvas bounds
    const boundedX = Math.max(0, Math.min(adjustedX, canvasLayout.width));
    const boundedY = Math.max(0, Math.min(adjustedY, canvasLayout.height));

    return { x: boundedX, y: boundedY };
  }, [canvasLayout]);

  // Memoize the gesture to prevent unnecessary recreations
  const gesture = useMemo(() =>
    Gesture.Pan()
      .runOnJS(true)
      .onStart((event) => {
        isPanning.value = true;
        const { x, y } = transformCoordinates(event.absoluteX, event.absoluteY);
        startPath(x, y);
      })
      .onUpdate((event) => {
        if (!isPanning.value) return;
        const { x, y } = transformCoordinates(event.absoluteX, event.absoluteY);
        addToPath(x, y);
      })
      .onEnd(() => {
        isPanning.value = false;
        endPath();
      })
      .onFinalize(() => {
        isPanning.value = false;
      }),
  [transformCoordinates, startPath, addToPath, endPath, isPanning]);

  const colors = [
    theme.primary,
    theme.secondary,
    theme.success,
    theme.warning,
    theme.error,
    theme.info,
    '#000000',
    '#FFFFFF',
  ];

  const strokeWidths = [2, 5, 10, 15];

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Clear any ongoing drawing operations
      if (currentPath) {
        endPath();
      }
    };
  }, []);

  // Memoize the paths rendering for better performance
  const renderPaths = useMemo(() => {
    return paths.map((p) => (
      <Path
        key={p.id}
        d={p.path}
        stroke={p.color}
        strokeWidth={p.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    ));
  }, [paths]);

  // Memoize the current path rendering
  const renderCurrentPath = useMemo(() => {
    if (!currentPath) return null;

    return (
      <Path
        d={currentPath}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    );
  }, [currentPath, color, strokeWidth]);



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
        <View style={[
          styles.header,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: theme.backgroundAlt,
                borderRadius: borderRadius.round / 2,
                ...applyThemeShadow('sm')
              }
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text
            variant="heading"
            size={typography.fontSizes.xxl}
          >
            Whiteboard
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.backgroundAlt,
                borderRadius: borderRadius.round / 2,
                ...applyThemeShadow('sm')
              }
            ]}
            onPress={handleSaveDrawing}
          >
            <Ionicons name="save-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View
          ref={canvasRef}
          style={[
            styles.canvasContainer,
            {
              backgroundColor: theme.canvasBackground,
              margin: spacing.xs,
              borderRadius: borderRadius.xl
            }
          ]}
          onLayout={handleCanvasLayout}
        >
          <GestureDetector gesture={gesture}>
            <Animated.View style={styles.canvas}>
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${canvasLayout.width || 100} ${canvasLayout.height || 100}`}
                preserveAspectRatio="none"
              >
                {/* Use memoized components for better performance */}
                {renderPaths}
                {renderCurrentPath}
              </Svg>
            </Animated.View>
          </GestureDetector>
        </View>

        <View style={[
          styles.toolbarContainer,
          {
            backgroundColor: theme.surface,
            padding: spacing.md,
            ...applyThemeShadow('md')
          }
        ]}>
          <View style={[
            styles.toolbarRow,
            {
              marginBottom: spacing.md
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.toolButton,
                {
                  backgroundColor: theme.backgroundAlt,
                  borderRadius: borderRadius.round / 2
                }
              ]}
              onPress={clearCanvas}
            >
              <Ionicons name="trash-outline" size={24} color={theme.error} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolButton,
                {
                  backgroundColor: theme.backgroundAlt,
                  borderRadius: borderRadius.round / 2
                }
              ]}
              onPress={() => useDrawingStore.getState().undoLastPath()}
            >
              <Ionicons name="arrow-undo" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.colorPicker,
            {
              marginBottom: spacing.md
            }
          ]}>
            {colors.map((c, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: c,
                    borderRadius: borderRadius.round / 2
                  },
                  c === color && styles.selectedColor,
                  c === '#FFFFFF' && { borderWidth: 1, borderColor: theme.border },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <View style={styles.strokePicker}>
            {strokeWidths.map((width, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.strokeOption,
                  {
                    borderColor: theme.text,
                    borderRadius: borderRadius.md
                  },
                  width === strokeWidth && { backgroundColor: theme.backgroundAlt },
                ]}
                onPress={() => setStrokeWidth(width)}
              >
                <View
                  style={[
                    styles.strokePreview,
                    {
                      backgroundColor: theme.text,
                      height: width,
                      width: 20,
                      borderRadius: borderRadius.xs
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaContainer>
    </GestureHandlerRootView>
  );
};



export default WhiteboardScreen;
