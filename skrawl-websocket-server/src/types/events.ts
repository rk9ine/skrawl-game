/**
 * Socket.io event types for Skrawl mobile drawing game
 * Optimized for React Native WebSocket communication
 */

import { GameState, GameSettings, TurnState, DrawingStroke, TurnResult, GameResult } from './game';
import { Player, PlayerJoinData, PlayerMobileEvent } from './player';

// Client to Server Events
export interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void;
  
  // Room Management
  join_public_game: () => void;
  create_private_room: (settings: GameSettings) => void;
  join_private_room: (roomId: string) => void;
  leave_room: () => void;
  
  // Lobby Events
  lobby_chat: (message: string) => void;
  update_room_settings: (settings: Partial<GameSettings>) => void;
  start_game: () => void;
  player_ready: (ready: boolean) => void;
  
  // Game Events
  select_word: (word: string) => void;
  drawing_stroke: (stroke: DrawingStrokeData) => void;
  canvas_clear: () => void;
  canvas_undo: () => void;
  chat_message: (message: string) => void;
  guess_word: (guess: string) => void;
  
  // Mobile-specific events
  mobile_event: (event: PlayerMobileEvent) => void;
  connection_quality: (quality: ConnectionQualityData) => void;
  request_canvas_sync: () => void;
  
  // Moderation
  vote_kick: (playerId: string) => void;
  vote_skip: () => void;
  
  // Heartbeat for mobile connection monitoring
  ping: (timestamp: number) => void;
}

// Server to Client Events
export interface ServerToClientEvents {
  // Authentication
  authenticated: (success: boolean, error?: string) => void;
  
  // Room Events
  room_joined: (roomData: RoomJoinedData) => void;
  room_created: (roomData: RoomCreatedData) => void;
  player_joined: (player: Player) => void;
  player_left: (playerId: string, reason: string) => void;
  room_settings_updated: (settings: GameSettings) => void;
  
  // Lobby Events
  lobby_message: (message: LobbyMessage) => void;
  player_ready_changed: (playerId: string, ready: boolean) => void;
  
  // Game State Events
  game_starting: (gameState: GameState) => void;
  game_started: (gameState: GameState) => void;
  turn_starting: (turnState: TurnState) => void;
  turn_started: (turnState: TurnState) => void;
  word_selection: (choices: string[], timeLimit: number) => void;
  turn_ended: (result: TurnResult) => void;
  round_ended: (scores: { [playerId: string]: number }) => void;
  game_ended: (result: GameResult) => void;
  
  // Drawing Events
  drawing_stroke: (stroke: DrawingStroke) => void;
  canvas_cleared: () => void;
  canvas_state: (state: CanvasStateData) => void;
  
  // Chat Events
  chat_message: (message: ChatMessage) => void;
  player_guessed: (playerId: string, playerName: string) => void;
  correct_guess: (playerId: string, word: string) => void;
  
  // Timer Events
  timer_update: (timeRemaining: number) => void;
  hint_revealed: (hint: { position: number; letter: string }) => void;
  
  // Score Events
  score_update: (scores: { [playerId: string]: number }) => void;
  player_scored: (playerId: string, points: number, totalScore: number) => void;
  
  // Error Events
  error: (error: GameError) => void;
  rate_limited: (type: string, retryAfter: number) => void;
  
  // Mobile-specific events
  connection_quality_update: (playerId: string, quality: string) => void;
  mobile_optimization: (settings: MobileOptimizationSettings) => void;
  
  // Moderation Events
  vote_kick_started: (targetId: string, votesNeeded: number) => void;
  vote_skip_started: (votesNeeded: number) => void;
  player_kicked: (playerId: string, reason: string) => void;
  turn_skipped: () => void;
  
  // Heartbeat response
  pong: (timestamp: number) => void;
}

// Data Types for Events
export interface DrawingStrokeData {
  tool: 'pen' | 'bucket' | 'eraser';
  color: string;
  size: number;
  points: { x: number; y: number }[];
  // Mobile optimization
  compressed?: boolean;
  timestamp: number;
}

export interface ConnectionQualityData {
  latency: number;
  packetLoss: number;
  connectionType: 'wifi' | 'cellular' | 'unknown';
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface RoomJoinedData {
  roomId: string;
  gameState: GameState;
  players: Player[];
  isHost: boolean;
  canvasState?: CanvasStateData;
}

export interface RoomCreatedData {
  roomId: string;
  inviteLink: string;
  settings: GameSettings;
}

export interface LobbyMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system';
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'guess' | 'system';
  isCorrectGuess?: boolean;
}

export interface CanvasStateData {
  strokes: DrawingStroke[];
  backgroundColor: string;
  // Mobile optimization: send compressed data
  compressed?: boolean;
  checksum?: string;
}

export interface GameError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface MobileOptimizationSettings {
  strokeBatching: boolean;       // Batch drawing strokes
  compressionLevel: number;      // 0-9, higher = more compression
  heartbeatInterval: number;     // Heartbeat interval in ms
  reconnectionDelay: number;     // Delay between reconnection attempts
  maxReconnectionAttempts: number;
}

// Error Codes
export enum ErrorCode {
  AUTHENTICATION_FAILED = 'AUTH_FAILED',
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  GAME_IN_PROGRESS = 'GAME_IN_PROGRESS',
  NOT_HOST = 'NOT_HOST',
  NOT_DRAWER = 'NOT_DRAWER',
  INVALID_WORD = 'INVALID_WORD',
  RATE_LIMITED = 'RATE_LIMITED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  INVALID_SETTINGS = 'INVALID_SETTINGS',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  ALREADY_GUESSED = 'ALREADY_GUESSED',
  GAME_NOT_ACTIVE = 'GAME_NOT_ACTIVE',
  MOBILE_COMPATIBILITY = 'MOBILE_COMPATIBILITY'
}

// Mobile-specific event types
export type MobileEventType = 
  | 'app_background'
  | 'app_foreground'
  | 'network_change'
  | 'low_battery'
  | 'memory_warning'
  | 'orientation_change';
