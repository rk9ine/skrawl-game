/**
 * Room Service for Skrawl WebSocket Server
 * Handles room creation, joining, and management for both public and private games
 */

import { GameState, GameSettings, GameStatus } from '../types/game';
import { Player } from '../types/player';
import { supabaseService } from './supabaseClient';

// Default game settings
const DEFAULT_PUBLIC_SETTINGS: GameSettings = {
  maxPlayers: 8,
  rounds: 3,
  drawTime: 80,
  language: 'english',
  hints: 2,
  wordMode: 'normal',
  isPrivate: false,
  allowMidGameJoin: true
};

const DEFAULT_PRIVATE_SETTINGS: GameSettings = {
  maxPlayers: 8,
  rounds: 3,
  drawTime: 80,
  language: 'english',
  hints: 2,
  wordMode: 'normal',
  isPrivate: true,
  allowMidGameJoin: true
};

// Room data structure
interface Room {
  id: string;
  gameState: GameState;
  players: Map<string, Player>;
  hostId?: string;
  inviteCode?: string;
  createdAt: Date;
  lastActivity: Date;
}

// In-memory room storage
class RoomManager {
  private rooms = new Map<string, Room>();
  private publicRooms = new Set<string>();
  private playerRoomMap = new Map<string, string>(); // playerId -> roomId

  // Generate unique room ID
  generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate unique invite code for private rooms
  generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new room
  createRoom(settings: GameSettings, hostId?: string): Room {
    const roomId = this.generateRoomId();
    const inviteCode = settings.isPrivate ? this.generateInviteCode() : undefined;

    const gameState: GameState = {
      id: `game_${roomId}_${Date.now()}`,
      roomId,
      status: 'waiting' as GameStatus,
      settings,
      players: [],
      hostId,
      currentRound: 0,
      totalRounds: settings.rounds,
      turnOrder: [],
      scores: {},
      createdAt: new Date(),
      lastActivity: new Date()
    };

    const room: Room = {
      id: roomId,
      gameState,
      players: new Map(),
      hostId,
      inviteCode,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomId, room);
    
    if (!settings.isPrivate) {
      this.publicRooms.add(roomId);
    }

    console.log(`🏠 Room created: ${roomId} (${settings.isPrivate ? 'Private' : 'Public'})`);
    return room;
  }

  // Get room by ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // Get room by invite code
  getRoomByInviteCode(inviteCode: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.inviteCode === inviteCode) {
        return room;
      }
    }
    return undefined;
  }

  // Find available public room or create new one
  findOrCreatePublicRoom(): Room {
    // Look for available public rooms
    for (const roomId of this.publicRooms) {
      const room = this.rooms.get(roomId);
      if (room && 
          room.gameState.status === 'waiting' && 
          room.players.size < room.gameState.settings.maxPlayers) {
        return room;
      }
    }

    // Create new public room if none available
    return this.createRoom(DEFAULT_PUBLIC_SETTINGS);
  }

  // Add player to room
  addPlayer(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Check if room is full
    if (room.players.size >= room.gameState.settings.maxPlayers) {
      return false;
    }

    // Check if game allows mid-game joins
    if (room.gameState.status !== 'waiting' && !room.gameState.settings.allowMidGameJoin) {
      return false;
    }

    // Add player to room
    room.players.set(player.id, player);
    room.gameState.players = Array.from(room.players.values());
    room.lastActivity = new Date();

    // Track player's room
    this.playerRoomMap.set(player.id, roomId);

    console.log(`👤 Player ${player.displayName} joined room ${roomId}`);
    return true;
  }

  // Remove player from room
  removePlayer(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const removed = room.players.delete(playerId);
    if (removed) {
      room.gameState.players = Array.from(room.players.values());
      room.lastActivity = new Date();
      this.playerRoomMap.delete(playerId);

      // Handle host leaving in private rooms
      if (room.hostId === playerId && room.players.size > 0) {
        // Transfer host to next player
        const newHost = Array.from(room.players.values())[0];
        room.hostId = newHost.id;
        room.gameState.hostId = newHost.id;
        console.log(`👑 Host transferred to ${newHost.displayName} in room ${roomId}`);
      }

      // Clean up empty rooms (industry standard: no persistence)
      if (room.players.size === 0) {
        console.log(`🧹 Room ${roomId} is empty - clearing messages and deleting room`);
        // Clear lobby messages before deleting room
        const { LobbyService } = require('./lobbyService');
        LobbyService.clearLobbyMessages(roomId);
        this.deleteRoom(roomId);
      }

      console.log(`👤 Player removed from room ${roomId}`);
    }

    return removed;
  }

  // Get player's current room
  getPlayerRoom(playerId: string): Room | undefined {
    const roomId = this.playerRoomMap.get(playerId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  // Delete room
  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Remove all player mappings
    for (const playerId of room.players.keys()) {
      this.playerRoomMap.delete(playerId);
    }

    // Remove from public rooms if applicable
    this.publicRooms.delete(roomId);

    // Delete room
    this.rooms.delete(roomId);

    console.log(`🗑️ Room deleted: ${roomId}`);
    return true;
  }

  // Update room settings (host only)
  updateRoomSettings(roomId: string, hostId: string, newSettings: Partial<GameSettings>): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.gameState.status !== 'waiting') {
      return false;
    }

    // Merge settings
    room.gameState.settings = { ...room.gameState.settings, ...newSettings };
    room.lastActivity = new Date();

    console.log(`⚙️ Room settings updated for ${roomId}`);
    return true;
  }

  // Get all rooms (for debugging)
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Get room statistics
  getStats() {
    return {
      totalRooms: this.rooms.size,
      publicRooms: this.publicRooms.size,
      privateRooms: this.rooms.size - this.publicRooms.size,
      totalPlayers: this.playerRoomMap.size
    };
  }

  // Cleanup inactive rooms (call periodically)
  cleanupInactiveRooms(maxInactiveMinutes: number = 30): number {
    const cutoff = new Date(Date.now() - maxInactiveMinutes * 60 * 1000);
    let cleaned = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.lastActivity < cutoff && room.players.size === 0) {
        this.deleteRoom(roomId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} inactive rooms`);
    }

    return cleaned;
  }
}

// Singleton room manager
export const roomManager = new RoomManager();

// Room Service class
export class RoomService {

  /**
   * Create a public room and add player
   */
  static async joinPublicGame(player: Player): Promise<{ room: Room; isNewRoom: boolean }> {
    // Remove player from any existing room first
    const existingRoom = roomManager.getPlayerRoom(player.id);
    if (existingRoom) {
      roomManager.removePlayer(existingRoom.id, player.id);
    }

    // Find or create public room
    const room = roomManager.findOrCreatePublicRoom();
    const isNewRoom = room.players.size === 0;

    // Add player to room
    const success = roomManager.addPlayer(room.id, player);
    if (!success) {
      throw new Error('Failed to join public game');
    }

    // Create game session in database
    if (isNewRoom) {
      await supabaseService.createGameSession(
        room.id,
        null, // No host for public games
        'public',
        room.gameState.settings
      );
    }

    return { room, isNewRoom };
  }

  /**
   * Create a private room
   */
  static async createPrivateRoom(hostPlayer: Player, settings: GameSettings): Promise<Room> {
    // Remove player from any existing room first
    const existingRoom = roomManager.getPlayerRoom(hostPlayer.id);
    if (existingRoom) {
      roomManager.removePlayer(existingRoom.id, hostPlayer.id);
    }

    // Merge with default private settings
    const finalSettings = { ...DEFAULT_PRIVATE_SETTINGS, ...settings, isPrivate: true };

    // Create room
    const room = roomManager.createRoom(finalSettings, hostPlayer.id);

    // Add host to room
    const success = roomManager.addPlayer(room.id, hostPlayer);
    if (!success) {
      roomManager.deleteRoom(room.id);
      throw new Error('Failed to create private room');
    }

    // Create game session in database
    await supabaseService.createGameSession(
      room.id,
      hostPlayer.id,
      'private',
      finalSettings
    );

    return room;
  }

  /**
   * Join a private room by invite code
   */
  static async joinPrivateRoom(player: Player, inviteCode: string): Promise<Room> {
    // Remove player from any existing room first
    const existingRoom = roomManager.getPlayerRoom(player.id);
    if (existingRoom) {
      roomManager.removePlayer(existingRoom.id, player.id);
    }

    // Find room by invite code
    const room = roomManager.getRoomByInviteCode(inviteCode);
    if (!room) {
      throw new Error('Room not found');
    }

    // Add player to room
    const success = roomManager.addPlayer(room.id, player);
    if (!success) {
      throw new Error('Failed to join room - room may be full or game in progress');
    }

    return room;
  }

  /**
   * Leave current room
   */
  static leaveRoom(playerId: string): boolean {
    const room = roomManager.getPlayerRoom(playerId);
    if (!room) return false;

    return roomManager.removePlayer(room.id, playerId);
  }

  /**
   * Update room settings (host only)
   */
  static updateRoomSettings(hostId: string, newSettings: Partial<GameSettings>): boolean {
    const room = roomManager.getPlayerRoom(hostId);
    if (!room) return false;

    return roomManager.updateRoomSettings(room.id, hostId, newSettings);
  }

  /**
   * Get room by ID
   */
  static getRoom(roomId: string): Room | undefined {
    return roomManager.getRoom(roomId);
  }

  /**
   * Get player's current room
   */
  static getPlayerRoom(playerId: string): Room | undefined {
    return roomManager.getPlayerRoom(playerId);
  }

  /**
   * Check if player is host of their room
   */
  static isHost(playerId: string): boolean {
    const room = roomManager.getPlayerRoom(playerId);
    return room?.hostId === playerId;
  }

  /**
   * Get room statistics
   */
  static getStats() {
    return roomManager.getStats();
  }
}

// Export types
export type { Room };
