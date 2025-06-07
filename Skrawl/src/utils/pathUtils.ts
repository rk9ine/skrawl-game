import { Skia } from '@shopify/react-native-skia';
import { generateUUID } from './uuidUtils';
import { NetworkPath, NetworkPoint, Point } from '../types/drawing';

/**
 * Converts an array of points to a network-friendly path
 * @param points Array of points to convert
 * @param playerId ID of the player who created the path
 * @param playerName Name of the player who created the path
 * @param color Color of the path
 * @param strokeWidth Width of the stroke
 * @returns A network-friendly path object
 */
export const pointsToNetworkPath = (
  points: Point[],
  playerId: string,
  playerName: string,
  color: string,
  strokeWidth: number
): NetworkPath => {
  // Convert points to network points
  const networkPoints: NetworkPoint[] = points.map((point, index) => ({
    x: point.x,
    y: point.y,
    t: Date.now() + index // Add a timestamp for each point
  }));

  return {
    id: generateUUID(), // Generate a unique ID for the path
    playerId,
    playerName,
    points: networkPoints,
    color,
    strokeWidth,
    timestamp: Date.now()
  };
};

/**
 * Converts a network path to an SVG path string
 * @param networkPath The network path to convert
 * @returns An SVG path string
 */
export const networkPathToSvgPath = (networkPath: NetworkPath): string => {
  if (networkPath.points.length === 0) {
    return '';
  }

  // Start the path at the first point
  let svgPath = `M${networkPath.points[0].x},${networkPath.points[0].y}`;

  // Add line segments to each subsequent point
  for (let i = 1; i < networkPath.points.length; i++) {
    svgPath += ` L${networkPath.points[i].x},${networkPath.points[i].y}`;
  }

  return svgPath;
};

/**
 * Creates a smooth SVG path from a network path using quadratic curves
 * @param networkPath The network path to convert
 * @returns A smooth SVG path string
 */
export const networkPathToSmoothSvgPath = (networkPath: NetworkPath): string => {
  const points = networkPath.points;

  if (points.length < 2) {
    return points.length === 1 ? `M${points[0].x},${points[0].y}` : '';
  }

  // Start the path at the first point
  let svgPath = `M${points[0].x},${points[0].y}`;

  // Use quadratic curves for smoother lines
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    svgPath += ` Q${points[i].x},${points[i].y} ${xc},${yc}`;
  }

  // Add the last point
  const lastPoint = points[points.length - 1];
  svgPath += ` L${lastPoint.x},${lastPoint.y}`;

  return svgPath;
};

/**
 * Converts a network path to a Skia path
 * @param networkPath The network path to convert
 * @returns A Skia path object
 */
export const networkPathToSkiaPath = (networkPath: NetworkPath) => {
  const path = Skia.Path.Make();
  const points = networkPath.points;

  if (points.length === 0) {
    return path;
  }

  // Move to the first point
  path.moveTo(points[0].x, points[0].y);

  // Add line segments to each subsequent point
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }

  return path;
};

/**
 * Creates a smooth Skia path from a network path using quadratic curves
 * @param networkPath The network path to convert
 * @returns A smooth Skia path object
 */
export const networkPathToSmoothSkiaPath = (networkPath: NetworkPath) => {
  const path = Skia.Path.Make();
  const points = networkPath.points;

  if (points.length < 2) {
    if (points.length === 1) {
      path.moveTo(points[0].x, points[0].y);
    }
    return path;
  }

  // Move to the first point
  path.moveTo(points[0].x, points[0].y);

  // Use quadratic curves for smoother lines
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    path.quadTo(points[i].x, points[i].y, xc, yc);
  }

  // Add the last point
  const lastPoint = points[points.length - 1];
  path.lineTo(lastPoint.x, lastPoint.y);

  return path;
};

/**
 * Simplifies a network path by reducing the number of points
 * This is useful for reducing the amount of data sent over the network
 * @param networkPath The network path to simplify
 * @param tolerance The tolerance for simplification (higher = more simplification)
 * @returns A simplified network path
 */
export const simplifyNetworkPath = (
  networkPath: NetworkPath,
  tolerance: number = 1.0
): NetworkPath => {
  // If the path has fewer than 3 points, no simplification is needed
  if (networkPath.points.length < 3) {
    return networkPath;
  }

  // Implementation of the Ramer-Douglas-Peucker algorithm
  const simplifyPoints = (points: NetworkPoint[], start: number, end: number, epsilon: number): NetworkPoint[] => {
    // Find the point with the maximum distance
    let maxDistance = 0;
    let maxIndex = 0;

    const startPoint = points[start];
    const endPoint = points[end];

    for (let i = start + 1; i < end; i++) {
      const distance = perpendicularDistance(points[i], startPoint, endPoint);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If the maximum distance is greater than epsilon, recursively simplify
    if (maxDistance > epsilon) {
      const results1 = simplifyPoints(points, start, maxIndex, epsilon);
      const results2 = simplifyPoints(points, maxIndex, end, epsilon);

      // Combine the results
      return [...results1.slice(0, -1), ...results2];
    } else {
      // Return just the endpoints
      return [points[start], points[end]];
    }
  };

  // Calculate the perpendicular distance from a point to a line
  const perpendicularDistance = (point: NetworkPoint, lineStart: NetworkPoint, lineEnd: NetworkPoint): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    // If the line is just a point, return the distance to that point
    if (dx === 0 && dy === 0) {
      const d1 = point.x - lineStart.x;
      const d2 = point.y - lineStart.y;
      return Math.sqrt(d1 * d1 + d2 * d2);
    }

    // Calculate the perpendicular distance
    const norm = Math.sqrt(dx * dx + dy * dy);
    return Math.abs((point.x - lineStart.x) * dy - (point.y - lineStart.y) * dx) / norm;
  };

  // Simplify the points
  const simplifiedPoints = simplifyPoints(
    networkPath.points,
    0,
    networkPath.points.length - 1,
    tolerance
  );

  // Return a new network path with the simplified points
  return {
    ...networkPath,
    points: simplifiedPoints
  };
};
