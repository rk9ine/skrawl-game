/**
 * Game state types for Skrawl mobile drawing game
 * Based on skribbl.io mechanics with mobile optimizations
 */
import { Player } from './player';
export interface GameSettings {
    maxPlayers: number;
    rounds: number;
    drawTime: number;
    language: string;
    hints: number;
    wordMode: 'normal' | 'hidden' | 'combination';
    customWords?: string[];
    isPrivate: boolean;
    allowMidGameJoin: boolean;
}
export interface GameState {
    id: string;
    roomId: string;
    status: GameStatus;
    settings: GameSettings;
    players: Player[];
    hostId?: string;
    currentRound: number;
    totalRounds: number;
    currentTurn?: TurnState;
    turnOrder: string[];
    scores: {
        [playerId: string]: number;
    };
    startedAt?: Date;
    endedAt?: Date;
    createdAt: Date;
    lastActivity: Date;
}
export type GameStatus = 'waiting' | 'starting' | 'word_selection' | 'drawing' | 'turn_end' | 'round_end' | 'finished' | 'paused' | 'cancelled';
export interface TurnState {
    drawerId: string;
    word: string;
    wordPattern: string;
    wordChoices?: string[];
    timeRemaining: number;
    totalTime: number;
    startedAt: Date;
    guessedPlayers: Set<string>;
    hints: WordHint[];
    nextHintAt?: Date;
    canvasState: CanvasState;
}
export interface WordHint {
    position: number;
    letter: string;
    revealedAt: Date;
}
export interface CanvasState {
    strokes: DrawingStroke[];
    backgroundColor: string;
    lastModified: Date;
}
export interface DrawingStroke {
    id: string;
    playerId: string;
    tool: DrawingTool;
    color: string;
    size: number;
    points: Point[];
    timestamp: Date;
    compressed?: boolean;
}
export type DrawingTool = 'pen' | 'bucket' | 'eraser';
export interface Point {
    x: number;
    y: number;
    pressure?: number;
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
    guessTime: number;
    score: number;
    guessOrder: number;
}
export type TurnEndReason = 'time_up' | 'all_guessed' | 'drawer_left' | 'skipped' | 'cancelled';
export interface GameResult {
    gameId: string;
    finalScores: {
        [playerId: string]: number;
    };
    winner?: string;
    winners?: string[];
    totalRounds: number;
    duration: number;
    endedAt: Date;
}
export interface MobileGameEvent {
    type: 'network_lag' | 'app_background' | 'low_memory' | 'connection_lost';
    playerId: string;
    timestamp: Date;
    data?: any;
}
export interface GameMetrics {
    averageLatency: number;
    packetLoss: number;
    reconnections: number;
    mobileEvents: MobileGameEvent[];
}
//# sourceMappingURL=game.d.ts.map