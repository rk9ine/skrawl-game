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

/**
 * Network-friendly point interface with x and y coordinates
 * Optimized for transmission over the network
 */
export interface NetworkPoint {
  x: number;
  y: number;
  t?: number; // Optional timestamp for synchronization
}

/**
 * Network-friendly path data structure
 * Designed to be efficiently serialized and transmitted over the network
 */
export interface NetworkPath {
  id: string;           // Unique path identifier
  playerId: string;     // ID of the player who created this path
  playerName?: string;  // Optional player name for display purposes
  points: NetworkPoint[]; // Array of points that make up the path
  color: string;        // Color of the path
  strokeWidth: number;  // Width of the stroke
  timestamp: number;    // When the path was created
}

/**
 * Player information for drawing identification
 */
export interface DrawingPlayer {
  id: string;           // Unique player identifier
  name: string;         // Display name
  color?: string;       // Optional preferred color for this player's paths
  avatar?: string;      // Optional emoji avatar
  isActive: boolean;    // Whether the player is currently active
  isDrawing: boolean;   // Whether the player is currently drawing
}
