/**
 * Supabase client for WebSocket server
 * Uses service role key for server-side operations
 */

import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Load environment variables first - ensure this happens before any other imports
dotenv.config();

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

class SupabaseService {
  private client: SupabaseClient;
  private serviceRoleKey: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.serviceRoleKey = serviceRoleKey;
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Supabase client initialized for WebSocket server');
  }

  /**
   * Validate JWT token from React Native client
   */
  async validateUserToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      // Verify JWT token using Supabase
      const { data: { user }, error } = await this.client.auth.getUser(token);
      
      if (error || !user) {
        return { valid: false, error: error?.message || 'Invalid token' };
      }

      return { valid: true, userId: user.id };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, error: 'Token validation failed' };
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select(`
          id,
          email,
          display_name,
          avatar_data,
          has_completed_profile_setup,
          username_changes_remaining,
          total_score,
          total_games_played,
          total_wins,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Create a new game session
   */
  async createGameSession(roomId: string, hostId: string | null, gameMode: 'public' | 'private', settings: any): Promise<string | null> {
    try {
      const { data, error } = await this.client
        .from('game_sessions')
        .insert({
          room_id: roomId,
          host_id: hostId,
          game_mode: gameMode,
          settings: settings,
          status: 'waiting'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating game session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in createGameSession:', error);
      return null;
    }
  }

  /**
   * Update game session status
   */
  async updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating game session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateGameSession:', error);
      return false;
    }
  }

  /**
   * Add player to game session
   */
  async addPlayerToSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('game_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          score: 0
        });

      if (error) {
        console.error('Error adding player to session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addPlayerToSession:', error);
      return false;
    }
  }

  /**
   * Update player statistics after game
   */
  async updatePlayerStats(userId: string, gameStats: {
    scoreEarned: number;
    gameWon: boolean;
    correctGuesses: number;
    wordsDrawn: number;
    successfulDrawings: number;
  }): Promise<boolean> {
    try {
      // Get current stats
      const { data: currentStats, error: fetchError } = await this.client
        .from('users')
        .select('total_score, games_played, games_won')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError);
        return false;
      }

      // Calculate new stats
      const newTotalScore = (currentStats.total_score || 0) + gameStats.scoreEarned;
      const newGamesPlayed = (currentStats.games_played || 0) + 1;
      const newGamesWon = (currentStats.games_won || 0) + (gameStats.gameWon ? 1 : 0);

      // Update stats
      const { error: updateError } = await this.client
        .from('users')
        .update({
          total_score: newTotalScore,
          games_played: newGamesPlayed,
          games_won: newGamesWon,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating player stats:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePlayerStats:', error);
      return false;
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select(`
          id,
          display_name,
          avatar_data,
          total_score,
          total_games_played,
          total_wins
        `)
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
  }

  /**
   * Save game round data
   */
  async saveGameRound(sessionId: string, roundNumber: number, drawerId: string, word: string, scores: { [userId: string]: number }): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('game_rounds')
        .insert({
          session_id: sessionId,
          round_number: roundNumber,
          drawer_id: drawerId,
          word: word,
          scores: scores,
          ended_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving game round:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveGameRound:', error);
      return false;
    }
  }

  /**
   * Get client instance for specific operations
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
export default supabaseService;
