/**
 * Game state store for Skrawl mobile drawing game
 * Manages WebSocket connection and game state using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameWebSocketService } from '../services/gameWebSocketService';

// Game state types
interface Player {
  id: string;
  socketId: string;
  displayName: string;
  avatar?: any;
  score: number;
  totalScore: number;
  isReady: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
  isConnected: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

interface Room {
  id: string;
  isPrivate: boolean;
  hostId?: string;
  players: Player[];
  settings: GameSettings;
  status: 'waiting' | 'starting' | 'active' | 'finished';
}

interface GameSettings {
  maxPlayers: number;
  rounds: number;
  drawTime: number;
  language: string;
  hints: number;
  customWords?: string[];
  allowMidGameJoin: boolean;
}

interface GameState {
  id?: string;
  roomId?: string;
  currentRound: number;
  totalRounds: number;
  maxRounds?: number; // For compatibility with DrawingBattleScreen
  status: 'waiting' | 'word_selection' | 'drawing' | 'turn_end' | 'finished';
  currentDrawerId?: string;
  word?: string;
  currentWord?: string; // For compatibility with DrawingBattleScreen
  wordPattern?: string;
  timeRemaining: number;
  roundDuration?: number; // For compatibility with DrawingBattleScreen
  scores: { [playerId: string]: number };
}

interface ChatMessage {
  id?: string; // Optional unique identifier for the message
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'guess' | 'system';
  isCorrectGuess?: boolean;
}

// Connection state
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

interface GameStoreState {
  // Connection state
  connectionStatus: ConnectionStatus;
  connectionError?: string;
  latency: number;
  isConnected: boolean;

  // Room state
  currentRoom: Room | null;
  isInRoom: boolean;
  isHost: boolean;

  // Game state
  gameState: GameState | null;
  isInGame: boolean;
  players: Player[];
  chatMessages: ChatMessage[];

  // UI state
  isJoiningGame: boolean;
  isCreatingRoom: boolean;

  // Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  joinPublicGame: () => void;
  createPrivateRoom: (settings: GameSettings) => void;
  joinPrivateRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendChatMessage: (message: string) => void;
  clearChatMessages: () => void;
  
  // Internal actions
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void;
  setLatency: (latency: number) => void;
  setCurrentRoom: (room: Room | null) => void;
  setGameState: (gameState: GameState | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  clearGameState: () => void;
  setupWebSocketEventHandlers: () => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      connectionStatus: 'disconnected',
      connectionError: undefined,
      latency: 0,
      isConnected: false,
      currentRoom: null,
      isInRoom: false,
      isHost: false,
      gameState: null,
      isInGame: false,
      players: [],
      chatMessages: [],
      isJoiningGame: false,
      isCreatingRoom: false,

      // Connection actions
      connect: async (): Promise<boolean> => {
        const { setConnectionStatus, setLatency } = get();
        
        try {
          setConnectionStatus('connecting');
          
          const connected = await gameWebSocketService.connect();
          
          if (connected) {
            setConnectionStatus('connected');

            // Set up WebSocket event handlers for Phase 2
            get().setupWebSocketEventHandlers();

            // Set up latency monitoring
            const updateLatency = () => {
              const latency = gameWebSocketService.getLatency();
              setLatency(latency);
            };

            // Update latency every 5 seconds
            const latencyInterval = setInterval(updateLatency, 5000);

            // Store interval for cleanup
            (get() as any).latencyInterval = latencyInterval;

            return true;
          } else {
            setConnectionStatus('error', 'Failed to connect to game server');
            return false;
          }
        } catch (error) {
          console.error('Connection error:', error);
          setConnectionStatus('error', 'Connection failed');
          return false;
        }
      },

      disconnect: (): void => {
        const state = get() as any;
        
        // Clear latency monitoring
        if (state.latencyInterval) {
          clearInterval(state.latencyInterval);
        }
        
        gameWebSocketService.disconnect();
        
        set({
          connectionStatus: 'disconnected',
          connectionError: undefined,
          latency: 0,
          isConnected: false,
          currentRoom: null,
          isInRoom: false,
          isHost: false,
          gameState: null,
          isInGame: false,
          players: [],
          chatMessages: [],
          isJoiningGame: false,
          isCreatingRoom: false
        });
      },

      // Game actions
      joinPublicGame: (): void => {
        const { isConnected } = get();
        
        if (!isConnected) {
          console.error('Not connected to game server');
          return;
        }

        set({ isJoiningGame: true });
        gameWebSocketService.joinPublicGame();
        
        // TODO: Handle response in Phase 2
        setTimeout(() => {
          set({ isJoiningGame: false });
        }, 3000);
      },

      createPrivateRoom: (settings: GameSettings): void => {
        const { isConnected } = get();
        
        if (!isConnected) {
          console.error('Not connected to game server');
          return;
        }

        set({ isCreatingRoom: true });
        gameWebSocketService.createPrivateRoom(settings);
        
        // TODO: Handle response in Phase 2
        setTimeout(() => {
          set({ isCreatingRoom: false });
        }, 3000);
      },

      joinPrivateRoom: (roomId: string): void => {
        const { isConnected } = get();
        
        if (!isConnected) {
          console.error('Not connected to game server');
          return;
        }

        set({ isJoiningGame: true });
        gameWebSocketService.joinPrivateRoom(roomId);
        
        // TODO: Handle response in Phase 2
        setTimeout(() => {
          set({ isJoiningGame: false });
        }, 3000);
      },

      // Removed duplicate leaveRoom - using the one below

      sendChatMessage: (message: string): void => {
        const { isConnected } = get();

        if (!isConnected) {
          console.error('Cannot send chat message - not connected to game server');
          return;
        }

        console.log('Sending chat message:', message);
        gameWebSocketService.sendLobbyMessage(message);
      },

      clearChatMessages: (): void => {
        console.log('🧹 Clearing chat messages (industry standard: session-only)');
        set({ chatMessages: [] });
      },

      // Internal state setters
      setConnectionStatus: (status: ConnectionStatus, error?: string): void => {
        set({ 
          connectionStatus: status, 
          connectionError: error,
          isConnected: status === 'connected'
        });
      },

      setLatency: (latency: number): void => {
        set({ latency });
      },

      setCurrentRoom: (room: Room | null): void => {
        set({ 
          currentRoom: room,
          isInRoom: !!room,
          players: room?.players || []
        });
      },

      setGameState: (gameState: GameState | null): void => {
        set({ 
          gameState,
          isInGame: !!gameState && gameState.status !== 'waiting'
        });
      },

      addChatMessage: (message: ChatMessage): void => {
        set(state => {
          // Prevent duplicate messages by checking ID or timestamp+playerId combination
          const isDuplicate = state.chatMessages.some(existing =>
            (message.id && existing.id === message.id) ||
            (!message.id && existing.playerId === message.playerId &&
             existing.timestamp === message.timestamp &&
             existing.message === message.message)
          );

          if (isDuplicate) {
            console.log('🚫 Duplicate message prevented:', message);
            return state; // Don't add duplicate
          }

          return {
            // No message limit - messages are session-only and will be cleared when leaving room
            chatMessages: [...state.chatMessages, message]
          };
        });
      },

      updatePlayer: (playerId: string, updates: Partial<Player>): void => {
        set(state => ({
          players: state.players.map(player => 
            player.id === playerId ? { ...player, ...updates } : player
          )
        }));
      },

      addPlayer: (player: Player): void => {
        set(state => ({
          players: [...state.players.filter(p => p.id !== player.id), player]
        }));
      },

      removePlayer: (playerId: string): void => {
        set(state => ({
          players: state.players.filter(player => player.id !== playerId)
        }));
      },

      // Room management actions
      leaveRoom: (): void => {
        const { isConnected } = get();

        if (isConnected) {
          gameWebSocketService.leaveRoom();
        }

        // Clear room state immediately (industry standard: no message persistence)
        console.log('🧹 Clearing room state and chat messages (session ended)');
        set({
          currentRoom: null,
          isInRoom: false,
          isHost: false,
          players: [],
          chatMessages: [], // Industry standard: messages are session-only
          isJoiningGame: false, // Reset joining state
          isCreatingRoom: false // Reset creating state
        });
      },

      clearGameState: (): void => {
        set({
          gameState: null,
          isInGame: false,
          currentRoom: null,
          isInRoom: false,
          isHost: false,
          players: [],
          chatMessages: [],
          isJoiningGame: false,
          isCreatingRoom: false
        });
      },

      // Set up WebSocket event handlers for Phase 2
      setupWebSocketEventHandlers: (): void => {
        console.log('🔌 Setting up WebSocket event handlers...');

        // Set up lobby message handler
        gameWebSocketService.onLobbyMessage = (message: any) => {
          console.log('📨 Received lobby message in store:', message);
          get().addChatMessage(message);
        };

        // Set up room joined handler (initial player list)
        gameWebSocketService.onRoomJoined = (roomData: any) => {
          console.log('🏠 Room joined in store:', roomData);

          // Transform all initial players to game store format
          if (roomData.players && Array.isArray(roomData.players)) {
            const transformedPlayers = roomData.players.map((player: any) => ({
              id: player.id,
              socketId: player.socketId,
              displayName: player.displayName,
              avatar: player.avatar, // Preserve avatar data from server
              score: player.score || 0,
              totalScore: player.totalScore || 0,
              isReady: player.isReady || false,
              isDrawing: player.isDrawing || false,
              hasGuessed: player.hasGuessed || false,
              isConnected: player.isConnected !== false, // Default to true
              joinedAt: player.joinedAt ? new Date(player.joinedAt) : new Date(),
              lastActivity: player.lastActivity ? new Date(player.lastActivity) : new Date()
            }));

            // Set all players at once
            set({ players: transformedPlayers });
            console.log('👥 Set initial players:', transformedPlayers);
          }
        };

        // Set up player join handler (new players joining after room creation)
        gameWebSocketService.onPlayerJoined = (player: any) => {
          console.log('👤 Player joined in store:', player);

          // Transform server player to game store format with complete data
          const gamePlayer = {
            id: player.id,
            socketId: player.socketId,
            displayName: player.displayName,
            avatar: player.avatar, // Preserve avatar data from server
            score: player.score || 0,
            totalScore: player.totalScore || 0,
            isReady: player.isReady || false,
            isDrawing: player.isDrawing || false,
            hasGuessed: player.hasGuessed || false,
            isConnected: player.isConnected !== false, // Default to true
            joinedAt: player.joinedAt ? new Date(player.joinedAt) : new Date(),
            lastActivity: player.lastActivity ? new Date(player.lastActivity) : new Date()
          };

          get().addPlayer(gamePlayer);
        };

        // Set up player leave handler
        gameWebSocketService.onPlayerLeft = (playerId: string) => {
          console.log('👋 Player left in store:', playerId);
          get().removePlayer(playerId);
        };
      }
    }),
    {
      name: 'skrawl-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // No chat message persistence - messages are session-only for skribbl.io-style games
        // Only persist non-sensitive, non-connection state if needed in future
      }),
    }
  )
);

// Export types for use in components
export type { Player, Room, GameSettings, GameState, ChatMessage, ConnectionStatus };
