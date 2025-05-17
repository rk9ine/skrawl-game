import { 
  mockUsers, 
  currentMockUser, 
  mockDrawings, 
  mockPublicGames, 
  mockPrivateGames,
  mockDrawingPrompts,
  MockUser,
  MockDrawing,
  MockGame
} from '../mock';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Random delay between 300ms and 1200ms to simulate network latency
const randomDelay = () => delay(Math.floor(Math.random() * 900) + 300);

// Mock authentication API
export const authApi = {
  // Sign in with email (magic link)
  signInWithEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    await randomDelay();
    
    // Always succeed in mock mode
    return {
      success: true,
      message: 'Magic link sent successfully. Check your email.',
    };
  },
  
  // Sign in with Google
  signInWithGoogle: async (): Promise<{ success: boolean; user?: MockUser; message?: string }> => {
    await randomDelay();
    
    // Always succeed in mock mode
    return {
      success: true,
      user: currentMockUser,
    };
  },
  
  // Sign out
  signOut: async (): Promise<{ success: boolean }> => {
    await randomDelay();
    
    return {
      success: true,
    };
  },
  
  // Get current user
  getCurrentUser: async (): Promise<MockUser | null> => {
    await randomDelay();
    
    return currentMockUser;
  },
};

// Mock drawings API
export const drawingsApi = {
  // Get all drawings
  getAllDrawings: async (): Promise<MockDrawing[]> => {
    await randomDelay();
    
    return mockDrawings.filter(drawing => drawing.isPublic);
  },
  
  // Get drawings by user
  getDrawingsByUser: async (userId: string): Promise<MockDrawing[]> => {
    await randomDelay();
    
    return mockDrawings.filter(drawing => drawing.userId === userId);
  },
  
  // Get drawing by ID
  getDrawingById: async (drawingId: string): Promise<MockDrawing | null> => {
    await randomDelay();
    
    const drawing = mockDrawings.find(d => d.id === drawingId);
    return drawing || null;
  },
  
  // Save drawing
  saveDrawing: async (drawing: Omit<MockDrawing, 'id' | 'createdAt' | 'updatedAt' | 'likes'>): Promise<MockDrawing> => {
    await randomDelay();
    
    const newDrawing: MockDrawing = {
      ...drawing,
      id: `drawing-${mockDrawings.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
    };
    
    // In a real app, we would add this to the database
    // For mock, we'll just return it
    return newDrawing;
  },
  
  // Update drawing
  updateDrawing: async (drawingId: string, updates: Partial<MockDrawing>): Promise<MockDrawing | null> => {
    await randomDelay();
    
    const drawing = mockDrawings.find(d => d.id === drawingId);
    if (!drawing) return null;
    
    const updatedDrawing = {
      ...drawing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, we would update the database
    // For mock, we'll just return the updated drawing
    return updatedDrawing;
  },
  
  // Delete drawing
  deleteDrawing: async (drawingId: string): Promise<{ success: boolean }> => {
    await randomDelay();
    
    // In a real app, we would delete from the database
    // For mock, we'll just return success
    return { success: true };
  },
};

// Mock games API
export const gamesApi = {
  // Get public games
  getPublicGames: async (): Promise<MockGame[]> => {
    await randomDelay();
    
    return mockPublicGames;
  },
  
  // Get private game by code
  getPrivateGameByCode: async (gameCode: string): Promise<MockGame | null> => {
    await randomDelay();
    
    const game = mockPrivateGames.find(g => g.gameCode === gameCode);
    return game || null;
  },
  
  // Create new game
  createGame: async (game: Partial<MockGame>): Promise<MockGame> => {
    await randomDelay();
    
    const newGame: MockGame = {
      id: `game-${mockPublicGames.length + mockPrivateGames.length + 1}`,
      name: game.name || 'New Game',
      description: game.description || '',
      creatorId: game.creatorId || currentMockUser.id,
      players: [
        { id: currentMockUser.id, displayName: currentMockUser.displayName, score: 0, isReady: true },
      ],
      maxPlayers: game.maxPlayers || 4,
      status: 'waiting',
      currentRound: 0,
      totalRounds: game.totalRounds || 5,
      timePerRound: game.timePerRound || 60,
      createdAt: new Date().toISOString(),
      isPublic: game.isPublic !== undefined ? game.isPublic : true,
      theme: game.theme,
      difficulty: game.difficulty || 'medium',
    };
    
    if (!newGame.isPublic) {
      newGame.gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // In a real app, we would add this to the database
    // For mock, we'll just return it
    return newGame;
  },
  
  // Join game
  joinGame: async (gameId: string): Promise<{ success: boolean; game?: MockGame; message?: string }> => {
    await randomDelay();
    
    const publicGame = mockPublicGames.find(g => g.id === gameId);
    const privateGame = mockPrivateGames.find(g => g.id === gameId);
    const game = publicGame || privateGame;
    
    if (!game) {
      return {
        success: false,
        message: 'Game not found',
      };
    }
    
    if (game.players.length >= game.maxPlayers) {
      return {
        success: false,
        message: 'Game is full',
      };
    }
    
    if (game.status !== 'waiting') {
      return {
        success: false,
        message: 'Game has already started',
      };
    }
    
    // Add player to game
    const updatedGame = {
      ...game,
      players: [
        ...game.players,
        { id: currentMockUser.id, displayName: currentMockUser.displayName, score: 0, isReady: false },
      ],
    };
    
    return {
      success: true,
      game: updatedGame,
    };
  },
  
  // Get random drawing prompt
  getRandomPrompt: async (): Promise<string> => {
    await randomDelay();
    
    const randomIndex = Math.floor(Math.random() * mockDrawingPrompts.length);
    return mockDrawingPrompts[randomIndex];
  },
};
