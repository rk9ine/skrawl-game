/**
 * Game state types for Skrawl mobile drawing game
 * Based on skribbl.io mechanics with mobile optimizations
 */

import { Player } from './player';

export interface GameSettings {
  maxPlayers: number;            // 2-8 for public, 2-20 for private
  rounds: number;                // Number of rounds (2-10)
  drawTime: number;              // Drawing time in seconds (30-240)
  language: string;              // Word list language
  hints: number;                 // Number of letter hints (0-5)
  wordMode: 'normal' | 'hidden' | 'combination';
  customWords?: string[];        // Custom word list for private games
  isPrivate: boolean;            // Private room flag
  allowMidGameJoin: boolean;     // Allow joining mid-game
}

export interface GameState {
  id: string;                    // Unique game ID
  roomId: string;                // Room identifier
  status: GameStatus;
  settings: GameSettings;
  players: Player[];
  hostId?: string;               // Host player ID (private games)
  currentRound: number;
  totalRounds: number;
  currentTurn?: TurnState;
  turnOrder: string[];           // Player IDs in turn order
  scores: { [playerId: string]: number };
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  lastActivity: Date;
}

export type GameStatus = 
  | 'waiting'                    // Lobby, waiting for players
  | 'starting'                   // Game is starting
  | 'word_selection'             // Current drawer selecting word
  | 'drawing'                    // Active drawing phase
  | 'turn_end'                   // Turn ending, showing results
  | 'round_end'                  // Round ending, showing scores
  | 'finished'                   // Game completed
  | 'paused'                     // Game paused (host left, etc.)
  | 'cancelled';                 // Game cancelled

export interface TurnState {
  drawerId: string;              // Current drawer's player ID
  word: string;                  // Secret word
  wordPattern: string;           // Display pattern "_____ ____"
  wordChoices?: string[];        // Word choices for drawer (during selection)
  timeRemaining: number;         // Seconds remaining
  totalTime: number;             // Total turn time
  startedAt: Date;
  guessedPlayers: Set<string>;   // Players who guessed correctly
  hints: WordHint[];             // Revealed letter hints
  nextHintAt?: Date;             // When next hint will be revealed
  canvasState: CanvasState;      // Current drawing state
}

export interface WordHint {
  position: number;              // Character position in word
  letter: string;                // Revealed letter
  revealedAt: Date;
}

export interface CanvasState {
  strokes: DrawingStroke[];      // All drawing strokes
  backgroundColor: string;       // Canvas background color
  lastModified: Date;
}

export interface DrawingStroke {
  id: string;                    // Unique stroke ID
  playerId: string;              // Who drew this stroke
  tool: DrawingTool;
  color: string;                 // Hex color
  size: number;                  // Brush size
  points: Point[];               // Stroke points
  timestamp: Date;
  // Mobile optimization: compressed data
  compressed?: boolean;          // If points are compressed
}

export type DrawingTool = 'pen' | 'bucket' | 'eraser';

export interface Point {
  x: number;
  y: number;
  pressure?: number;             // For pressure-sensitive devices
}

export interface TurnResult {
  drawerId: string;
  word: string;
  correctGuesses: GuessResult[];
  drawerScore: number;
  timeUsed: number;
  endReason: TurnEndReason;
}

export interface GuessResult {
  playerId: string;
  playerName: string;
  guessTime: number;             // Time when guessed (seconds into turn)
  score: number;                 // Points earned
  guessOrder: number;            // 1st, 2nd, 3rd, etc.
}

export type TurnEndReason = 
  | 'time_up'                    // Timer expired
  | 'all_guessed'                // All players guessed
  | 'drawer_left'                // Drawer disconnected
  | 'skipped'                    // Turn was skipped by vote
  | 'cancelled';                 // Game cancelled

export interface GameResult {
  gameId: string;
  finalScores: { [playerId: string]: number };
  winner?: string;               // Winner player ID (or undefined for tie)
  winners?: string[];            // Multiple winners in case of tie
  totalRounds: number;
  duration: number;              // Game duration in seconds
  endedAt: Date;
}

// Mobile-specific game events
export interface MobileGameEvent {
  type: 'network_lag' | 'app_background' | 'low_memory' | 'connection_lost';
  playerId: string;
  timestamp: Date;
  data?: any;
}

export interface GameMetrics {
  averageLatency: number;        // Average player latency
  packetLoss: number;            // Average packet loss
  reconnections: number;         // Total reconnections during game
  mobileEvents: MobileGameEvent[];
}
