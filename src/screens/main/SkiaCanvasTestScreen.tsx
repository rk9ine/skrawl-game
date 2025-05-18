import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  LayoutChangeEvent,
  GestureResponderEvent,
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
  const { theme, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const canvasRef = useCanvasRef();

  // Drawing state
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#4361EE');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  // Points collection for smooth path creation
  const pointsRef = useRef<Point[]>([]);

  // Handle touch start
  const handleTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    // Start collecting points
    pointsRef.current = [{ x: locationX, y: locationY }];

    // Create initial path with single point
    const path = Skia.Path.Make();
    path.moveTo(locationX, locationY);

    // Update state
    setCurrentPath(path.toSVGString());
    setIsDrawing(true);
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

  // Clear canvas
  const handleClear = () => {
    setPaths([]);
    setCurrentPath(null);
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
        style="stroke"
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
          Skia Canvas Test
        </Text>

        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="trash-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Canvas Container */}
      <View
        style={[styles.content, { padding: spacing.md }]}
        onLayout={onLayout}
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
      </View>

      {/* Color Selector */}
      <View style={[styles.toolbar, { padding: spacing.md }]}>
        {['#4361EE', '#3A0CA3', '#F72585', '#4CC9F0', '#4F772D'].map((clr) => (
          <TouchableOpacity
            key={clr}
            style={[
              styles.colorButton,
              {
                backgroundColor: clr,
                borderWidth: currentColor === clr ? 3 : 0,
                borderColor: theme.text,
              }
            ]}
            onPress={() => setCurrentColor(clr)}
          />
        ))}
      </View>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default SkiaCanvasTestScreen;
