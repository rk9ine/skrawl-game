/**
 * Supabase client for WebSocket server
 * Uses service role key for server-side operations
 */
import { SupabaseClient } from '@supabase/supabase-js';
interface UserProfile {
    id: string;
    email: string;
    display_name: string;
    avatar_data?: any;
    has_completed_profile_setup: boolean;
    username_changes_remaining: number;
    total_score: number;
    total_games_played: number;
    total_wins: number;
    created_at: string;
    updated_at: string;
}
interface GameSession {
    id: string;
    room_id: string;
    host_id?: string;
    game_mode: 'public' | 'private';
    settings: any;
    status: string;
    created_at: string;
    started_at?: string;
    ended_at?: string;
}
interface LeaderboardEntry {
    id: string;
    display_name: string;
    avatar_data?: any;
    total_score: number;
    total_games_played: number;
    total_wins: number;
}
declare class SupabaseService {
    private client;
    private serviceRoleKey;
    constructor();
    /**
     * Validate JWT token from React Native client
     */
    validateUserToken(token: string): Promise<{
        valid: boolean;
        userId?: string;
        error?: string;
    }>;
    /**
     * Get user profile by ID
     */
    getUserProfile(userId: string): Promise<UserProfile | null>;
    /**
     * Create a new game session
     */
    createGameSession(roomId: string, hostId: string | null, gameMode: 'public' | 'private', settings: any): Promise<string | null>;
    /**
     * Update game session status
     */
    updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<boolean>;
    /**
     * Add player to game session
     */
    addPlayerToSession(sessionId: string, userId: string): Promise<boolean>;
    /**
     * Update player statistics after game
     */
    updatePlayerStats(userId: string, gameStats: {
        scoreEarned: number;
        gameWon: boolean;
        correctGuesses: number;
        wordsDrawn: number;
        successfulDrawings: number;
    }): Promise<boolean>;
    /**
     * Get leaderboard data
     */
    getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
    /**
     * Save game round data
     */
    saveGameRound(sessionId: string, roundNumber: number, drawerId: string, word: string, scores: {
        [userId: string]: number;
    }): Promise<boolean>;
    /**
     * Get client instance for specific operations
     */
    getClient(): SupabaseClient;
}
export declare const supabaseService: SupabaseService;
export default supabaseService;
//# sourceMappingURL=supabaseClient.d.ts.map