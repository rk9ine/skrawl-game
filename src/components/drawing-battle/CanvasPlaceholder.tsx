import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';

interface DrawingCanvasProps {
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
   * Callback when undo is triggered from canvas
   */
  onUndo?: () => void;

  /**
   * Callback when clear is triggered from canvas
   */
  onClear?: () => void;
}

// Define the ref interface
interface DrawingCanvasRef {
  undo: () => void;
  clear: () => void;
}

// Static HTML content - moved outside component to prevent recreation
const HTML_CONTENT = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Drawing Battle Canvas</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        touch-action: none;
        background-color: #FFFFFF;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        height: 100vh;
        height: 100dvh;
      }

      #canvas {
        display: block;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        touch-action: none;
        cursor: crosshair;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1;
        background-color: #FFFFFF;
      }
    </style>
  </head>
  <body>
    <canvas id="canvas"></canvas>

    <script>
      // ===== CANVAS SETUP =====
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
        willReadFrequently: false
      });

      // ===== DRAWING STATE (smooth but performant) =====
      let isDrawing = false;
      let currentTool = 'pen';
      let currentColor = '#000000';
      let currentSize = 5;
      let points = [];
      let strokes = [];
      let undoStack = [];
      let currentStroke = null;

      // For smooth drawing
      let lastDrawnPoint = null;
      let tempCanvas = null;
      let tempCtx = null;

      // ===== CANVAS UTILITIES =====
      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        // Set drawing properties for smooth drawing
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Create temporary canvas for smooth drawing preview
        if (!tempCanvas) {
          tempCanvas = document.createElement('canvas');
          tempCtx = tempCanvas.getContext('2d');
        }

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.scale(dpr, dpr);
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';

        // Initialize canvas with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        redrawCanvas();
      }

      function getCanvasPoint(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      }

      // ===== UNDO/REDO SYSTEM (skribbl.io style) =====
      function saveState() {
        // Save current state before making changes
        undoStack.push(JSON.parse(JSON.stringify(strokes)));
        // Limit undo stack size (skribbl.io typically has ~20 undos)
        if (undoStack.length > 20) {
          undoStack.shift();
        }
      }

      function undo() {
        if (undoStack.length > 0) {
          strokes = undoStack.pop() || [];
          redrawCanvas();
        }
      }

      function clearCanvas() {
        // Save state before clearing (so clear can be undone)
        saveState();
        strokes = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Restore white background after clearing
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // ===== DRAWING FUNCTIONS (skribbl.io exact logic) =====
      function startDrawing(e) {
        e.preventDefault();

        if (currentTool === 'pen') {
          isDrawing = true;
          const point = getCanvasPoint(e);

          // Save state for undo
          saveState();

          // Initialize points array for smooth drawing
          points = [point];
          lastDrawnPoint = point;

          // Start new stroke
          currentStroke = {
            color: currentColor,
            size: currentSize,
            points: []
          };

          // Draw initial dot for immediate feedback
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = currentSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.arc(point.x, point.y, currentSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = currentColor;
          ctx.fill();

        } else if (currentTool === 'bucket') {
          saveState();
          const point = getCanvasPoint(e);
          floodFill(point.x, point.y, currentColor);
        }
      }

      function continueDrawing(e) {
        if (!isDrawing || currentTool !== 'pen') return;
        e.preventDefault();

        const point = getCanvasPoint(e);

        // Skip points that are too close for performance
        if (lastDrawnPoint) {
          const distance = Math.sqrt(
            Math.pow(point.x - lastDrawnPoint.x, 2) + Math.pow(point.y - lastDrawnPoint.y, 2)
          );
          if (distance < 2) return;
        }

        points.push(point);

        // Draw incremental smooth line from last point to current point
        if (points.length >= 2) {
          drawIncrementalStroke();
        }

        lastDrawnPoint = point;
      }

      function stopDrawing(e) {
        if (!isDrawing || currentTool !== 'pen') return;
        e.preventDefault();

        isDrawing = false;

        // Save the stroke as-is (already drawn incrementally)
        if (points.length > 0) {
          currentStroke.points = [...points]; // Save the raw points
          strokes.push(currentStroke);
        }

        // Reset drawing state
        points = [];
        currentStroke = null;
        lastDrawnPoint = null;
      }

      // ===== SMOOTH DRAWING HELPER FUNCTIONS =====

      // Draw incremental smooth stroke without redrawing everything
      function drawIncrementalStroke() {
        if (points.length < 2) return;

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (points.length === 2) {
          // First segment - draw simple line
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
          ctx.stroke();
        } else if (points.length >= 3) {
          // Draw smooth curve from the last 3 points
          const len = points.length;
          const p1 = points[len - 3];
          const p2 = points[len - 2];
          const p3 = points[len - 1];

          // Calculate control points for smooth curve
          const cp1x = p1.x + (p2.x - p1.x) * 0.5;
          const cp1y = p1.y + (p2.y - p1.y) * 0.5;
          const cp2x = p2.x + (p3.x - p2.x) * 0.5;
          const cp2y = p2.y + (p3.y - p2.y) * 0.5;

          ctx.beginPath();
          ctx.moveTo(cp1x, cp1y);
          ctx.quadraticCurveTo(p2.x, p2.y, cp2x, cp2y);
          ctx.stroke();
        }
      }

      // Smooth points using simple averaging
      function smoothPoints(inputPoints) {
        if (inputPoints.length <= 2) return inputPoints;

        const smoothed = [inputPoints[0]];

        // Apply simple smoothing
        for (let i = 1; i < inputPoints.length - 1; i++) {
          const prev = inputPoints[i - 1];
          const curr = inputPoints[i];
          const next = inputPoints[i + 1];

          const smoothedPoint = {
            x: curr.x * 0.6 + (prev.x + next.x) * 0.2,
            y: curr.y * 0.6 + (prev.y + next.y) * 0.2
          };

          smoothed.push(smoothedPoint);
        }

        smoothed.push(inputPoints[inputPoints.length - 1]);
        return smoothed;
      }

      // ===== REDRAW FUNCTION (recreate strokes as drawn) =====
      function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill canvas with white background to make paint bucket visible
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw all strokes exactly as they were drawn
        strokes.forEach(stroke => {
          if (stroke.points.length === 1) {
            // Single point - draw as dot
            ctx.beginPath();
            ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = stroke.color;
            ctx.fill();
          } else if (stroke.points.length >= 2) {
            // Recreate the stroke as it was drawn incrementally
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Redraw the stroke incrementally to match original drawing
            for (let i = 1; i < stroke.points.length; i++) {
              if (i === 1) {
                // First segment - simple line
                ctx.beginPath();
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
                ctx.stroke();
              } else {
                // Subsequent segments - smooth curves
                const p1 = stroke.points[i - 2];
                const p2 = stroke.points[i - 1];
                const p3 = stroke.points[i];

                const cp1x = p1.x + (p2.x - p1.x) * 0.5;
                const cp1y = p1.y + (p2.y - p1.y) * 0.5;
                const cp2x = p2.x + (p3.x - p2.x) * 0.5;
                const cp2y = p2.y + (p3.y - p2.y) * 0.5;

                ctx.beginPath();
                ctx.moveTo(cp1x, cp1y);
                ctx.quadraticCurveTo(p2.x, p2.y, cp2x, cp2y);
                ctx.stroke();
              }
            }
          }
        });
      }

      // Enhanced flood fill algorithm with tolerance for anti-aliased edges
      function floodFill(clickX, clickY, targetColor) {
        // Handle high-DPI displays by converting coordinates with better precision
        const deviceRatio = window.devicePixelRatio || 1;
        const actualX = Math.round(clickX * deviceRatio);
        const actualY = Math.round(clickY * deviceRatio);

        // Get current canvas pixel data
        const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const width = canvas.width;
        const height = canvas.height;

        // Boundary check
        if (actualX < 0 || actualX >= width || actualY < 0 || actualY >= height) {
          return;
        }

        // Get starting pixel color values
        const initialPos = (actualY * width + actualX) * 4;
        const originalRed = canvasData.data[initialPos];
        const originalGreen = canvasData.data[initialPos + 1];
        const originalBlue = canvasData.data[initialPos + 2];
        const originalAlpha = canvasData.data[initialPos + 3];

        // Parse target fill color
        const targetRgb = hexToRgb(targetColor);
        if (!targetRgb) return;

        const newRed = targetRgb.r;
        const newGreen = targetRgb.g;
        const newBlue = targetRgb.b;

        // Skip if already the target color (with tolerance)
        if (colorDistance(originalRed, originalGreen, originalBlue, newRed, newGreen, newBlue) < 5) {
          return;
        }

        // More aggressive tolerance for anti-aliased edges
        const FILL_TOLERANCE = 35;
        const STROKE_THRESHOLD = 60; // Brightness threshold for stroke detection

        // Helper: Calculate color distance between two RGB colors
        function colorDistance(r1, g1, b1, r2, g2, b2) {
          return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
        }

        // Helper: Check if pixel is a definite stroke (very conservative)
        function isStrokePixel(red, green, blue, alpha) {
          // Only consider very dark pixels as definite strokes
          // This allows anti-aliased gray pixels to be filled
          const brightness = (red + green + blue) / 3;
          return brightness < STROKE_THRESHOLD && alpha > 128;
        }

        // Don't fill if clicking directly on a stroke
        if (isStrokePixel(originalRed, originalGreen, originalBlue, originalAlpha)) {
          return;
        }

        // Helper: Check if pixel should be filled with tolerance
        function shouldFillPixel(position) {
          if (position < 0 || position >= canvasData.data.length - 3) return false;

          const red = canvasData.data[position];
          const green = canvasData.data[position + 1];
          const blue = canvasData.data[position + 2];
          const alpha = canvasData.data[position + 3];

          // Stop at stroke boundaries
          if (isStrokePixel(red, green, blue, alpha)) {
            return false;
          }

          // Fill if similar to original color (with tolerance)
          const distanceFromOriginal = colorDistance(red, green, blue, originalRed, originalGreen, originalBlue);
          if (distanceFromOriginal <= FILL_TOLERANCE) {
            return true;
          }

          // Don't fill if already close to target color
          const distanceFromTarget = colorDistance(red, green, blue, newRed, newGreen, newBlue);
          if (distanceFromTarget <= FILL_TOLERANCE) {
            return false;
          }

          return false;
        }

        // Helper: Fill a single pixel
        function fillPixel(position) {
          if (position < 0 || position >= canvasData.data.length - 3) return;
          canvasData.data[position] = newRed;
          canvasData.data[position + 1] = newGreen;
          canvasData.data[position + 2] = newBlue;
          canvasData.data[position + 3] = 255;
        }

        // Scanline flood fill algorithm
        const fillQueue = [[actualX, actualY]];

        while (fillQueue.length > 0) {
          const currentPoint = fillQueue.pop();
          let currentX = currentPoint[0];
          let currentY = currentPoint[1];

          let currentPos = (currentY * width + currentX) * 4;

          // Find top of fillable column
          while (currentY >= 0 && shouldFillPixel(currentPos)) {
            currentY--;
            currentPos -= width * 4;
          }
          currentPos += width * 4;
          currentY++;

          let leftReached = false;
          let rightReached = false;

          // Fill downward and check horizontally
          while (currentY < height && shouldFillPixel(currentPos)) {
            fillPixel(currentPos);

            // Check left neighbor
            if (currentX > 0) {
              if (shouldFillPixel(currentPos - 4)) {
                if (!leftReached) {
                  fillQueue.push([currentX - 1, currentY]);
                  leftReached = true;
                }
              } else if (leftReached) {
                leftReached = false;
              }
            }

            // Check right neighbor
            if (currentX < width - 1) {
              if (shouldFillPixel(currentPos + 4)) {
                if (!rightReached) {
                  fillQueue.push([currentX + 1, currentY]);
                  rightReached = true;
                }
              } else if (rightReached) {
                rightReached = false;
              }
            }

            currentY++;
            currentPos += width * 4;
          }
        }

        // Post-processing: Fill remaining anti-aliased edge pixels
        fillAntiAliasedEdges(canvasData, width, height, newRed, newGreen, newBlue);

        // Apply changes to canvas
        ctx.putImageData(canvasData, 0, 0);
      }

      // Helper function to fill remaining anti-aliased edge pixels
      function fillAntiAliasedEdges(imageData, width, height, fillR, fillG, fillB) {
        const data = imageData.data;
        const EDGE_TOLERANCE = 50;

        // Find pixels that are adjacent to filled areas and could be anti-aliased edges
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const pos = (y * width + x) * 4;
            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            const a = data[pos + 3];

            // Skip if already filled or is a definite stroke
            if ((r === fillR && g === fillG && b === fillB) ||
                (r + g + b) / 3 < 40) {
              continue;
            }

            // Check if this pixel is surrounded by filled pixels
            let filledNeighbors = 0;
            const neighbors = [
              [-1, -1], [-1, 0], [-1, 1],
              [0, -1],           [0, 1],
              [1, -1],  [1, 0],  [1, 1]
            ];

            for (const [dx, dy] of neighbors) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nPos = (ny * width + nx) * 4;
                const nr = data[nPos];
                const ng = data[nPos + 1];
                const nb = data[nPos + 2];

                if (nr === fillR && ng === fillG && nb === fillB) {
                  filledNeighbors++;
                }
              }
            }

            // If most neighbors are filled and this looks like an edge pixel, fill it
            if (filledNeighbors >= 4 && (r + g + b) / 3 > 40 && (r + g + b) / 3 < 200) {
              data[pos] = fillR;
              data[pos + 1] = fillG;
              data[pos + 2] = fillB;
              data[pos + 3] = 255;
            }
          }
        }
      }

      function hexToRgb(hex) {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }

      // ===== UPDATE FUNCTIONS =====
      function updateDrawingProperties(tool, color, size) {
        currentTool = tool;
        currentColor = color;
        currentSize = size;
      }

      function updateTheme(backgroundColor) {
        // Update canvas background color
        document.body.style.backgroundColor = backgroundColor;
        const canvas = document.getElementById('canvas');
        if (canvas) {
          canvas.style.backgroundColor = backgroundColor;
        }
      }

      // ===== EVENT LISTENERS =====
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', continueDrawing);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);

      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', continueDrawing, { passive: false });
      canvas.addEventListener('touchend', stopDrawing, { passive: false });
      canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

      window.addEventListener('resize', resizeCanvas);

      // ===== INITIALIZATION =====
      resizeCanvas();

      // Expose functions for external control
      window.canvasUndo = undo;
      window.canvasClear = clearCanvas;
    </script>
  </body>
  </html>
`;

/**
 * HTML5 Canvas component for Drawing Battle with full drawing functionality
 */
const DrawingCanvas = React.forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
  currentTool = 'pen',
  currentColor = '#000000', // skribbl.io default black
  currentSize = 5, // skribbl.io default size
  onUndo,
  onClear,
}, ref) => {
  const { theme, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  // Update drawing properties when they change
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (typeof updateDrawingProperties === 'function') {
          updateDrawingProperties('${currentTool}', '${currentColor}', ${currentSize});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [currentTool, currentColor, currentSize]);

  // Update theme when it changes without reloading WebView
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (typeof updateTheme === 'function') {
          updateTheme('${theme.canvasBackground}');
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [theme.canvasBackground]);

  // Initialize canvas with current values when WebView loads
  const handleWebViewLoad = () => {
    if (webViewRef.current) {
      // Initialize with current props
      const initScript = `
        if (typeof updateDrawingProperties === 'function') {
          updateDrawingProperties('${currentTool}', '${currentColor}', ${currentSize});
        }
        if (typeof updateTheme === 'function') {
          updateTheme('${theme.canvasBackground}');
        }
        true;
      `;
      webViewRef.current.injectJavaScript(initScript);
    }
  };

  // Expose undo and clear functions to parent
  React.useImperativeHandle(ref, () => ({
    undo: () => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (typeof undo === 'function') {
            undo();
          }
          true;
        `);
      }
    },
    clear: () => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (typeof clearCanvas === 'function') {
            clearCanvas();
          }
          true;
        `);
      }
    }
  }));



  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: HTML_CONTENT }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLoad={handleWebViewLoad}
        onMessage={(event) => {
          // Handle messages from WebView if needed
        }}
      />
    </View>
  );
});

// Add display name for debugging
DrawingCanvas.displayName = 'DrawingCanvas';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default DrawingCanvas;
