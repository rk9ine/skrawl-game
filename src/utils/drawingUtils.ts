import { Point, StrokePoint } from '../types';

/**
 * Calculates the distance between two points
 */
export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculates the angle between two points in radians
 */
export const angle = (p1: Point, p2: Point): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Creates a point at a specific distance and angle from another point
 */
export const pointAtDistanceAndAngle = (
  point: Point,
  distance: number,
  angle: number
): Point => {
  return {
    x: point.x + distance * Math.cos(angle),
    y: point.y + distance * Math.sin(angle),
  };
};

/**
 * Applies Catmull-Rom spline interpolation to smooth a path
 * This creates a smooth curve through a series of points
 */
export const catmullRomInterpolation = (
  points: Point[],
  tension: number = 0.5
): Point[] => {
  if (points.length < 3) return points;

  const result: Point[] = [];

  // Add the first point
  result.push(points[0]);

  // For each set of 4 consecutive points, calculate the interpolated points
  for (let i = 0; i < points.length - 2; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    // Number of segments to create between p1 and p2
    const segments = Math.max(2, Math.ceil(distance(p1, p2) / 5));

    for (let t = 1; t < segments; t++) {
      const t1 = t / segments;

      // Catmull-Rom spline formula
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t1 +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t1 * t1 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t1 * t1 * t1
      );

      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t1 +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t1 * t1 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t1 * t1 * t1
      );

      result.push({ x, y });
    }

    // Add the end point of this segment
    if (i === points.length - 3) {
      result.push(points[points.length - 1]);
    }
  }

  return result;
};

/**
 * Applies cubic Bezier curve interpolation between points
 * This creates smooth curves between points
 */
export const bezierInterpolation = (points: Point[]): Point[] => {
  if (points.length < 3) return points;

  const result: Point[] = [];
  result.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];

    // Calculate control points
    const controlPoint1 = {
      x: p0.x + (p1.x - p0.x) * 0.5,
      y: p0.y + (p1.y - p0.y) * 0.5
    };

    const controlPoint2 = {
      x: p1.x + (p2.x - p1.x) * 0.5,
      y: p1.y + (p2.y - p1.y) * 0.5
    };

    // Add the current point
    result.push(p1);

    // Add bezier curve command
    result.push({
      x: controlPoint1.x,
      y: controlPoint1.y,
      isBezierControl: true
    } as any);

    result.push({
      x: controlPoint2.x,
      y: controlPoint2.y,
      isBezierControl: true
    } as any);
  }

  // Add the last point
  result.push(points[points.length - 1]);

  return result;
};

/**
 * Applies velocity-based smoothing to a path
 * Faster strokes have less smoothing, slower strokes have more
 */
export const velocitySmoothing = (
  points: StrokePoint[],
  minSmoothing: number = 0.2,
  maxSmoothing: number = 0.8
): Point[] => {
  if (points.length < 3) return points;

  const result: Point[] = [];
  result.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    // Calculate velocity (distance / time)
    const velocity = distance(prev, current) / Math.max(1, current.time - prev.time);

    // Normalize velocity to a value between 0 and 1
    // Higher velocity = less smoothing
    const normalizedVelocity = Math.min(1, velocity / 10);

    // Calculate smoothing factor (inverse of velocity)
    // Fast strokes = less smoothing, slow strokes = more smoothing
    const smoothingFactor = minSmoothing + (maxSmoothing - minSmoothing) * (1 - normalizedVelocity);

    // Apply smoothing
    const smoothedPoint = {
      x: current.x * (1 - smoothingFactor) + (prev.x + next.x) / 2 * smoothingFactor,
      y: current.y * (1 - smoothingFactor) + (prev.y + next.y) / 2 * smoothingFactor
    };

    result.push(smoothedPoint);
  }

  result.push(points[points.length - 1]);

  return result;
};

/**
 * Applies input stabilization to reduce hand tremor
 * Uses a weighted average of recent points
 */
export const stabilizeInput = (
  points: Point[],
  windowSize: number = 3,
  weight: number = 0.5
): Point[] => {
  if (points.length <= windowSize) return points;

  const result: Point[] = [];

  // Add initial points that can't be smoothed
  for (let i = 0; i < windowSize - 1; i++) {
    result.push(points[i]);
  }

  // Process remaining points with a sliding window
  for (let i = windowSize - 1; i < points.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let sumWeights = 0;

    // Calculate weighted average of points in the window
    for (let j = 0; j < windowSize; j++) {
      const point = points[i - j];
      const pointWeight = Math.pow(weight, j); // Exponential decay of weight

      sumX += point.x * pointWeight;
      sumY += point.y * pointWeight;
      sumWeights += pointWeight;
    }

    // Add stabilized point
    result.push({
      x: sumX / sumWeights,
      y: sumY / sumWeights
    });
  }

  return result;
};

/**
 * Converts an array of points to an SVG path string
 * Ensures all values are properly formatted to avoid parsing errors
 */
export const pointsToSvgPath = (points: Point[]): string => {
  if (points.length === 0) return '';

  // Format numbers to ensure they're valid
  const formatNumber = (num: number): string => {
    // Ensure the number is finite and valid
    if (!isFinite(num)) return "0";

    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round(num * 100) / 100 + "";
  };

  // Start with the first point
  const firstX = formatNumber(points[0].x);
  const firstY = formatNumber(points[0].y);
  let path = `M${firstX},${firstY}`;

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const prevPoint = points[i - 1];
    const nextPoint = i < points.length - 1 ? points[i + 1] : point;

    // Format current point coordinates
    const x = formatNumber(point.x);
    const y = formatNumber(point.y);

    // Check if this is a bezier control point
    if ((point as any).isBezierControl && (prevPoint as any).isBezierControl) {
      // This is the second control point, followed by the actual point
      const nextX = formatNumber(nextPoint.x);
      const nextY = formatNumber(nextPoint.y);
      path += ` ${nextX},${nextY}`;
      i++; // Skip the next point as we've already used it
    } else if ((point as any).isBezierControl) {
      // This is the first control point
      path += ` C${x},${y}`;
    } else {
      // Regular point
      path += ` L${x},${y}`;
    }
  }

  return path;
};
