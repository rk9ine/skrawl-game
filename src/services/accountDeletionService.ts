import { supabase } from './supabase';

export interface AccountDeletionResult {
  success: boolean;
  error?: string;
}

/**
 * Service for handling account deletion with proper cleanup
 */
export class AccountDeletionService {
  /**
   * Permanently delete a user account and all associated data
   * This operation is irreversible
   *
   * Note: This deletes the user's profile data but not the auth record.
   * The auth record will become orphaned but harmless since all profile data is gone.
   * This is a limitation of Supabase's security model - users cannot delete their own auth records.
   */
  static async deleteAccount(userId: string): Promise<AccountDeletionResult> {
    try {
      console.log('Starting account deletion process for user:', userId);

      // Step 1: Delete user profile data from the users table
      // This should cascade delete related data if foreign keys are set up properly
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        return {
          success: false,
          error: `Failed to delete profile data: ${profileError.message}`,
        };
      }

      console.log('Profile data deletion completed successfully');

      // Step 2: Delete any additional game-related data
      // Add more table deletions here as your app grows
      // Example:
      // const { error: gameError } = await supabase
      //   .from('game_sessions')
      //   .delete()
      //   .eq('user_id', userId);

      // Step 3: Sign out the user after successful deletion
      // This invalidates their session and prevents further access
      // Note: We cannot delete the auth record directly due to security restrictions
      // but signing out prevents any further access to the app
      await supabase.auth.signOut();

      console.log('User signed out successfully - account deletion complete');

      return {
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error during account deletion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Validate that a user can delete their account
   * Add any business logic checks here
   */
  static async validateAccountDeletion(userId: string): Promise<AccountDeletionResult> {
    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          error: 'User not found or already deleted',
        };
      }

      // Add any additional validation logic here
      // For example:
      // - Check if user has pending transactions
      // - Check if user is in an active game
      // - Check if user has admin privileges

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Get a summary of data that will be deleted
   * Useful for showing users what they'll lose
   */
  static async getAccountDeletionSummary(userId: string): Promise<{
    success: boolean;
    summary?: {
      profileExists: boolean;
      displayName: string | null;
      gamesPlayed: number;
      totalScore: number;
      accountAge: string;
    };
    error?: string;
  }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          display_name,
          games_played,
          total_score,
          created_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          error: 'Could not retrieve account information',
        };
      }

      // Calculate account age
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let accountAge: string;
      if (diffDays < 30) {
        accountAge = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        accountAge = `${months} month${months !== 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        accountAge = `${years} year${years !== 1 ? 's' : ''}`;
      }

      return {
        success: true,
        summary: {
          profileExists: true,
          displayName: user.display_name,
          gamesPlayed: user.games_played || 0,
          totalScore: user.total_score || 0,
          accountAge,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account summary',
      };
    }
  }
}
