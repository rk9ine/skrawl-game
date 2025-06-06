import { supabase, authConfig } from './supabase';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Conditionally import Google Sign-In only when available
let GoogleSignin: any = null;
try {
  if (Platform.OS === 'android') {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  }
} catch (error) {
  console.log('Google Sign-In not available on this platform');
}

// Configure Google Sign-In only if available
if (GoogleSignin && Platform.OS === 'android') {
  GoogleSignin.configure({
    iosClientId: authConfig.googleOAuth.iosClientId,
    webClientId: authConfig.googleOAuth.webClientId, // Use web client ID for both platforms
  });
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | Error | null;
}

export interface AuthService {
  // Email authentication with OTP
  sendEmailOtp(email: string): Promise<{ error: AuthError | Error | null }>;
  verifyEmailOtp(email: string, token: string): Promise<AuthResult>;
  
  // Google authentication
  signInWithGoogle(): Promise<AuthResult>;
  
  // Session management
  signOut(): Promise<{ error: AuthError | Error | null }>;
  getCurrentUser(): User | null;
  getCurrentSession(): Session | null;
  
  // Auth state changes
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void;
  
  // Profile management
  updateUserProfile(updates: {
    displayName?: string;
    avatar?: string;
    avatarData?: string;
  }): Promise<{ error: AuthError | Error | null }>;
  
  // Profile completion check
  checkProfileCompletion(userId: string): Promise<{ completed: boolean; error: AuthError | Error | null }>;
}

class SupabaseAuthService implements AuthService {
  private rateLimitMap = new Map<string, number>();

  // Rate limiting for email OTP requests
  private isRateLimited(email: string): boolean {
    const lastRequest = this.rateLimitMap.get(email);
    const now = Date.now();
    
    if (lastRequest && (now - lastRequest) < authConfig.emailOtp.rateLimitWindow) {
      return true;
    }
    
    this.rateLimitMap.set(email, now);
    return false;
  }

  async sendEmailOtp(email: string): Promise<{ error: AuthError | Error | null }> {
    try {
      // Check rate limiting
      if (this.isRateLimited(email)) {
        return {
          error: new Error('Too many requests. Please wait before requesting another code.')
        };
      }

      // Try using the OTP method that forces codes instead of magic links
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          // Force OTP by not providing emailRedirectTo
        }
      });

      if (error) {
        console.error('Supabase OTP error:', error);
        return { error };
      }

      console.log('OTP sent successfully to:', email);
      return { error: null };
    } catch (error) {
      console.error('Error sending email OTP:', error);
      return { error: error as Error };
    }
  }

  async verifyEmailOtp(email: string, token: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        return { user: null, session: null, error };
      }

      // If this is a new user, create their profile record
      if (data.user && data.session) {
        await this.ensureUserProfile(data.user);
      }

      return {
        user: data.user,
        session: data.session,
        error: null
      };
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      return { user: null, session: null, error: error as Error };
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    // Check if Google Sign-In is available
    if (!GoogleSignin || Platform.OS !== 'android') {
      return {
        user: null,
        session: null,
        error: new Error('Google Sign-In is not available on this platform. Please use email authentication.')
      };
    }

    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Get Google user info
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        return {
          user: null,
          session: null,
          error: new Error('Failed to get Google ID token')
        };
      }

      // Sign in with Supabase using Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      // If this is a new user, create their profile record
      if (data.user && data.session) {
        await this.ensureUserProfile(data.user);
      }

      return {
        user: data.user,
        session: data.session,
        error: null
      };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { user: null, session: null, error: error as Error };
    }
  }

  async signOut(): Promise<{ error: AuthError | Error | null }> {
    try {
      // Only attempt Google sign out if GoogleSignin is properly configured and available
      try {
        if (GoogleSignin && typeof GoogleSignin.isSignedIn === 'function') {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
          }
        }
      } catch (googleError) {
        // Ignore Google sign out errors - user might not have signed in with Google
        console.log('Google sign out not needed or failed:', googleError);
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as Error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }
      return data.session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  async getSession(): Promise<{ data: { session: Session | null }, error: any }> {
    try {
      const result = await supabase.auth.getSession();

      // Additional validation - check if session is actually valid
      if (result.data.session) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = result.data.session.expires_at || 0;

        if (now >= expiresAt) {
          console.log('⚠️ Session expired, attempting refresh...');
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            console.log('❌ Session refresh failed');
            return { data: { session: null }, error: refreshError };
          }
          console.log('✅ Session refreshed successfully');
          return { data: { session: refreshData.session }, error: null };
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting session:', error);
      return { data: { session: null }, error };
    }
  }

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null, session);
    });

    return () => subscription.unsubscribe();
  }

  async updateUserProfile(updates: {
    displayName?: string;
    avatar?: string;
    avatarData?: string;
  }): Promise<{ error: AuthError | Error | null }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return { error: new Error('No authenticated user') };
      }

      const { error } = await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          avatar_type: updates.avatar ? 'emoji' : null,
          avatar_data: updates.avatarData || updates.avatar,
          has_completed_profile_setup: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.data.user.id);

      return { error };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { error: error as Error };
    }
  }

  async checkProfileCompletion(userId: string): Promise<{ completed: boolean; error: AuthError | Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('has_completed_profile_setup, display_name')
        .eq('id', userId)
        .single();

      if (error) {
        return { completed: false, error };
      }

      const completed = data?.has_completed_profile_setup && !!data?.display_name;
      return { completed, error: null };
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return { completed: false, error: error as Error };
    }
  }

  async getFullUserProfile(userId: string): Promise<{
    completed: boolean;
    profileData: any | null;
    error: AuthError | Error | null
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { completed: false, profileData: null, error };
      }

      const completed = data?.has_completed_profile_setup && !!data?.display_name;
      return { completed, profileData: data, error: null };
    } catch (error) {
      console.error('Error getting full user profile:', error);
      return { completed: false, profileData: null, error: error as Error };
    }
  }

  // Private helper to ensure user profile exists
  private async ensureUserProfile(user: User): Promise<void> {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || null,
            has_completed_profile_setup: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService();
