// Mock user data
export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  avatar?: string; // Emoji avatar
  createdAt: string;
  hasCompletedProfileSetup?: boolean; // Flag to track if user has completed profile setup
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    drawingsCreated: number;
  };
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'johndoe@example.com',
    displayName: 'JohnDoe',
    avatarUrl: null,
    createdAt: '2025-01-15T10:30:00Z',
    stats: {
      gamesPlayed: 42,
      gamesWon: 18,
      drawingsCreated: 56,
    },
  },
  {
    id: 'user-2',
    email: 'janedoe@example.com',
    displayName: 'JaneDoe',
    avatarUrl: null,
    createdAt: '2025-02-20T14:45:00Z',
    stats: {
      gamesPlayed: 36,
      gamesWon: 22,
      drawingsCreated: 48,
    },
  },
  {
    id: 'user-3',
    email: 'guest@example.com',
    displayName: 'GuestUser',
    avatarUrl: null,
    createdAt: '2025-03-10T09:15:00Z',
    stats: {
      gamesPlayed: 12,
      gamesWon: 3,
      drawingsCreated: 15,
    },
  },
];

// Current mock user (simulates the logged-in user)
export const currentMockUser: MockUser = mockUsers[0];
