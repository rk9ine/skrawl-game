// Profile management types for username change system

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  hasCompletedProfileSetup: boolean;
  usernameChangesRemaining: number;
  usernameChangeHistory: UsernameChange[];
  lastUsernameChange: string | null;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsernameChange {
  oldName: string;
  newName: string;
  changedAt: string;
  reason?: 'initial_setup' | 'user_request' | 'admin_action';
}

export interface UsernameChangeRequest {
  newDisplayName: string;
  useToken?: boolean; // For premium currency system
}

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

// Username change policies
export const USERNAME_POLICIES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  ALLOWED_CHARACTERS: /^[a-zA-Z0-9_-]+$/,
  COOLDOWN_HOURS: 24 * 7, // 1 week cooldown
  PROFANITY_CHECK: true,
  UNIQUENESS_CHECK: true,
} as const;

// Username change approaches
export type UsernameChangeApproach = 
  | 'token_system'      // Clash of Clans style - premium currency
  | 'one_time_only'     // Among Us style - single change allowed
  | 'cooldown_system'   // Discord style - time-based restrictions
  | 'verification_required' // Fortnite style - email/phone verification
  | 'progressive_cost'; // Increasing cost for each change

export interface UsernameChangeConfig {
  approach: UsernameChangeApproach;
  freeChanges: number;
  cooldownHours?: number;
  requiresVerification?: boolean;
  costProgression?: number[]; // Cost for 1st, 2nd, 3rd change etc.
}
