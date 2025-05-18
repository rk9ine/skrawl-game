import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  Canvas,
  Path,
  Skia,
  SkiaView,
  TouchInfo,
  useDrawCallback,
  useTouchHandler,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  ExtendedTouchInfo,
} from '@shopify/react-native-skia';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../../components/ui';
import { create } from 'zustand';

// Define types for our drawing paths
type CurrentPath = {
  path: ReturnType<typeof Skia.Path.Make>;
  paint: ReturnType<typeof Skia.Paint>;
  color: string;
};

// Create a store for managing drawing state
interface DrawingState {
  completedPaths: CurrentPath[];
  setCompletedPaths: (paths: CurrentPath[]) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

const useDrawingStore = create<DrawingState>((set) => ({
  completedPaths: [],
  setCompletedPaths: (completedPaths) => set({ completedPaths }),
  color: '#4361EE',
  setColor: (color) => set({ color }),
  strokeWidth: 5,
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
}));

// Helper function to create a paint object
const getPaint = (strokeWidth: number, color: string) => {
  const paint = Skia.Paint();
  paint.setStrokeWidth(strokeWidth);
  paint.setStrokeMiter(5);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setAntiAlias(true);
  const _color = paint.copy();
  _color.setColor(Skia.Color(color));
  return _color;
};

const SkiaCanvasTestScreen = () => {
  const { theme, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  // Drawing state
  const touchState = useRef(false);
  const canvas = useRef<any>();
  const currentPath = useRef<CurrentPath | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(400);
  
  // Get state from store
  const completedPaths = useDrawingStore((state) => state.completedPaths);
  const setCompletedPaths = useDrawingStore((state) => state.setCompletedPaths);
  const color = useDrawingStore((state) => state.color);
  const strokeWidth = useDrawingStore((state) => state.strokeWidth);

  // Handle drawing active (when finger is moving)
  const onDrawingActive = useCallback((touchInfo: ExtendedTouchInfo) => {
    const { x, y } = touchInfo;
    if (!currentPath.current?.path) return;
    if (touchState.current) {
      currentPath.current.path.lineTo(x, y);
      if (currentPath.current && canvas.current) {
        canvas.current.drawPath(
          currentPath.current.path,
          currentPath.current.paint,
        );
      }
    }
  }, []);

  // Handle drawing start (when finger touches screen)
  const onDrawingStart = useCallback(
    (touchInfo: TouchInfo) => {
      if (currentPath.current) return;
      const { x, y } = touchInfo;
      
      // Create a new path and paint
      currentPath.current = {
        path: Skia.Path.Make(),
        paint: getPaint(strokeWidth, color),
        color,
      };

      touchState.current = true;
      currentPath.current.path.moveTo(x, y);

      if (currentPath.current && canvas.current) {
        canvas.current.drawPath(
          currentPath.current.path,
          currentPath.current.paint,
        );
      }
    },
    [color, strokeWidth],
  );

  // Handle drawing end (when finger is lifted)
  const onDrawingFinished = useCallback(() => {
    if (!currentPath.current) return;
    
    // Add the current path to completed paths
    const updatedPaths = [...completedPaths];
    updatedPaths.push({
      path: currentPath.current.path.copy(),
      paint: currentPath.current.paint.copy(),
      color: currentPath.current.color,
    });
    
    setCompletedPaths(updatedPaths);
    
    // Reset current path
    currentPath.current = null;
    touchState.current = false;
  }, [completedPaths, setCompletedPaths]);

  // Set up touch handler
  const touchHandler = useTouchHandler({
    onActive: onDrawingActive,
    onStart: onDrawingStart,
    onEnd: onDrawingFinished,
  });

  // Drawing callback
  const onDraw = useDrawCallback((_canvas, info) => {
    touchHandler(info.touches);
    
    if (!canvas.current) {
      canvas.current = _canvas;
    }
  }, [touchHandler]);

  // Handle layout changes
  const onLayout = (event: LayoutChangeEvent) => {
    setCanvasHeight(event.nativeEvent.layout.height);
  };

  // Clear canvas
  const handleClear = () => {
    setCompletedPaths([]);
  };

  // Go back to dashboard
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text variant="heading" size="xl">
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
        >
          {/* SkiaView for active drawing */}
          <SkiaView
            onDraw={onDraw}
            style={{ 
              height: canvasHeight, 
              width: width - (spacing.md * 2), 
              zIndex: 10 
            }}
          />

          {/* Canvas for displaying completed paths */}
          <Canvas
            style={{
              height: canvasHeight,
              width: width - (spacing.md * 2),
              position: 'absolute',
            }}
          >
            {completedPaths.map((path, index) => (
              <Path
                key={`path-${index}`}
                path={path.path}
                paint={path.paint}
              />
            ))}
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
                borderWidth: color === clr ? 3 : 0,
                borderColor: theme.text,
              }
            ]}
            onPress={() => useDrawingStore.getState().setColor(clr)}
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
