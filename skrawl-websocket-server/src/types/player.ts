/**
 * Player types for Skrawl mobile drawing game
 * Optimized for React Native clients
 */

export interface Player {
  id: string;                    // Supabase user ID
  socketId: string;              // Socket.io connection ID
  displayName: string;           // User's display name
  avatar?: PlayerAvatar;         // User's avatar data
  score: number;                 // Current game score
  totalScore: number;            // Total score across all rounds
  isReady: boolean;              // Ready status in lobby
  isDrawing: boolean;            // Currently drawing
  hasGuessed: boolean;           // Has guessed current word
  isConnected: boolean;          // Connection status
  joinedAt: Date;                // When player joined room
  lastActivity: Date;            // Last activity timestamp
  connectionQuality: ConnectionQuality; // Mobile connection info
}

export interface PlayerAvatar {
  type: 'gif' | 'icon' | 'custom';
  data: string;                  // GIF filename or icon name
  backgroundColor?: string;      // Background color for icons
}

export interface ConnectionQuality {
  latency: number;               // Round-trip time in ms
  packetLoss: number;            // Packet loss percentage
  connectionType: 'wifi' | 'cellular' | 'unknown';
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  correctGuesses: number;
  wordsDrawn: number;
  successfulDrawings: number;    // Drawings where others guessed
}

export interface PlayerJoinData {
  id: string;
  displayName: string;
  avatar?: PlayerAvatar;
  connectionInfo: {
    userAgent: string;
    platform: 'ios' | 'android';
    appVersion: string;
    deviceInfo?: string;
  };
}

export interface PlayerLeaveReason {
  type: 'disconnect' | 'kick' | 'leave' | 'timeout';
  reason?: string;
  timestamp: Date;
}

// Mobile-specific player events
export interface PlayerMobileEvent {
  playerId: string;
  eventType: 'background' | 'foreground' | 'network_change' | 'low_battery';
  timestamp: Date;
  data?: any;
}

// Rate limiting for mobile clients
export interface PlayerRateLimit {
  chatMessages: number;          // Messages sent in current minute
  drawingStrokes: number;        // Strokes sent in current second
  guesses: number;               // Guesses made in current minute
  lastReset: Date;
}

export interface PlayerSession {
  player: Player;
  rateLimit: PlayerRateLimit;
  mobileEvents: PlayerMobileEvent[];
  reconnectionAttempts: number;
  lastReconnection?: Date;
}
