import { create } from 'zustand';
import { DrawingPlayer } from '../types/drawing';
import { generateUUID } from '../utils/uuidUtils';
import { currentMockUser } from '../mock/users';

interface MultiplayerDrawingState {
  // Players in the session
  currentPlayer: DrawingPlayer;
  players: DrawingPlayer[];

  // Session information
  sessionId: string;
  isConnected: boolean;

  // Actions
  setCurrentPlayer: (player: DrawingPlayer) => void;
  addPlayer: (player: DrawingPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<DrawingPlayer>) => void;

  // Session actions
  setSessionId: (sessionId: string) => void;
  setIsConnected: (isConnected: boolean) => void;
}

// Default current player based on mock user
const defaultCurrentPlayer: DrawingPlayer = {
  id: currentMockUser?.id || 'local-player',
  name: currentMockUser?.displayName || 'You',
  color: '#4361EE',
  avatar: '🎨',
  isActive: true,
  isDrawing: true,
};

// Mock players for testing
const mockPlayers: DrawingPlayer[] = [
  {
    id: 'player-1',
    name: 'Player 1',
    color: '#FF5733',
    avatar: '😀',
    isActive: true,
    isDrawing: false,
  },
  {
    id: 'player-2',
    name: 'Player 2',
    color: '#33FF57',
    avatar: '🎮',
    isActive: true,
    isDrawing: false,
  },
];

export const useMultiplayerDrawingStore = create<MultiplayerDrawingState>((set, get) => ({
  // Initial state
  currentPlayer: defaultCurrentPlayer,
  players: mockPlayers,
  sessionId: generateUUID(),
  isConnected: false,

  // Player actions
  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  addPlayer: (player) => {
    const { players } = get();
    // Check if player already exists
    if (!players.some(p => p.id === player.id)) {
      set({ players: [...players, player] });
    }
  },

  removePlayer: (playerId) => {
    const { players } = get();
    set({ players: players.filter(p => p.id !== playerId) });
  },

  updatePlayer: (playerId, updates) => {
    const { players } = get();
    set({
      players: players.map(player =>
        player.id === playerId ? { ...player, ...updates } : player
      )
    });
  },

  // Session actions
  setSessionId: (sessionId) => set({ sessionId }),

  setIsConnected: (isConnected) => set({ isConnected }),
}));


