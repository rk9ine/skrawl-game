// Mock game data
export interface MockGame {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  players: {
    id: string;
    displayName: string;
    score: number;
    isReady: boolean;
  }[];
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'completed';
  currentRound: number;
  totalRounds: number;
  timePerRound: number; // in seconds
  createdAt: string;
  gameCode?: string; // For private games
  isPublic: boolean;
  theme?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const mockPublicGames: MockGame[] = [
  {
    id: 'game-1',
    name: 'Quick Draw Challenge',
    description: 'Draw as fast as you can!',
    creatorId: 'user-2',
    players: [
      { id: 'user-2', displayName: 'JaneDoe', score: 0, isReady: true },
      { id: 'user-3', displayName: 'GuestUser', score: 0, isReady: true },
      { id: 'user-4', displayName: 'ArtLover', score: 0, isReady: false },
      { id: 'user-5', displayName: 'DrawMaster', score: 0, isReady: true },
    ],
    maxPlayers: 6,
    status: 'waiting',
    currentRound: 0,
    totalRounds: 5,
    timePerRound: 60,
    createdAt: '2025-05-15T14:30:00Z',
    isPublic: true,
    theme: 'Animals',
    difficulty: 'medium',
  },
  {
    id: 'game-2',
    name: 'Animal Sketches',
    description: 'Draw different animals from the Amazon',
    creatorId: 'user-5',
    players: [
      { id: 'user-5', displayName: 'DrawMaster', score: 12, isReady: true },
      { id: 'user-6', displayName: 'ArtisticSoul', score: 8, isReady: true },
    ],
    maxPlayers: 4,
    status: 'in-progress',
    currentRound: 2,
    totalRounds: 5,
    timePerRound: 90,
    createdAt: '2025-05-15T15:00:00Z',
    isPublic: true,
    theme: 'Amazon Wildlife',
    difficulty: 'easy',
  },
  {
    id: 'game-3',
    name: 'Landscape Challenge',
    description: 'Draw beautiful landscapes',
    creatorId: 'user-7',
    players: [
      { id: 'user-7', displayName: 'NatureLover', score: 0, isReady: true },
      { id: 'user-8', displayName: 'SkyArtist', score: 0, isReady: true },
      { id: 'user-9', displayName: 'MountainPainter', score: 0, isReady: true },
    ],
    maxPlayers: 5,
    status: 'waiting',
    currentRound: 0,
    totalRounds: 3,
    timePerRound: 120,
    createdAt: '2025-05-15T16:15:00Z',
    isPublic: true,
    theme: 'Natural Wonders',
    difficulty: 'hard',
  },
  {
    id: 'game-4',
    name: 'Character Design',
    description: 'Create unique characters',
    creatorId: 'user-10',
    players: [
      { id: 'user-10', displayName: 'CharacterArtist', score: 0, isReady: true },
    ],
    maxPlayers: 3,
    status: 'waiting',
    currentRound: 0,
    totalRounds: 4,
    timePerRound: 180,
    createdAt: '2025-05-15T17:30:00Z',
    isPublic: true,
    theme: 'Fantasy Heroes',
    difficulty: 'medium',
  },
];

export const mockPrivateGames: MockGame[] = [
  {
    id: 'private-game-1',
    name: 'Friends Only',
    description: 'A private game for friends',
    creatorId: 'user-1',
    players: [
      { id: 'user-1', displayName: 'JohnDoe', score: 0, isReady: true },
    ],
    maxPlayers: 4,
    status: 'waiting',
    currentRound: 0,
    totalRounds: 5,
    timePerRound: 90,
    createdAt: '2025-05-15T18:00:00Z',
    gameCode: 'ABC123',
    isPublic: false,
    theme: 'Anything Goes',
    difficulty: 'easy',
  },
];

// Drawing prompts for games
export const mockDrawingPrompts = [
  'Amazon River',
  'Toucan',
  'Jaguar',
  'Rainforest Canopy',
  'Waterfall',
  'Tribal Mask',
  'Exotic Flower',
  'Anaconda',
  'Tropical Fruit',
  'Indigenous Village',
  'Piranha',
  'Monkey',
  'Butterfly',
  'Tribal Pattern',
  'Jungle Path',
];
