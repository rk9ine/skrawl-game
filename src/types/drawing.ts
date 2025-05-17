/**
 * Basic point interface with x and y coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Drawing path with additional properties for rendering
 */
export interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
}
