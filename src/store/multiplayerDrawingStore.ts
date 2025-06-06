import { create } from 'zustand';
import { DrawingPlayer } from '../types/drawing';
import { generateUUID } from '../utils/uuidUtils';

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

// Default current player - will be updated with real user data
const defaultCurrentPlayer: DrawingPlayer = {
  id: 'local-player',
  name: 'You',
  color: '#4361EE',
  avatar: '🎨',
  isActive: true,
  isDrawing: true,
};

// Empty players array - will be populated with real multiplayer data
const initialPlayers: DrawingPlayer[] = [];

export const useMultiplayerDrawingStore = create<MultiplayerDrawingState>((set, get) => ({
  // Initial state
  currentPlayer: defaultCurrentPlayer,
  players: initialPlayers,
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


