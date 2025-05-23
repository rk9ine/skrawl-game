import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';

const HTML5CanvasTestScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [webViewKey, setWebViewKey] = useState(0);

  // Force WebView to reload when theme changes
  useEffect(() => {
    setWebViewKey(prev => prev + 1);
  }, [isDark]);

  // Debug logging
  console.log('HTML5CanvasTestScreen - Current theme:', {
    isDark,
    canvasBackground: theme.canvasBackground,
    surface: theme.surface,
    text: theme.text
  });

  // Optimized HTML5 Canvas for skribbl.io-style drawing
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Optimized HTML5 Canvas Drawing</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          touch-action: none;
          background-color: #FFFFFF;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile */
        }

        #canvas {
          display: block;
          width: 100vw;
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile */
          touch-action: none;
          cursor: crosshair;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1;
        }

        #toolbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: ${theme.surface};
          border-top: 1px solid ${theme.border};
          padding: 8px;
          padding-bottom: max(8px, env(safe-area-inset-bottom));
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 1000;
          box-sizing: border-box;
        }

        .tool-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: ${theme.backgroundAlt};
          color: ${theme.text};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s;
        }

        .tool-btn:hover {
          background: ${theme.primary};
          color: white;
        }

        .tool-btn.active {
          background: ${theme.primary};
          color: white;
        }

        .color-btn {
          width: 30px;
          height: 30px;
          border: 2px solid ${theme.border};
          border-radius: 6px;
          cursor: pointer;
          margin: 0 2px;
        }

        .color-btn.active {
          border-color: ${theme.primary};
          border-width: 3px;
        }

        .size-btn {
          width: 35px;
          height: 35px;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          background: ${theme.backgroundAlt};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 2px;
        }

        .size-btn.active {
          background: ${theme.primary};
          border-color: ${theme.primary};
        }

        .size-preview {
          background: ${theme.text};
          border-radius: 50%;
        }

        #colorPalette, #sizePalette {
          position: fixed;
          bottom: calc(60px + env(safe-area-inset-bottom));
          left: 50%;
          transform: translateX(-50%);
          background: ${theme.surface};
          border: 1px solid ${theme.border};
          border-radius: 12px;
          padding: 8px;
          display: none;
          flex-wrap: wrap;
          max-width: 300px;
          z-index: 1001;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          box-sizing: border-box;
        }

        #performance {
          position: fixed;
          top: max(10px, env(safe-area-inset-top));
          right: max(10px, env(safe-area-inset-right));
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          z-index: 1002;
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      <canvas id="canvas"></canvas>

      <!-- Performance Monitor -->
      <div id="performance">
        FPS: <span id="fps">0</span> |
        Strokes: <span id="strokeCount">0</span> |
        Points: <span id="pointCount">0</span>
      </div>

      <!-- Drawing Toolbar - Standard skribbl.io Layout -->
      <div id="toolbar">
        <button class="tool-btn active" id="penTool" title="Pen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </button>
        <button class="tool-btn" id="bucketTool" title="Paint Bucket">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/>
            <path d="m5 2 5 5"/>
            <path d="M2 13h15"/>
            <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>
          </svg>
        </button>
        <button class="tool-btn" id="colorTool" title="Colors">
          <div class="color-preview" style="width: 20px; height: 20px; border-radius: 4px; border: 2px solid currentColor;"></div>
        </button>
        <button class="tool-btn" id="sizeTool" title="Brush Size">
          <div class="size-preview" style="width: 12px; height: 12px; border-radius: 50%; background: currentColor;"></div>
        </button>
        <button class="tool-btn" id="undoTool" title="Undo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"/>
            <path d="m21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
          </svg>
        </button>
        <button class="tool-btn" id="clearTool" title="Clear">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>

      <!-- Color Palette -->
      <div id="colorPalette"></div>

      <!-- Size Palette -->
      <div id="sizePalette"></div>

      <script>
        // Debug theme values
        console.log('WebView HTML - Theme values:', {
          canvasBackground: '${theme.canvasBackground}',
          surface: '${theme.surface}',
          text: '${theme.text}',
          isDark: ${isDark}
        });

        // ===== CANVAS SETUP =====
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', {
          alpha: true, // Enable alpha for transparent background
          desynchronized: true,
          willReadFrequently: false
        });

        // Performance monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 0;

        // ===== DRAWING STATE =====
        let isDrawing = false;
        let currentTool = 'pen';
        let currentColor = '#4361EE';
        let currentSize = 5;
        let points = [];
        let strokes = [];
        let undoStack = [];

        // Performance optimization
        let animationId = null;
        let needsRedraw = false;
        let redrawScheduled = false;

        // ===== COLORS AND SIZES =====
        const colors = [
          '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#ADFF2F',
          '#00FF00', '#00CED1', '#1E90FF', '#4169E1', '#8A2BE2',
          '#FF1493', '#FF69B4', '#8B4513', '#D2691E', '#32CD32',
          '#008080', '#4682B4', '#9370DB', '#000000', '#FFFFFF'
        ];

        const sizes = [2, 5, 10, 15, 20, 30];

        // ===== CANVAS UTILITIES =====
        function resizeCanvas() {
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;

          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;

          ctx.scale(dpr, dpr);
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';

          // Set drawing properties
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          redrawCanvas();
        }

        function getCanvasPoint(e) {
          const rect = canvas.getBoundingClientRect();
          const clientX = e.clientX || (e.touches && e.touches[0].clientX);
          const clientY = e.clientY || (e.touches && e.touches[0].clientY);

          return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            time: performance.now()
          };
        }

        // ===== SMOOTH DRAWING =====
        function smoothPath(points) {
          if (points.length < 3) return points;

          // First, reduce points by removing ones that are too close together
          const reducedPoints = reducePoints(points);

          if (reducedPoints.length < 3) return reducedPoints;

          const smoothed = [reducedPoints[0]];

          for (let i = 1; i < reducedPoints.length - 1; i++) {
            const prev = reducedPoints[i - 1];
            const curr = reducedPoints[i];
            const next = reducedPoints[i + 1];

            // Gentler smoothing for more natural curves
            const smoothingFactor = 0.2; // Reduced from complex calculation
            smoothed.push({
              x: curr.x * (1 - smoothingFactor) + (prev.x + next.x) * smoothingFactor * 0.5,
              y: curr.y * (1 - smoothingFactor) + (prev.y + next.y) * smoothingFactor * 0.5,
              time: curr.time
            });
          }

          smoothed.push(reducedPoints[reducedPoints.length - 1]);
          return smoothed;
        }

        function reducePoints(points) {
          if (points.length < 3) return points;

          const reduced = [points[0]];
          const minDistance = 1.0; // Further reduced for maximum smoothness

          for (let i = 1; i < points.length; i++) {
            const lastPoint = reduced[reduced.length - 1];
            const currentPoint = points[i];
            const distance = Math.sqrt(
              (currentPoint.x - lastPoint.x) ** 2 + (currentPoint.y - lastPoint.y) ** 2
            );

            if (distance >= minDistance || i === points.length - 1) {
              reduced.push(currentPoint);
            }
          }

          return reduced;
        }



        // ===== ENHANCED FLOOD FILL WITH ANTI-ALIASING SUPPORT =====
        function floodFill(startX, startY, fillColor) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const width = canvas.width;
          const height = canvas.height;

          const startPos = (Math.round(startY) * width + Math.round(startX)) * 4;
          const startR = data[startPos];
          const startG = data[startPos + 1];
          const startB = data[startPos + 2];
          const startA = data[startPos + 3];

          // Convert fill color to RGB
          const fillRGB = hexToRgb(fillColor);
          if (!fillRGB) return;

          // More aggressive tolerance for anti-aliased edges
          const FILL_TOLERANCE = 35;
          const STROKE_THRESHOLD = 60; // Brightness threshold for stroke detection

          // Helper: Calculate color distance between two RGB colors
          function colorDistance(r1, g1, b1, r2, g2, b2) {
            return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
          }

          // Check if we're trying to fill with the same color (with tolerance)
          if (colorDistance(startR, startG, startB, fillRGB.r, fillRGB.g, fillRGB.b) < 5) return;

          // Helper: Check if pixel is a definite stroke (very conservative)
          function isStrokePixel(red, green, blue, alpha) {
            // Only consider very dark pixels as definite strokes
            // This allows anti-aliased gray pixels to be filled
            const brightness = (red + green + blue) / 3;
            return brightness < STROKE_THRESHOLD && alpha > 128;
          }

          // Don't fill if clicking directly on a stroke
          if (isStrokePixel(startR, startG, startB, startA)) {
            console.log('Clicked on stroke pixel, aborting fill');
            return;
          }

          console.log('Flood fill starting at:', { x: startX, y: startY });
          console.log('Start pixel color:', { r: startR, g: startG, b: startB, a: startA });
          console.log('Fill color:', fillRGB);

          // Enhanced flood fill algorithm with tolerance
          const stack = [[Math.round(startX), Math.round(startY)]];
          const visited = new Set();
          let filledPixels = 0;

          // Function to check if a pixel should be filled with tolerance
          function shouldFill(x, y) {
            if (x < 0 || x >= width || y < 0 || y >= height) return false;

            const pos = (y * width + x) * 4;
            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            const a = data[pos + 3];

            // Stop at stroke boundaries
            if (isStrokePixel(r, g, b, a)) {
              return false;
            }

            // Fill if similar to original color (with tolerance)
            const distanceFromOriginal = colorDistance(r, g, b, startR, startG, startB);
            if (distanceFromOriginal <= FILL_TOLERANCE) {
              return true;
            }

            // Don't fill if already close to target color
            const distanceFromTarget = colorDistance(r, g, b, fillRGB.r, fillRGB.g, fillRGB.b);
            if (distanceFromTarget <= FILL_TOLERANCE) {
              return false;
            }

            return false;
          }

          while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = y * width + x;

            if (visited.has(key) || !shouldFill(x, y)) continue;

            visited.add(key);
            filledPixels++;

            // Fill this pixel
            const pos = (y * width + x) * 4;
            data[pos] = fillRGB.r;
            data[pos + 1] = fillRGB.g;
            data[pos + 2] = fillRGB.b;
            data[pos + 3] = 255;

            // Add neighbors to stack
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
          }

          console.log('Filled pixels:', filledPixels);

          // Post-processing: Fill remaining anti-aliased edge pixels
          fillAntiAliasedEdges(data, width, height, fillRGB.r, fillRGB.g, fillRGB.b);

          ctx.putImageData(imageData, 0, 0);
        }

        // Helper function to fill remaining anti-aliased edge pixels
        function fillAntiAliasedEdges(data, width, height, fillR, fillG, fillB) {
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

        // ===== STATE MANAGEMENT =====
        function saveState() {
          // Save canvas image data for reliable undo
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          undoStack.push({
            imageData: imageData,
            strokes: JSON.parse(JSON.stringify(strokes))
          });

          // Limit undo stack size for memory management
          if (undoStack.length > 20) {
            undoStack.shift();
          }
        }

        function undo() {
          // Standard skribbl.io behavior: Remove only the last stroke
          if (strokes.length > 0) {
            // Save current state before undo (for potential redo in future)
            saveState();

            // Remove the last stroke
            strokes.pop();

            // Redraw canvas without the last stroke
            redrawCanvas();
            updatePerformanceStats();
          }
        }



        function clearCanvas() {
          // Save current state before clearing
          saveState();

          // Clear everything
          strokes = [];
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          updatePerformanceStats();
        }

        // ===== DRAWING FUNCTIONS =====
        function startDrawing(e) {
          e.preventDefault();

          if (currentTool === 'pen') {
            isDrawing = true;
            const point = getCanvasPoint(e);
            points = [point];

            // Set up drawing properties
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw a small dot for single taps
            drawDot(point.x, point.y);
          } else if (currentTool === 'bucket') {
            // Save state before flood fill
            saveState();
            const point = getCanvasPoint(e);
            floodFill(point.x, point.y, currentColor);
          }
        }

        function draw(e) {
          if (!isDrawing || currentTool !== 'pen') return;
          e.preventDefault();

          const point = getCanvasPoint(e);
          points.push(point);

          // Draw smooth preview every few points for optimal balance of smoothness and performance
          if (points.length % 2 === 0 && points.length > 1) {
            drawSmoothPreview();
          }
        }

        function drawSmoothPreview() {
          if (points.length < 2) return;

          // Use requestAnimationFrame for smooth performance
          if (!redrawScheduled) {
            redrawScheduled = true;
            requestAnimationFrame(() => {
              // Clear canvas and redraw all completed strokes for perfect smoothness
              redrawCanvas();

              // Draw current stroke preview with full smoothing
              if (points.length >= 3) {
                const smoothedPoints = smoothPath(points);
                drawSmoothStroke(smoothedPoints, currentColor, currentSize);
              } else if (points.length >= 2) {
                // For just two points, draw a simple line
                drawSmoothStroke(points, currentColor, currentSize);
              }

              redrawScheduled = false;
            });
          }
        }

        function stopDrawing(e) {
          if (!isDrawing) return;
          e.preventDefault();

          isDrawing = false;

          // Save state before adding new stroke (for undo functionality)
          saveState();

          if (points.length === 1) {
            // Single tap - save as a dot stroke
            strokes.push({
              points: points,
              color: currentColor,
              size: currentSize,
              tool: currentTool,
              isDot: true
            });
          } else if (points.length > 1) {
            // Multiple points - smooth the stroke and save it
            const smoothedPoints = smoothPath(points);

            // Save the stroke
            strokes.push({
              points: smoothedPoints,
              color: currentColor,
              size: currentSize,
              tool: currentTool,
              isDot: false
            });

            // Final redraw to ensure perfect smoothness
            redrawCanvas();
          }

          points = [];
          updatePerformanceStats();
        }

        function drawDot(x, y) {
          ctx.beginPath();
          ctx.arc(x, y, currentSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = currentColor;
          ctx.fill();
        }



        function drawSmoothStroke(points, color, size) {
          if (points.length < 2) return;

          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();

          if (points.length === 2) {
            // For just two points, draw a simple line
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
          } else {
            // Use Catmull-Rom spline for smoother curves
            ctx.moveTo(points[0].x, points[0].y);

            // For the first segment, use quadratic curve
            if (points.length > 2) {
              const cp1x = (points[0].x + points[1].x) / 2;
              const cp1y = (points[0].y + points[1].y) / 2;
              ctx.quadraticCurveTo(cp1x, cp1y, points[1].x, points[1].y);
            }

            // For middle segments, use bezier curves for maximum smoothness
            for (let i = 1; i < points.length - 2; i++) {
              const p0 = points[i - 1];
              const p1 = points[i];
              const p2 = points[i + 1];
              const p3 = points[i + 2];

              // Calculate control points for smooth Catmull-Rom spline
              const cp1x = p1.x + (p2.x - p0.x) / 6;
              const cp1y = p1.y + (p2.y - p0.y) / 6;
              const cp2x = p2.x - (p3.x - p1.x) / 6;
              const cp2y = p2.y - (p3.y - p1.y) / 6;

              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            }

            // For the last segment
            if (points.length > 2) {
              const lastIdx = points.length - 1;
              const cp2x = (points[lastIdx - 1].x + points[lastIdx].x) / 2;
              const cp2y = (points[lastIdx - 1].y + points[lastIdx].y) / 2;
              ctx.quadraticCurveTo(cp2x, cp2y, points[lastIdx].x, points[lastIdx].y);
            }
          }

          ctx.stroke();
        }

        function redrawCanvas() {
          // Clear canvas but don't fill with white - let it be transparent
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Redraw all completed strokes
          strokes.forEach(stroke => {
            if (stroke.isDot && stroke.points.length === 1) {
              // Draw dot
              const point = stroke.points[0];
              ctx.beginPath();
              ctx.arc(point.x, point.y, stroke.size / 2, 0, Math.PI * 2);
              ctx.fillStyle = stroke.color;
              ctx.fill();
            } else {
              // Draw smooth stroke
              drawSmoothStroke(stroke.points, stroke.color, stroke.size);
            }
          });
        }

        // ===== UI FUNCTIONS =====
        function initializeUI() {
          // Create color palette
          const colorPalette = document.getElementById('colorPalette');
          colors.forEach(color => {
            const colorBtn = document.createElement('div');
            colorBtn.className = 'color-btn';
            colorBtn.style.backgroundColor = color;
            colorBtn.onclick = () => selectColor(color);
            if (color === currentColor) colorBtn.classList.add('active');
            colorPalette.appendChild(colorBtn);
          });

          // Create size palette
          const sizePalette = document.getElementById('sizePalette');
          sizes.forEach(size => {
            const sizeBtn = document.createElement('div');
            sizeBtn.className = 'size-btn';
            if (size === currentSize) sizeBtn.classList.add('active');

            const preview = document.createElement('div');
            preview.className = 'size-preview';
            preview.style.width = Math.min(size, 20) + 'px';
            preview.style.height = Math.min(size, 20) + 'px';

            sizeBtn.appendChild(preview);
            sizeBtn.onclick = () => selectSize(size);
            sizePalette.appendChild(sizeBtn);
          });
        }

        function selectTool(tool) {
          currentTool = tool;

          // Update UI
          document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
          document.getElementById(tool + 'Tool').classList.add('active');

          // Update cursor based on tool
          if (tool === 'pen') {
            canvas.style.cursor = 'crosshair';
          } else if (tool === 'bucket') {
            canvas.style.cursor = 'pointer';
          } else {
            canvas.style.cursor = 'default';
          }

          // Hide palettes when switching tools
          hideColorPalette();
          hideSizePalette();
        }

        function selectColor(color) {
          currentColor = color;

          // Update UI
          document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
          event.target.classList.add('active');

          // Update color preview in toolbar
          const colorPreview = document.querySelector('.color-preview');
          if (colorPreview) {
            colorPreview.style.backgroundColor = color;
          }

          hideColorPalette();
        }

        function selectSize(size) {
          currentSize = size;

          // Update UI
          document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
          event.target.classList.add('active');

          // Update size preview in toolbar
          const sizePreview = document.querySelector('.size-preview');
          if (sizePreview) {
            const previewSize = Math.min(size, 20); // Cap at 20px for UI
            sizePreview.style.width = previewSize + 'px';
            sizePreview.style.height = previewSize + 'px';
          }

          hideSizePalette();
        }

        function toggleColorPalette() {
          const palette = document.getElementById('colorPalette');
          palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
          hideSizePalette();
        }

        function toggleSizePalette() {
          const palette = document.getElementById('sizePalette');
          palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
          hideColorPalette();
        }

        function hideColorPalette() {
          document.getElementById('colorPalette').style.display = 'none';
        }

        function hideSizePalette() {
          document.getElementById('sizePalette').style.display = 'none';
        }

        // ===== PERFORMANCE MONITORING =====
        function updatePerformanceStats() {
          const now = performance.now();
          frameCount++;

          if (now - lastTime >= 1000) {
            fps = Math.round((frameCount * 1000) / (now - lastTime));
            frameCount = 0;
            lastTime = now;

            document.getElementById('fps').textContent = fps;
          }

          document.getElementById('strokeCount').textContent = strokes.length;

          const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
          document.getElementById('pointCount').textContent = totalPoints;
        }

        // ===== EVENT LISTENERS =====
        function setupEventListeners() {
          // Canvas events
          canvas.addEventListener('mousedown', startDrawing);
          canvas.addEventListener('mousemove', draw);
          canvas.addEventListener('mouseup', stopDrawing);
          canvas.addEventListener('mouseout', stopDrawing);

          // Touch events
          canvas.addEventListener('touchstart', startDrawing, { passive: false });
          canvas.addEventListener('touchmove', draw, { passive: false });
          canvas.addEventListener('touchend', stopDrawing, { passive: false });
          canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

          // Tool buttons
          document.getElementById('penTool').onclick = () => selectTool('pen');
          document.getElementById('bucketTool').onclick = () => selectTool('bucket');
          document.getElementById('colorTool').onclick = toggleColorPalette;
          document.getElementById('sizeTool').onclick = toggleSizePalette;
          document.getElementById('undoTool').onclick = undo;
          document.getElementById('clearTool').onclick = clearCanvas;

          // Window events
          window.addEventListener('resize', resizeCanvas);

          // Hide palettes when clicking outside
          document.addEventListener('click', (e) => {
            if (!e.target.closest('#colorPalette') && !e.target.closest('#colorTool')) {
              hideColorPalette();
            }
            if (!e.target.closest('#sizePalette') && !e.target.closest('#sizeTool')) {
              hideSizePalette();
            }
          });
        }

        // ===== INITIALIZATION =====
        function init() {
          resizeCanvas();
          initializeUI();
          setupEventListeners();

          // Initialize toolbar previews
          const colorPreview = document.querySelector('.color-preview');
          if (colorPreview) {
            colorPreview.style.backgroundColor = currentColor;
          }

          const sizePreview = document.querySelector('.size-preview');
          if (sizePreview) {
            const previewSize = Math.min(currentSize, 20);
            sizePreview.style.width = previewSize + 'px';
            sizePreview.style.height = previewSize + 'px';
          }

          // Start performance monitoring (less frequent for better performance)
          setInterval(updatePerformanceStats, 500);

          console.log('Optimized HTML5 Canvas initialized successfully!');
        }

        // Start when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', init);
        } else {
          init();
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { backgroundColor: theme.canvasBackground }]}>
      {/* Canvas WebView - Full Screen */}
      <WebView
        key={webViewKey} // Force reload when theme changes
        ref={webViewRef}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.webView}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default HTML5CanvasTestScreen;