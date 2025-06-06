import { create } from 'zustand';
import { gameService, GameWithParticipants } from '../services/gameService';

// Helper function to transform game data from service to store format
const transformGameData = (gameWithParticipants: GameWithParticipants): Game => ({
  id: gameWithParticipants.id,
  roomCode: gameWithParticipants.room_code,
  hostId: gameWithParticipants.host_id,
  gameMode: gameWithParticipants.game_mode,
  maxPlayers: gameWithParticipants.max_players,
  currentPlayers: gameWithParticipants.current_players,
  status: gameWithParticipants.status,
  currentRound: gameWithParticipants.current_round,
  maxRounds: gameWithParticipants.max_rounds,
  roundDuration: gameWithParticipants.round_duration,
  currentDrawerId: gameWithParticipants.current_drawer_id,
  currentWord: gameWithParticipants.current_word,
  createdAt: gameWithParticipants.created_at,
  updatedAt: gameWithParticipants.updated_at,
  players: gameWithParticipants.participants.map(p => ({
    id: p.id,
    userId: p.user_id,
    displayName: p.display_name,
    score: p.score,
    hasGuessedCorrectly: p.has_guessed_correctly,
    joinedAt: p.joined_at,
  })),
});

// Game interface - updated to match database schema
interface Game {
  id: string;
  roomCode: string;
  hostId: string;
  gameMode: 'classic' | 'drawing_battle';
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in_progress' | 'finished';
  currentRound: number;
  maxRounds: number;
  roundDuration: number;
  currentDrawerId?: string;
  currentWord?: string;
  createdAt: string;
  updatedAt: string;
  players: Array<{
    id: string;
    userId: string;
    displayName: string;
    score: number;
    hasGuessedCorrectly: boolean;
    joinedAt: string;
  }>;
}

// Interface for creating a new game
interface CreateGameData {
  gameMode: 'classic' | 'drawing_battle';
  maxPlayers: number;
  maxRounds: number;
  roundDuration: number;
  isPublic: boolean;
}

interface GameState {
  // Game listings
  publicGames: Game[];
  currentGame: Game | null;
  isLoading: boolean;
  error: string | null;

  // Game creation
  gameMode: 'classic' | 'drawing_battle';
  maxPlayers: number;
  maxRounds: number;
  roundDuration: number;
  isPublic: boolean;

  // Game code for joining private games
  gameCode: string;

  // Current game state
  currentPrompt: string;

  // Actions - Game listings
  loadPublicGames: () => Promise<void>;
  joinGame: (gameId: string, userId: string) => Promise<boolean>;
  joinPrivateGame: (gameCode: string, userId: string) => Promise<boolean>;
  leaveGame: (gameId: string, userId: string) => Promise<boolean>;

  // Actions - Game creation
  setGameMode: (gameMode: 'classic' | 'drawing_battle') => void;
  setMaxPlayers: (maxPlayers: number) => void;
  setMaxRounds: (maxRounds: number) => void;
  setRoundDuration: (roundDuration: number) => void;
  setIsPublic: (isPublic: boolean) => void;
  createGame: (userId: string) => Promise<Game | null>;

  // Actions - Game code
  setGameCode: (code: string) => void;

  // Actions - Game state
  getRandomPrompt: (difficulty?: 'easy' | 'medium' | 'hard') => Promise<string>;
  setCurrentPrompt: (prompt: string) => void;

  // Actions - Error handling
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Game listings
  publicGames: [],
  currentGame: null,
  isLoading: false,
  error: null,

  // Game creation settings
  gameMode: 'classic',
  maxPlayers: 8,
  maxRounds: 3,
  roundDuration: 80,
  isPublic: true,

  // Game code for joining private games
  gameCode: '',

  // Current game state
  currentPrompt: '',
  
  // Actions - Game listings
  loadPublicGames: async () => {
    try {
      set({ isLoading: true, error: null });

      const games = await gameService.loadPublicGames();

      // Transform the data to match our Game interface
      const transformedGames: Game[] = games.map(transformGameData);

      set({
        publicGames: transformedGames,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading public games:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load public games'
      });
    }
  },
  
  joinGame: async (gameId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const gameWithParticipants = await gameService.joinGame(gameId, userId);

      if (gameWithParticipants) {
        const transformedGame = transformGameData(gameWithParticipants);

        set({
          currentGame: transformedGame,
          isLoading: false,
        });

        return true;
      } else {
        set({
          isLoading: false,
          error: 'Failed to join game'
        });
        return false;
      }
    } catch (error) {
      console.error('Error joining game:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to join game'
      });
      return false;
    }
  },
  
  joinPrivateGame: async (gameCode: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const gameWithParticipants = await gameService.joinPrivateGame(gameCode, userId);

      if (gameWithParticipants) {
        const transformedGame = transformGameData(gameWithParticipants);

        set({
          currentGame: transformedGame,
          isLoading: false,
        });

        return true;
      } else {
        set({
          isLoading: false,
          error: 'Failed to join private game'
        });
        return false;
      }
    } catch (error) {
      console.error('Error joining private game:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to join private game'
      });
      return false;
    }
  },

  leaveGame: async (gameId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const success = await gameService.leaveGame(gameId, userId);

      if (success) {
        set({
          currentGame: null,
          isLoading: false,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: 'Failed to leave game'
        });
        return false;
      }
    } catch (error) {
      console.error('Error leaving game:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to leave game'
      });
      return false;
    }
  },
  
  // Actions - Game creation
  setGameMode: (gameMode: 'classic' | 'drawing_battle') => set({ gameMode }),

  setMaxPlayers: (maxPlayers: number) => set({ maxPlayers }),

  setMaxRounds: (maxRounds: number) => set({ maxRounds }),

  setRoundDuration: (roundDuration: number) => set({ roundDuration }),

  setIsPublic: (isPublic: boolean) => set({ isPublic }),
  
  createGame: async (userId: string) => {
    const {
      gameMode,
      maxPlayers,
      maxRounds,
      roundDuration,
      isPublic,
    } = get();

    try {
      set({ isLoading: true, error: null });

      const gameData: CreateGameData = {
        gameMode,
        maxPlayers,
        maxRounds,
        roundDuration,
        isPublic,
      };

      const gameWithParticipants = await gameService.createGame(userId, gameData);

      if (gameWithParticipants) {
        const transformedGame = transformGameData(gameWithParticipants);

        set({
          currentGame: transformedGame,
          isLoading: false,
        });

        return transformedGame;
      } else {
        set({
          isLoading: false,
          error: 'Failed to create game'
        });
        return null;
      }
    } catch (error) {
      console.error('Error creating game:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create game'
      });
      return null;
    }
  },
  
  // Actions - Game code
  setGameCode: (code: string) => set({ gameCode: code }),

  // Actions - Game state
  getRandomPrompt: async (difficulty?: 'easy' | 'medium' | 'hard') => {
    try {
      const prompt = await gameService.getRandomWord(difficulty);
      set({ currentPrompt: prompt });
      return prompt;
    } catch (error) {
      console.error('Error getting random prompt:', error);
      return '';
    }
  },

  setCurrentPrompt: (prompt: string) => set({ currentPrompt: prompt }),

  // Actions - Error handling
  clearError: () => set({ error: null }),
}));
