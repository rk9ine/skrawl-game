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
  status: 'waiting' | 'word_selection' | 'drawing' | 'turn_end' | 'finished';
  currentDrawerId?: string;
  word?: string;
  wordPattern?: string;
  timeRemaining: number;
  scores: { [playerId: string]: number };
}

interface ChatMessage {
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

      leaveRoom: (): void => {
        // TODO: Implement in Phase 2
        set({
          currentRoom: null,
          isInRoom: false,
          isHost: false,
          gameState: null,
          isInGame: false,
          players: [],
          chatMessages: []
        });
      },

      sendChatMessage: (message: string): void => {
        // TODO: Implement in Phase 4
        console.log('Sending chat message:', message);
      },

      clearChatMessages: (): void => {
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
        set(state => ({
          chatMessages: [...state.chatMessages, message].slice(-100) // Keep last 100 messages
        }));
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
      }
    }),
    {
      name: 'skrawl-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist non-sensitive, non-connection state
        chatMessages: state.chatMessages.slice(-10), // Keep last 10 messages
      }),
    }
  )
);

// Export types for use in components
export type { Player, Room, GameSettings, GameState, ChatMessage, ConnectionStatus };
