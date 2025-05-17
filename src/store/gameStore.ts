import { create } from 'zustand';
import { gamesApi } from '../services/mockApi';
import { MockGame } from '../mock';

interface GameState {
  // Game listings
  publicGames: MockGame[];
  currentGame: MockGame | null;
  isLoading: boolean;
  
  // Game creation
  gameName: string;
  gameDescription: string;
  maxPlayers: number;
  totalRounds: number;
  timePerRound: number;
  isPublic: boolean;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Game code for joining private games
  gameCode: string;
  
  // Current game state
  currentPrompt: string;
  
  // Actions - Game listings
  loadPublicGames: () => Promise<void>;
  joinGame: (gameId: string) => Promise<boolean>;
  joinPrivateGame: (gameCode: string) => Promise<boolean>;
  
  // Actions - Game creation
  setGameName: (name: string) => void;
  setGameDescription: (description: string) => void;
  setMaxPlayers: (maxPlayers: number) => void;
  setTotalRounds: (totalRounds: number) => void;
  setTimePerRound: (timePerRound: number) => void;
  setIsPublic: (isPublic: boolean) => void;
  setTheme: (theme: string) => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  createGame: (userId: string) => Promise<MockGame | null>;
  
  // Actions - Game code
  setGameCode: (code: string) => void;
  
  // Actions - Game state
  getRandomPrompt: () => Promise<string>;
  setCurrentPrompt: (prompt: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Game listings
  publicGames: [],
  currentGame: null,
  isLoading: false,
  
  // Game creation
  gameName: '',
  gameDescription: '',
  maxPlayers: 4,
  totalRounds: 5,
  timePerRound: 60,
  isPublic: true,
  theme: '',
  difficulty: 'medium',
  
  // Game code for joining private games
  gameCode: '',
  
  // Current game state
  currentPrompt: '',
  
  // Actions - Game listings
  loadPublicGames: async () => {
    try {
      set({ isLoading: true });
      
      const games = await gamesApi.getPublicGames();
      
      set({
        publicGames: games,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading public games:', error);
      set({ isLoading: false });
    }
  },
  
  joinGame: async (gameId) => {
    try {
      set({ isLoading: true });
      
      const response = await gamesApi.joinGame(gameId);
      
      set({
        isLoading: false,
        currentGame: response.success ? response.game || null : null,
      });
      
      return response.success;
    } catch (error) {
      console.error('Error joining game:', error);
      set({ isLoading: false });
      return false;
    }
  },
  
  joinPrivateGame: async (gameCode) => {
    try {
      set({ isLoading: true });
      
      const game = await gamesApi.getPrivateGameByCode(gameCode);
      
      if (!game) {
        set({ isLoading: false });
        return false;
      }
      
      const response = await gamesApi.joinGame(game.id);
      
      set({
        isLoading: false,
        currentGame: response.success ? response.game || null : null,
      });
      
      return response.success;
    } catch (error) {
      console.error('Error joining private game:', error);
      set({ isLoading: false });
      return false;
    }
  },
  
  // Actions - Game creation
  setGameName: (name) => set({ gameName: name }),
  
  setGameDescription: (description) => set({ gameDescription: description }),
  
  setMaxPlayers: (maxPlayers) => set({ maxPlayers }),
  
  setTotalRounds: (totalRounds) => set({ totalRounds }),
  
  setTimePerRound: (timePerRound) => set({ timePerRound }),
  
  setIsPublic: (isPublic) => set({ isPublic }),
  
  setTheme: (theme) => set({ theme }),
  
  setDifficulty: (difficulty) => set({ difficulty }),
  
  createGame: async (userId) => {
    const {
      gameName,
      gameDescription,
      maxPlayers,
      totalRounds,
      timePerRound,
      isPublic,
      theme,
      difficulty,
    } = get();
    
    try {
      set({ isLoading: true });
      
      const game = await gamesApi.createGame({
        name: gameName,
        description: gameDescription,
        creatorId: userId,
        maxPlayers,
        totalRounds,
        timePerRound,
        isPublic,
        theme,
        difficulty,
      });
      
      set({
        isLoading: false,
        currentGame: game,
      });
      
      return game;
    } catch (error) {
      console.error('Error creating game:', error);
      set({ isLoading: false });
      return null;
    }
  },
  
  // Actions - Game code
  setGameCode: (code) => set({ gameCode: code }),
  
  // Actions - Game state
  getRandomPrompt: async () => {
    try {
      const prompt = await gamesApi.getRandomPrompt();
      set({ currentPrompt: prompt });
      return prompt;
    } catch (error) {
      console.error('Error getting random prompt:', error);
      return '';
    }
  },
  
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
}));
