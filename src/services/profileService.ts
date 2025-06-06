import { supabase } from './supabase';
import { UserProfile, UsernameChangeRequest, UsernameValidationResult } from '../types/profile';

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
  profile?: UserProfile;
}

export interface UsernameChangeResult {
  success: boolean;
  error?: string;
  oldName?: string;
  newName?: string;
  changesRemaining?: number;
  locked?: boolean;
}

export class ProfileService {
  /**
   * Get current user's profile with username change status
   */
  static async getCurrentProfile(userId: string): Promise<ProfileUpdateResult> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          avatar_data,
          has_completed_profile_setup,
          username_changes_remaining,
          username_change_history,
          last_username_change,
          display_name_locked,
          total_score,
          games_played,
          games_won,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        avatar: data.avatar_data,
        hasCompletedProfileSetup: data.has_completed_profile_setup,
        usernameChangesRemaining: data.username_changes_remaining,
        usernameChangeHistory: data.username_change_history || [],
        lastUsernameChange: data.last_username_change,
        totalScore: data.total_score,
        gamesPlayed: data.games_played,
        gamesWon: data.games_won,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return { success: true, profile };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch profile' 
      };
    }
  }

  /**
   * Validate username change before attempting
   */
  static async validateUsernameChange(
    userId: string, 
    newDisplayName: string
  ): Promise<UsernameValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_username_change', {
        user_id: userId,
        new_display_name: newDisplayName.trim()
      });

      if (error) {
        return { 
          isValid: false, 
          error: error.message 
        };
      }

      return {
        isValid: data.valid,
        error: data.error || undefined
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      };
    }
  }

  /**
   * Change username (with validation and tracking)
   */
  static async changeUsername(
    userId: string, 
    request: UsernameChangeRequest
  ): Promise<UsernameChangeResult> {
    try {
      const { data, error } = await supabase.rpc('change_username', {
        user_id: userId,
        new_display_name: request.newDisplayName.trim()
      });

      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      if (!data.success) {
        return { 
          success: false, 
          error: data.error || 'Username change failed' 
        };
      }

      return {
        success: true,
        oldName: data.old_name,
        newName: data.new_name,
        changesRemaining: data.changes_remaining,
        locked: data.locked
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Username change failed' 
      };
    }
  }

  /**
   * Update avatar (unlimited changes allowed)
   */
  static async updateAvatar(userId: string, avatarData: string): Promise<ProfileUpdateResult> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          avatar_data: avatarData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update avatar' 
      };
    }
  }

  /**
   * Get username suggestions if current choice is taken
   */
  static generateUsernameSuggestions(baseName: string): string[] {
    const suggestions: string[] = [];
    const cleanBase = baseName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Add numbers
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${cleanBase}${i}`);
    }
    
    // Add common suffixes
    const suffixes = ['_pro', '_gamer', '_artist', '_master', '_ace'];
    suffixes.forEach(suffix => {
      if (cleanBase.length + suffix.length <= 20) {
        suggestions.push(`${cleanBase}${suffix}`);
      }
    });
    
    return suggestions.slice(0, 5); // Return max 5 suggestions
  }

  /**
   * Check if username is available (client-side check)
   */
  static async isUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .ilike('display_name', username)
        .neq('id', currentUserId)
        .limit(1);

      if (error) {
        console.error('Error checking username availability:', error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }
}
