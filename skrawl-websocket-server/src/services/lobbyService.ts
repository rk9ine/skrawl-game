/**
 * Lobby Service for Skrawl WebSocket Server
 * Handles pre-game lobby functionality including chat, ready status, and game start
 */

import { Room, roomManager } from './roomService';
import { Player } from '../types/player';
import { GameSettings } from '../types/game';

// Lobby message types
export interface LobbyMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system';
}

// Player ready status
interface PlayerReadyStatus {
  playerId: string;
  isReady: boolean;
  timestamp: number;
}

// Lobby state for each room
interface LobbyState {
  roomId: string;
  messages: LobbyMessage[];
  readyStatus: Map<string, boolean>;
  lastActivity: Date;
}

// In-memory lobby storage
class LobbyManager {
  private lobbies = new Map<string, LobbyState>();

  // Get or create lobby state for room
  getLobbyState(roomId: string): LobbyState {
    if (!this.lobbies.has(roomId)) {
      this.lobbies.set(roomId, {
        roomId,
        messages: [],
        readyStatus: new Map(),
        lastActivity: new Date()
      });
    }
    return this.lobbies.get(roomId)!;
  }

  // Add message to lobby
  addMessage(roomId: string, message: LobbyMessage): void {
    const lobby = this.getLobbyState(roomId);
    lobby.messages.push(message);
    lobby.lastActivity = new Date();

    // Industry standard: Keep messages only for current session
    // No artificial limit - messages will be cleared when room empties
  }

  // Set player ready status
  setPlayerReady(roomId: string, playerId: string, isReady: boolean): void {
    const lobby = this.getLobbyState(roomId);
    lobby.readyStatus.set(playerId, isReady);
    lobby.lastActivity = new Date();
  }

  // Remove player from lobby
  removePlayer(roomId: string, playerId: string): void {
    const lobby = this.lobbies.get(roomId);
    if (lobby) {
      lobby.readyStatus.delete(playerId);
    }
  }

  // Clean up lobby when room is deleted
  deleteLobby(roomId: string): void {
    this.lobbies.delete(roomId);
  }

  // Clear all messages in a lobby (for round/session resets)
  clearMessages(roomId: string): void {
    const lobby = this.lobbies.get(roomId);
    if (lobby) {
      lobby.messages = [];
      lobby.lastActivity = new Date();
    }
  }

  // Get lobby statistics
  getStats() {
    return {
      totalLobbies: this.lobbies.size,
      totalMessages: Array.from(this.lobbies.values()).reduce((sum, lobby) => sum + lobby.messages.length, 0)
    };
  }

  // Cleanup old lobbies
  cleanupOldLobbies(maxAgeMinutes: number = 60): number {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    let cleaned = 0;

    for (const [roomId, lobby] of this.lobbies.entries()) {
      if (lobby.lastActivity < cutoff) {
        this.lobbies.delete(roomId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton lobby manager
const lobbyManager = new LobbyManager();

/**
 * Lobby Service
 */
export class LobbyService {

  /**
   * Send chat message in lobby
   */
  static sendLobbyMessage(playerId: string, messageText: string): LobbyMessage | null {
    const room = roomManager.getPlayerRoom(playerId);
    if (!room || room.gameState.status !== 'waiting') {
      return null;
    }

    const player = room.players.get(playerId);
    if (!player) {
      return null;
    }

    // Basic message validation
    const trimmedMessage = messageText.trim();
    if (trimmedMessage.length === 0 || trimmedMessage.length > 200) {
      return null;
    }

    // Create message with unique ID
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    const counterPart = (this.messageCounter++).toString(36);

    const message: LobbyMessage = {
      id: `msg_${timestamp}_${randomPart}_${counterPart}`,
      playerId,
      playerName: player.displayName,
      message: this.filterMessage(trimmedMessage),
      timestamp,
      type: 'chat'
    };

    // Add to lobby
    lobbyManager.addMessage(room.id, message);

    return message;
  }

  /**
   * Send system message to lobby
   */
  static sendSystemMessage(roomId: string, message: string): LobbyMessage {
    // Generate a more unique ID to prevent React key conflicts
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    const counterPart = (this.messageCounter++).toString(36);

    const systemMessage: LobbyMessage = {
      id: `system_${timestamp}_${randomPart}_${counterPart}`,
      playerId: 'system',
      playerName: 'System',
      message,
      timestamp,
      type: 'system'
    };

    lobbyManager.addMessage(roomId, systemMessage);
    return systemMessage;
  }

  // Static counter for unique message IDs
  private static messageCounter = 0;

  /**
   * Set player ready status
   */
  static setPlayerReady(playerId: string, isReady: boolean): { success: boolean; systemMessage?: LobbyMessage } {
    const room = roomManager.getPlayerRoom(playerId);
    if (!room || room.gameState.status !== 'waiting') {
      return { success: false };
    }

    lobbyManager.setPlayerReady(room.id, playerId, isReady);

    // Send system message about ready status change
    const player = room.players.get(playerId);
    let systemMessage: LobbyMessage | undefined;
    if (player) {
      const statusText = isReady ? 'is ready' : 'is not ready';
      systemMessage = this.sendSystemMessage(room.id, `${player.displayName} ${statusText}`);
    }

    return { success: true, systemMessage };
  }

  /**
   * Get lobby messages
   */
  static getLobbyMessages(roomId: string): LobbyMessage[] {
    const lobby = lobbyManager.getLobbyState(roomId);
    return [...lobby.messages]; // Return copy
  }

  /**
   * Get player ready status for room
   */
  static getReadyStatus(roomId: string): { [playerId: string]: boolean } {
    const lobby = lobbyManager.getLobbyState(roomId);
    const status: { [playerId: string]: boolean } = {};
    
    for (const [playerId, isReady] of lobby.readyStatus.entries()) {
      status[playerId] = isReady;
    }
    
    return status;
  }

  /**
   * Check if all players are ready
   */
  static areAllPlayersReady(roomId: string): boolean {
    const room = roomManager.getRoom(roomId);
    if (!room || room.players.size < 2) {
      return false; // Need at least 2 players
    }

    const lobby = lobbyManager.getLobbyState(roomId);
    
    // Check if all players are ready
    for (const playerId of room.players.keys()) {
      if (!lobby.readyStatus.get(playerId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update room settings (host only)
   */
  static updateRoomSettings(hostId: string, newSettings: Partial<GameSettings>): boolean {
    const room = roomManager.getPlayerRoom(hostId);
    if (!room || room.hostId !== hostId || room.gameState.status !== 'waiting') {
      return false;
    }

    // Validate settings
    const validatedSettings = this.validateSettings(newSettings);
    if (!validatedSettings) {
      return false;
    }

    // Update settings
    const success = roomManager.updateRoomSettings(room.id, hostId, validatedSettings);
    
    if (success) {
      // Send system message about settings change
      this.sendSystemMessage(room.id, 'Room settings have been updated');
    }

    return success;
  }

  /**
   * Validate game start conditions
   */
  static canStartGame(roomId: string, hostId?: string): { canStart: boolean; reason?: string } {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return { canStart: false, reason: 'Room not found' };
    }

    // Check if caller is host (for private rooms)
    if (room.gameState.settings.isPrivate && room.hostId !== hostId) {
      return { canStart: false, reason: 'Only the host can start the game' };
    }

    // Check minimum players
    if (room.players.size < 2) {
      return { canStart: false, reason: 'Need at least 2 players to start' };
    }

    // Check if game is already in progress
    if (room.gameState.status !== 'waiting') {
      return { canStart: false, reason: 'Game is already in progress' };
    }

    // For private rooms, check if all players are ready
    if (room.gameState.settings.isPrivate && !this.areAllPlayersReady(roomId)) {
      return { canStart: false, reason: 'All players must be ready to start' };
    }

    // Validate custom words if used
    if (room.gameState.settings.customWords && room.gameState.settings.customWords.length < 10) {
      return { canStart: false, reason: 'Need at least 10 custom words to start' };
    }

    return { canStart: true };
  }

  /**
   * Handle player leaving lobby
   */
  static handlePlayerLeave(roomId: string, playerId: string): LobbyMessage | null {
    lobbyManager.removePlayer(roomId, playerId);

    // Send system message
    const room = roomManager.getRoom(roomId);
    if (room) {
      const player = room.players.get(playerId);
      if (player) {
        return this.sendSystemMessage(roomId, `${player.displayName} left the lobby`);
      }
    }

    return null;
  }

  /**
   * Handle player joining lobby
   */
  static handlePlayerJoin(roomId: string, player: Player): LobbyMessage {
    // Send system message
    const systemMessage = this.sendSystemMessage(roomId, `${player.displayName} joined the lobby`);

    // Set initial ready status to false
    lobbyManager.setPlayerReady(roomId, player.id, false);

    return systemMessage;
  }

  /**
   * Clean up lobby when room is deleted
   */
  static deleteLobby(roomId: string): void {
    lobbyManager.deleteLobby(roomId);
  }

  /**
   * Clear all messages in lobby (industry standard: clean slate for new sessions)
   */
  static clearLobbyMessages(roomId: string): void {
    lobbyManager.clearMessages(roomId);
  }

  /**
   * Get lobby statistics
   */
  static getStats() {
    return lobbyManager.getStats();
  }

  /**
   * Filter message content (comprehensive profanity filter)
   */
  private static filterMessage(message: string): string {
    // Comprehensive profanity filter - replace with asterisks
    // Use word boundaries (\b) to match only complete words, not partial matches
    const profanityList = [
      // Basic profanity
      'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'crap',
      // Strong profanity
      'bastard', 'whore', 'slut', 'piss', 'cock', 'dick', 'pussy',
      // Racial slurs (comprehensive list)
      'nigga', 'nigger', 'chink', 'gook', 'spic', 'wetback', 'beaner',
      'kike', 'hymie', 'raghead', 'towelhead', 'camel jockey',
      'cracker', 'honky', 'whitey', 'redneck',
      // Homophobic slurs
      'fag', 'faggot', 'dyke', 'queer',
      // Other offensive terms
      'retard', 'retarded', 'nazi', 'hitler',
      // Common variations and misspellings
      'fuk', 'fck', 'sht', 'btch', 'dmn'
    ];
    let filtered = message;

    profanityList.forEach(word => {
      // Use word boundaries to match only complete words
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });

    return filtered;
  }

  /**
   * Validate game settings
   */
  private static validateSettings(settings: Partial<GameSettings>): Partial<GameSettings> | null {
    const validated: Partial<GameSettings> = {};

    // Validate max players
    if (settings.maxPlayers !== undefined) {
      if (settings.maxPlayers < 2 || settings.maxPlayers > 20) {
        return null;
      }
      validated.maxPlayers = settings.maxPlayers;
    }

    // Validate rounds
    if (settings.rounds !== undefined) {
      if (settings.rounds < 1 || settings.rounds > 10) {
        return null;
      }
      validated.rounds = settings.rounds;
    }

    // Validate draw time
    if (settings.drawTime !== undefined) {
      if (settings.drawTime < 30 || settings.drawTime > 240) {
        return null;
      }
      validated.drawTime = settings.drawTime;
    }

    // Validate hints
    if (settings.hints !== undefined) {
      if (settings.hints < 0 || settings.hints > 5) {
        return null;
      }
      validated.hints = settings.hints;
    }

    // Validate language
    if (settings.language !== undefined) {
      const validLanguages = ['english', 'spanish'];
      if (!validLanguages.includes(settings.language)) {
        return null;
      }
      validated.language = settings.language;
    }

    // Validate word mode
    if (settings.wordMode !== undefined) {
      const validModes = ['normal', 'hidden', 'combination'];
      if (!validModes.includes(settings.wordMode)) {
        return null;
      }
      validated.wordMode = settings.wordMode;
    }

    return validated;
  }
}

export default LobbyService;
