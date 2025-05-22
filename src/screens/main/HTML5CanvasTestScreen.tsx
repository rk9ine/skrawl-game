import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../../components/ui';
import { applyThemeShadow } from '../../utils/styleUtils';

/**
 * HTML5 Canvas Test Screen
 * Implements a high-performance drawing canvas using HTML5 Canvas in a WebView
 */
const HTML5CanvasTestScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const webViewRef = useRef<WebView>(null);

  // State for selected tool and color
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'bucket'>('pen');
  const [currentColor, setCurrentColor] = useState('#4361EE');
  const [brushSize, setBrushSize] = useState(5);
  const [canvasHeight, setCanvasHeight] = useState(height * 0.7);

  // HTML content for the WebView with embedded canvas
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>HTML5 Canvas Drawing</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          touch-action: none;
          background-color: ${theme.canvasBackground};
        }
        #canvas {
          display: block;
          width: 100%;
          height: 100vh;
          touch-action: none;
        }
        #tempCanvas {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 1;
        }
      </style>
    </head>
    <body>
      <canvas id="canvas"></canvas>
      <canvas id="tempCanvas"></canvas>
      <script>
        // Canvas setup - main canvas for persistent drawing
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });

        // Temporary canvas for real-time drawing (better performance)
        const tempCanvas = document.getElementById('tempCanvas');
        const tempCtx = tempCanvas.getContext('2d', { alpha: true });

        // Drawing state
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let lastTimestamp = 0;
        let currentTool = 'pen';
        let currentColor = '${currentColor}';
        let brushSize = ${brushSize};

        // Path management for undo/redo and multiplayer
        let paths = [];
        let currentPath = [];
        let undoStack = [];
        let pathId = 0;
        let userId = 'local-user';

        // Performance optimization
        const THROTTLE_RATE = 16; // ~60fps
        let animationFrameId = null;
        let pointsBuffer = [];

        // Set canvas size to match the viewport with proper pixel ratio
        function resizeCanvas() {
          const dpr = window.devicePixelRatio || 1;
          const width = window.innerWidth;
          const height = window.innerHeight;

          // Set main canvas size
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = width + 'px';
          canvas.style.height = height + 'px';
          ctx.scale(dpr, dpr);

          // Set temp canvas size
          tempCanvas.width = width * dpr;
          tempCanvas.height = height * dpr;
          tempCanvas.style.width = width + 'px';
          tempCanvas.style.height = height + 'px';
          tempCtx.scale(dpr, dpr);

          // Set background color
          ctx.fillStyle = '${theme.canvasBackground}';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Redraw all paths after resize
          redrawCanvas();
        }

        // Initialize canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Drawing functions
        function startDrawing(e) {
          isDrawing = true;

          // Get touch/mouse position
          const pos = getPosition(e);
          lastX = pos.x;
          lastY = pos.y;
          lastTimestamp = Date.now();

          // Clear the temporary canvas
          clearTempCanvas();

          // Start a new path with unique ID
          pathId = Date.now();
          currentPath = [{
            x: lastX,
            y: lastY,
            time: lastTimestamp,
            pressure: getPressure(e),
            tool: currentTool,
            color: currentColor,
            size: brushSize
          }];

          // If using bucket tool, fill area
          if (currentTool === 'bucket') {
            floodFill(lastX, lastY, currentColor);
            finishDrawing();
          }

          // Prevent default behavior
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        function draw(e) {
          if (!isDrawing || currentTool === 'bucket') return;

          // Get current position and timestamp
          const pos = getPosition(e);
          const now = Date.now();

          // Skip if points are too close together (time-based throttling)
          if (now - lastTimestamp < THROTTLE_RATE) {
            // Add to buffer for later processing
            pointsBuffer.push({
              x: pos.x,
              y: pos.y,
              time: now,
              pressure: getPressure(e)
            });

            e.preventDefault();
            e.stopPropagation();
            return false;
          }

          // Process any buffered points
          if (pointsBuffer.length > 0) {
            // Use the most recent buffered point
            const bufferPoint = pointsBuffer[pointsBuffer.length - 1];
            drawPoint(bufferPoint.x, bufferPoint.y, bufferPoint.pressure);
            pointsBuffer = [];
          }

          // Draw the current point
          drawPoint(pos.x, pos.y, getPressure(e));

          // Update timestamp
          lastTimestamp = now;

          // Prevent default behavior
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        function drawPoint(x, y, pressure = 1.0) {
          // Calculate distance for line smoothing
          const dx = x - lastX;
          const dy = y - lastY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Skip if the point is too close (reduces jitter)
          if (distance < 0.5) return;

          // Clear the temporary canvas
          clearTempCanvas();

          // Draw on both canvases
          [tempCtx, ctx].forEach(context => {
            // Set drawing styles
            context.beginPath();
            context.lineJoin = 'round';
            context.lineCap = 'round';

            // Adjust brush size based on pressure if available
            const adjustedSize = Math.max(1, brushSize * pressure);
            context.lineWidth = adjustedSize;

            // Set color and composite operation based on tool
            if (currentTool === 'pen') {
              context.strokeStyle = currentColor;
              context.globalCompositeOperation = 'source-over';
            } else if (currentTool === 'eraser') {
              context.strokeStyle = '${theme.canvasBackground}';
              context.globalCompositeOperation = 'destination-out';
            }

            // Use quadratic curves for smoother lines when distance is appropriate
            if (distance > 2 && currentPath.length > 1) {
              // Get the last two points for curve calculation
              const lastPoint = currentPath[currentPath.length - 1];
              const controlX = lastX;
              const controlY = lastY;

              // Draw a quadratic curve
              context.moveTo(lastPoint.x, lastPoint.y);
              context.quadraticCurveTo(controlX, controlY, x, y);
            } else {
              // For short distances, just draw a line
              context.moveTo(lastX, lastY);
              context.lineTo(x, y);
            }

            context.stroke();
          });

          // Add point to current path
          currentPath.push({
            x: x,
            y: y,
            time: Date.now(),
            pressure: pressure,
            tool: currentTool,
            color: currentColor,
            size: brushSize
          });

          // Update last position
          lastX = x;
          lastY = y;
        }

        function clearTempCanvas() {
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        function finishDrawing() {
          if (!isDrawing) return;
          isDrawing = false;

          // Process any remaining buffered points
          if (pointsBuffer.length > 0) {
            const lastPoint = pointsBuffer[pointsBuffer.length - 1];
            drawPoint(lastPoint.x, lastPoint.y, lastPoint.pressure);
            pointsBuffer = [];
          }

          // Clear the temporary canvas
          clearTempCanvas();

          // Add current path to paths array if it has points
          if (currentPath.length > 1) {
            // Create a path object with metadata
            const pathObject = {
              id: pathId,
              userId: userId,
              points: simplifyPath(currentPath),
              tool: currentTool,
              color: currentColor,
              timestamp: Date.now()
            };

            paths.push(pathObject);
            undoStack = []; // Clear redo stack when new drawing is made

            // Send path to React Native for multiplayer sync
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'newPath',
              path: pathObject,
              count: paths.length
            }));
          }

          currentPath = [];

          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
          tempCtx.globalCompositeOperation = 'source-over';
        }

        // Utility function to get position from event with better precision
        function getPosition(e) {
          let x, y;

          if (e.touches && e.touches.length > 0) {
            // Touch event
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
          } else if (e.changedTouches && e.changedTouches.length > 0) {
            // Touch end event
            x = e.changedTouches[0].clientX;
            y = e.changedTouches[0].clientY;
          } else {
            // Mouse event
            x = e.clientX;
            y = e.clientY;
          }

          // Apply device pixel ratio for better precision
          const dpr = window.devicePixelRatio || 1;
          return {
            x: x,
            y: y
          };
        }

        // Get pressure from touch/pointer event (if available)
        function getPressure(e) {
          // Check for Pointer events with pressure
          if (e.pressure !== undefined && e.pressure !== 0) {
            return e.pressure;
          }

          // Check for Touch events with force (iOS)
          if (e.touches && e.touches[0] && e.touches[0].force !== undefined) {
            return e.touches[0].force;
          }

          // Default pressure
          return 1.0;
        }

        // Simplify path for better performance and network transmission
        function simplifyPath(points) {
          if (points.length < 3) return points;

          const tolerance = 1.0; // Tolerance for simplification
          const simplified = [points[0]];
          let prevPoint = points[0];

          for (let i = 1; i < points.length - 1; i++) {
            const point = points[i];
            const nextPoint = points[i + 1];

            // Calculate distance between current point and line formed by prev and next
            const dx1 = nextPoint.x - prevPoint.x;
            const dy1 = nextPoint.y - prevPoint.y;
            const dx2 = point.x - prevPoint.x;
            const dy2 = point.y - prevPoint.y;

            // Cross product to find perpendicular distance
            const area = Math.abs(dx1 * dy2 - dx2 * dy1);
            const length = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const distance = area / length;

            // Keep point if it's far enough from the line or has pressure change
            const pressureDiff = Math.abs(point.pressure - prevPoint.pressure);
            if (distance > tolerance || pressureDiff > 0.1) {
              simplified.push(point);
              prevPoint = point;
            }
          }

          // Always include the last point
          simplified.push(points[points.length - 1]);

          return simplified;
        }

        // Optimized flood fill algorithm (paint bucket) with scanline approach
        function floodFill(x, y, fillColor) {
          // Round coordinates to integers
          x = Math.floor(x);
          y = Math.floor(y);

          // Get the color at the target position
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const width = imageData.width;
          const height = imageData.height;

          // Get the index of the target pixel
          const targetIdx = (y * width + x) * 4;

          // Get the color of the target pixel
          const targetR = data[targetIdx];
          const targetG = data[targetIdx + 1];
          const targetB = data[targetIdx + 2];
          const targetA = data[targetIdx + 3];

          // Convert fill color from hex to RGBA
          const fillRGBA = hexToRgba(fillColor);

          // Don't fill if the target color is the same as the fill color
          if (
            targetR === fillRGBA.r &&
            targetG === fillRGBA.g &&
            targetB === fillRGBA.b &&
            targetA === 255
          ) {
            return;
          }

          // Function to check if a pixel matches the target color
          function matchesTarget(idx) {
            return (
              data[idx] === targetR &&
              data[idx + 1] === targetG &&
              data[idx + 2] === targetB &&
              data[idx + 3] === targetA
            );
          }

          // Function to set a pixel to the fill color
          function setFillColor(idx) {
            data[idx] = fillRGBA.r;
            data[idx + 1] = fillRGBA.g;
            data[idx + 2] = fillRGBA.b;
            data[idx + 3] = 255;
          }

          // Stack-based scanline flood fill (more efficient than simple queue)
          const stack = [[x, y]];

          while (stack.length > 0) {
            const [currX, currY] = stack.pop();

            // Skip if outside canvas
            if (currX < 0 || currX >= width || currY < 0 || currY >= height) {
              continue;
            }

            // Find the leftmost and rightmost pixels of the scanline
            let left = currX;
            let right = currX;
            const idx = (currY * width + currX) * 4;

            // Skip if this pixel doesn't match the target
            if (!matchesTarget(idx)) {
              continue;
            }

            // Find leftmost pixel of the scanline
            while (left > 0 && matchesTarget((currY * width + (left - 1)) * 4)) {
              left--;
            }

            // Find rightmost pixel of the scanline
            while (right < width - 1 && matchesTarget((currY * width + (right + 1)) * 4)) {
              right++;
            }

            // Fill the scanline
            for (let i = left; i <= right; i++) {
              const idx = (currY * width + i) * 4;
              setFillColor(idx);

              // Check pixels above and below for next scanlines
              if (currY > 0 && matchesTarget((currY - 1) * width + i) * 4) {
                stack.push([i, currY - 1]);
              }

              if (currY < height - 1 && matchesTarget((currY + 1) * width + i) * 4) {
                stack.push([i, currY + 1]);
              }
            }
          }

          // Update canvas with the filled area
          ctx.putImageData(imageData, 0, 0);
        }

        // Convert hex color to RGBA
        function hexToRgba(hex) {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return { r, g, b, a: 255 };
        }

        // Clear canvas
        function clearCanvas() {
          ctx.fillStyle = '${theme.canvasBackground}';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          clearTempCanvas();
          paths = [];
          undoStack = [];

          // Notify React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'clear'
          }));
        }

        // Undo last path
        function undo() {
          if (paths.length === 0) return;

          // Move last path to undo stack
          undoStack.push(paths.pop());

          // Redraw canvas
          redrawCanvas();

          // Notify React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'undo',
            pathsCount: paths.length,
            undoStackCount: undoStack.length
          }));
        }

        // Redo last undone path
        function redo() {
          if (undoStack.length === 0) return;

          // Move last undone path back to paths
          paths.push(undoStack.pop());

          // Redraw canvas
          redrawCanvas();

          // Notify React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'redo',
            pathsCount: paths.length,
            undoStackCount: undoStack.length
          }));
        }

        // Redraw the entire canvas from paths (optimized for performance)
        function redrawCanvas() {
          // Clear canvas
          ctx.fillStyle = '${theme.canvasBackground}';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Redraw all paths
          for (const path of paths) {
            const points = path.points || path;
            if (points.length < 2) continue;

            // Get the first point
            const firstPoint = points[0];
            const tool = path.tool || firstPoint.tool;
            const color = path.color || firstPoint.color;
            const size = firstPoint.size || brushSize;

            ctx.beginPath();
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = size;

            if (tool === 'pen') {
              ctx.strokeStyle = color;
              ctx.globalCompositeOperation = 'source-over';
            } else if (tool === 'eraser') {
              ctx.strokeStyle = '${theme.canvasBackground}';
              ctx.globalCompositeOperation = 'destination-out';
            }

            // Start path
            ctx.moveTo(firstPoint.x, firstPoint.y);

            // Draw smooth curves for better quality
            if (points.length > 2) {
              // Use quadratic curves for smoother lines
              for (let i = 1; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                // Calculate control point (midpoint)
                const cpX = (p1.x + p2.x) / 2;
                const cpY = (p1.y + p2.y) / 2;

                ctx.quadraticCurveTo(p1.x, p1.y, cpX, cpY);
              }

              // Connect to the last point
              const lastPoint = points[points.length - 1];
              ctx.lineTo(lastPoint.x, lastPoint.y);
            } else {
              // Just draw a line for simple paths
              for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
              }
            }

            ctx.stroke();
          }

          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
        }

        // Handle messages from React Native
        window.addEventListener('message', function(event) {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'setTool':
              currentTool = message.tool;
              break;
            case 'setColor':
              currentColor = message.color;
              break;
            case 'setBrushSize':
              brushSize = message.size;
              break;
            case 'clear':
              clearCanvas();
              break;
            case 'undo':
              undo();
              break;
            case 'redo':
              redo();
              break;
            case 'setUserId':
              userId = message.userId;
              break;
            case 'addRemotePath':
              // Add a path from another user
              if (message.path) {
                paths.push(message.path);
                redrawCanvas();
              }
              break;
            case 'syncPaths':
              // Sync all paths from server
              if (message.paths && Array.isArray(message.paths)) {
                paths = message.paths;
                redrawCanvas();
              }
              break;
          }
        });

        // Optimized event handling with passive listeners where appropriate
        // Use pointer events when available for better performance and pressure sensitivity
        if (window.PointerEvent) {
          // Pointer events (modern browsers)
          canvas.addEventListener('pointerdown', startDrawing);
          canvas.addEventListener('pointermove', draw);
          canvas.addEventListener('pointerup', finishDrawing);
          canvas.addEventListener('pointerout', finishDrawing);
          canvas.addEventListener('pointercancel', finishDrawing);

          // Prevent default touch actions
          canvas.style.touchAction = 'none';
        } else {
          // Mouse events (fallback)
          canvas.addEventListener('mousedown', startDrawing);
          canvas.addEventListener('mousemove', draw);
          canvas.addEventListener('mouseup', finishDrawing);
          canvas.addEventListener('mouseout', finishDrawing);

          // Touch events (fallback)
          canvas.addEventListener('touchstart', startDrawing, { passive: false });
          canvas.addEventListener('touchmove', draw, { passive: false });
          canvas.addEventListener('touchend', finishDrawing);
          canvas.addEventListener('touchcancel', finishDrawing);
        }

        // Notify React Native that canvas is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'canvasReady',
          width: canvas.width,
          height: canvas.height
        }));
      </script>
    </body>
    </html>
  `;

  // State for canvas information
  const [canvasInfo, setCanvasInfo] = useState({ width: 0, height: 0 });
  const [pathCount, setPathCount] = useState(0);
  const [undoCount, setUndoCount] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  // Generate a unique user ID for this session (for multiplayer)
  const userId = useRef(`user-${Date.now()}-${Math.floor(Math.random() * 10000)}`).current;

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Handle different message types
      switch (data.type) {
        case 'canvasReady':
          setCanvasInfo({
            width: data.width,
            height: data.height
          });
          setCanvasReady(true);

          // Set user ID in the WebView
          sendMessageToWebView({
            type: 'setUserId',
            userId: userId
          });
          break;

        case 'newPath':
          // Handle new path drawn by the user
          setPathCount(data.count);

          // In a real multiplayer implementation, you would send this path to other users
          // For example: sendPathToServer(data.path);
          break;

        case 'undo':
          setPathCount(data.pathsCount);
          setUndoCount(data.undoStackCount);
          break;

        case 'redo':
          setPathCount(data.pathsCount);
          setUndoCount(data.undoStackCount);
          break;

        case 'clear':
          setPathCount(0);
          setUndoCount(0);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Send message to WebView with optimized approach
  const sendMessageToWebView = (message: any) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(${JSON.stringify(JSON.stringify(message))}, '*');
        true;
      `);
    }
  };

  // Function to add a remote path (for multiplayer)
  const addRemotePath = (path: any) => {
    sendMessageToWebView({
      type: 'addRemotePath',
      path: path
    });
  };

  // Function to sync all paths (for multiplayer)
  const syncPaths = (paths: any[]) => {
    sendMessageToWebView({
      type: 'syncPaths',
      paths: paths
    });
  };

  // Tool selection handlers
  const handleToolSelect = (tool: 'pen' | 'eraser' | 'bucket') => {
    setCurrentTool(tool);
    sendMessageToWebView({ type: 'setTool', tool });
  };

  // Color selection handler
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
    sendMessageToWebView({ type: 'setColor', color });
  };

  // Brush size handler
  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
    sendMessageToWebView({ type: 'setBrushSize', size });
  };

  // Clear canvas
  const handleClear = () => {
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to clear the canvas?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => sendMessageToWebView({ type: 'clear' }),
          style: 'destructive'
        },
      ]
    );
  };

  // Undo last path
  const handleUndo = () => {
    sendMessageToWebView({ type: 'undo' });
  };

  // Redo last undone path
  const handleRedo = () => {
    sendMessageToWebView({ type: 'redo' });
  };

  // Go back to dashboard
  const handleBack = () => {
    navigation.goBack();
  };

  // Available colors
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

  // Available brush sizes
  const brushSizes = [2, 5, 10, 15];

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
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
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text
          variant="heading"
          size={typography.fontSizes.xxl}
        >
          HTML5 Canvas Test
        </Text>

        <View style={{ width: 44 }} />
      </View>

      {/* Canvas */}
      <View style={[
        styles.canvasContainer,
        {
          backgroundColor: theme.canvasBackground,
          margin: spacing.xs,
          borderRadius: borderRadius.xl,
          ...Platform.select({
            ios: applyThemeShadow('md'),
            android: applyThemeShadow('md')
          })
        }
      ]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.webView}
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          renderToHardwareTextureAndroid={true}
          useWebKit={true}
          textZoom={100}
          onShouldStartLoadWithRequest={() => true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: theme.canvasBackground }]}>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                color={theme.textSecondary}
              >
                Loading Canvas...
              </Text>
            </View>
          )}
        />
      </View>

      {/* Drawing Tools */}
      <View style={[
        styles.toolsContainer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm
        }
      ]}>
        {/* Tool Selection */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={[
              styles.toolButton,
              {
                backgroundColor: currentTool === 'pen' ? theme.primary + '40' : theme.backgroundAlt,
                borderRadius: borderRadius.round / 2
              }
            ]}
            onPress={() => handleToolSelect('pen')}
          >
            <Ionicons name="brush-outline" size={24} color={currentTool === 'pen' ? theme.primary : theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              {
                backgroundColor: currentTool === 'eraser' ? theme.primary + '40' : theme.backgroundAlt,
                borderRadius: borderRadius.round / 2
              }
            ]}
            onPress={() => handleToolSelect('eraser')}
          >
            <Ionicons name="trash-outline" size={24} color={currentTool === 'eraser' ? theme.primary : theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              {
                backgroundColor: currentTool === 'bucket' ? theme.primary + '40' : theme.backgroundAlt,
                borderRadius: borderRadius.round / 2
              }
            ]}
            onPress={() => handleToolSelect('bucket')}
          >
            <Ionicons name="color-fill-outline" size={24} color={currentTool === 'bucket' ? theme.primary : theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              {
                backgroundColor: theme.backgroundAlt,
                borderRadius: borderRadius.round / 2
              }
            ]}
            onPress={handleUndo}
          >
            <Ionicons name="arrow-undo" size={24} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              {
                backgroundColor: theme.backgroundAlt,
                borderRadius: borderRadius.round / 2
              }
            ]}
            onPress={handleRedo}
          >
            <Ionicons name="arrow-redo" size={24} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              {
                backgroundColor: theme.error + '20',
                borderRadius: borderRadius.round / 2
              }
            ]}
            onPress={handleClear}
          >
            <Ionicons name="trash-bin-outline" size={24} color={theme.error} />
          </TouchableOpacity>
        </View>

        {/* Color Selection */}
        <View style={styles.colorRow}>
          {colors.map((color, index) => (
            <TouchableOpacity
              key={`color-${index}`}
              style={[
                styles.colorButton,
                {
                  backgroundColor: color,
                  borderRadius: borderRadius.round,
                  borderWidth: 2,
                  borderColor: color === currentColor ? theme.primary : 'transparent'
                }
              ]}
              onPress={() => handleColorSelect(color)}
            />
          ))}
        </View>

        {/* Brush Size Selection */}
        <View style={styles.brushSizeRow}>
          {brushSizes.map((size, index) => (
            <TouchableOpacity
              key={`size-${index}`}
              style={[
                styles.brushSizeButton,
                {
                  borderRadius: borderRadius.round,
                  borderWidth: 2,
                  borderColor: size === brushSize ? theme.primary : 'transparent',
                  backgroundColor: theme.backgroundAlt
                }
              ]}
              onPress={() => handleBrushSizeChange(size)}
            >
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: currentColor
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
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
    width: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  toolsContainer: {
    width: '100%',
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorButton: {
    width: 30,
    height: 30,
  },
  brushSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  brushSizeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
  },
});

export default HTML5CanvasTestScreen;
