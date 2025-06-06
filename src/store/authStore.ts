import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, authConfig } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { AccountDeletionService } from '../services/accountDeletionService';

// User profile interface
interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  hasCompletedProfileSetup: boolean;
  usernameChangesRemaining: number;
  usernameChangeHistory: any[];
  lastUsernameChange: string | null;
  displayNameLocked: boolean;
}

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  lastUsedEmail: string | null;

  // Computed properties
  needsProfileSetup: boolean;

  // Actions
  initialize: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<{ error: any }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  updateProfile: (updates: { displayName: string; avatar: string }) => Promise<{ error: any }>;
  signOut: (clearEmail?: boolean) => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  resetUserProfile: () => Promise<void>;

  // Internal methods
  checkProfileStatus: (user: User) => Promise<void>;

  // Internal state for cleanup
  _authListener?: () => void;
}

// Configure Google Sign-In
GoogleSignin.configure({
  iosClientId: authConfig.googleOAuth.iosClientId,
  webClientId: Platform.OS === 'android' ? authConfig.googleOAuth.androidClientId : undefined,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      lastUsedEmail: null,
      needsProfileSetup: false,
      _authListener: undefined,

      // Check profile completion status
      checkProfileStatus: async (user: User) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select(`
              id,
              display_name,
              avatar_data,
              has_completed_profile_setup,
              username_changes_remaining,
              username_change_history,
              last_username_change,
              display_name_locked
            `)
            .eq('id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              // User not found in database - create default profile
              console.log('User not found in database, creating default profile');
              const profile: UserProfile = {
                id: user.id,
                email: user.email || '',
                displayName: null,
                avatar: null,
                hasCompletedProfileSetup: false,
                usernameChangesRemaining: 1,
                usernameChangeHistory: [],
                lastUsernameChange: null,
                displayNameLocked: false,
              };

              set({
                profile,
                needsProfileSetup: true
              });
            } else {
              // Other database error - log and create fallback profile
              console.error('Profile check error:', error);
              const profile: UserProfile = {
                id: user.id,
                email: user.email || '',
                displayName: null,
                avatar: null,
                hasCompletedProfileSetup: false,
                usernameChangesRemaining: 1,
                usernameChangeHistory: [],
                lastUsernameChange: null,
                displayNameLocked: false,
              };

              set({
                profile,
                needsProfileSetup: true
              });
            }
            return;
          }

          const profile: UserProfile = {
            id: user.id,
            email: user.email || '',
            displayName: data?.display_name || null,
            avatar: data?.avatar_data || null,
            hasCompletedProfileSetup: data?.has_completed_profile_setup || false,
            usernameChangesRemaining: data?.username_changes_remaining || 1,
            usernameChangeHistory: data?.username_change_history || [],
            lastUsernameChange: data?.last_username_change || null,
            displayNameLocked: data?.display_name_locked || false,
          };

          // Update profile and needsProfileSetup state
          set({
            profile,
            needsProfileSetup: !profile.hasCompletedProfileSetup
          });
        } catch (error) {
          console.error('Profile status check failed:', error);
          // Create fallback profile on any error
          const profile: UserProfile = {
            id: user.id,
            email: user.email || '',
            displayName: null,
            avatar: null,
            hasCompletedProfileSetup: false,
            usernameChangesRemaining: 1,
            usernameChangeHistory: [],
            lastUsernameChange: null,
            displayNameLocked: false,
          };

          set({
            profile,
            needsProfileSetup: true
          });
        }
      },

      // Initialize auth state
      initialize: async () => {
        try {
          // Prevent multiple initializations
          const { isInitialized } = get();
          if (isInitialized) {
            console.log('Auth already initialized, skipping...');
            return;
          }

          // Clean up any existing auth listener
          const currentListener = get()._authListener;
          if (currentListener) {
            currentListener();
          }

          // Get current session
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            // Check profile status
            await get().checkProfileStatus(session.user);
          }

          const { user, profile } = get();
          set({
            session,
            user: session?.user ?? null,
            isInitialized: true,
            needsProfileSetup: !!(session?.user && (!profile || !profile.hasCompletedProfileSetup))
          });

          // Set up auth state change listener (only once)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);

            try {
              if (session?.user) {
                // checkProfileStatus will handle updating profile and needsProfileSetup
                await get().checkProfileStatus(session.user);
                // Update session and user after profile check
                set({
                  session,
                  user: session.user
                });
              } else {
                // No session - clear everything
                set({
                  session: null,
                  user: null,
                  profile: null,
                  needsProfileSetup: false
                });
              }
            } catch (error) {
              console.error('Auth state change error:', error);
              // Ensure we still update the session state even if profile check fails
              set({
                session,
                user: session?.user ?? null
              });
            }
          });

          // Store the cleanup function
          set({ _authListener: () => subscription.unsubscribe() });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isInitialized: true });
        }
      },

      // Send email OTP
      sendEmailOtp: async (email: string) => {
        set({ isLoading: true });

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });

        // Save email for future use if OTP was sent successfully
        if (!error) {
          set({ lastUsedEmail: email });
        }

        set({ isLoading: false });
        return { error };
      },

      // Verify email OTP
      verifyEmailOtp: async (email: string, token: string) => {
        set({ isLoading: true });

        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        set({ isLoading: false });
        return { error };
      },

      // Google Sign-in
      signInWithGoogle: async () => {
        set({ isLoading: true });

        try {
          // Check if Google Play Services are available
          await GoogleSignin.hasPlayServices();

          // Get Google user info
          const userInfo = await GoogleSignin.signIn();

          if (!userInfo.data?.idToken) {
            set({ isLoading: false });
            return {
              error: new Error('Failed to get Google ID token')
            };
          }

          // Sign in with Supabase using Google ID token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: userInfo.data.idToken,
          });

          if (error) {
            set({ isLoading: false });
            return { error };
          }

          // Profile status will be checked by the auth state change listener
          set({ isLoading: false });
          return { error: null };
        } catch (error) {
          console.error('Google sign-in error:', error);
          set({ isLoading: false });
          return { error: error as Error };
        }
      },

      // Update user profile
      updateProfile: async (updates: { displayName: string; avatar: string }) => {
        set({ isLoading: true });

        const { user } = get();
        if (!user) {
          set({ isLoading: false });
          return { error: new Error('No user found') };
        }

        try {
          // Update profile in database
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              display_name: updates.displayName,
              avatar_data: updates.avatar,
              has_completed_profile_setup: true,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            set({ isLoading: false });
            return { error };
          }

          // Update local profile state
          set({
            profile: {
              id: user.id,
              email: user.email || '',
              displayName: updates.displayName,
              avatar: updates.avatar,
              hasCompletedProfileSetup: true,
              usernameChangesRemaining: 1, // Default for new profiles
              usernameChangeHistory: [],
              lastUsernameChange: null,
              displayNameLocked: false,
            },
            needsProfileSetup: false,
            isLoading: false
          });

          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error };
        }
      },

      // Sign out
      signOut: async (clearEmail = false) => {
        set({ isLoading: true });

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
          await supabase.auth.signOut();

          set({
            profile: null,
            needsProfileSetup: false,
            isLoading: false,
            // Optionally clear remembered email
            ...(clearEmail && { lastUsedEmail: null }),
          });
        } catch (error) {
          console.error('Error signing out:', error);
          set({ isLoading: false });
        }
      },

      // Delete account permanently
      deleteAccount: async () => {
        set({ isLoading: true });

        const { user } = get();
        if (!user) {
          set({ isLoading: false });
          return { error: new Error('No user found') };
        }

        try {
          // Validate account deletion
          const validation = await AccountDeletionService.validateAccountDeletion(user.id);
          if (!validation.success) {
            set({ isLoading: false });
            return { error: new Error(validation.error) };
          }

          // Perform account deletion
          const result = await AccountDeletionService.deleteAccount(user.id);

          if (!result.success) {
            set({ isLoading: false });
            return { error: new Error(result.error) };
          }

          // Clear all local state
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            needsProfileSetup: false,
            lastUsedEmail: null,
          });

          return { error: null };
        } catch (error) {
          console.error('Error deleting account:', error);
          set({ isLoading: false });
          return { error: error as Error };
        }
      },

      // Reset user profile (existing function)
      resetUserProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          // Reset profile setup status
          const { error } = await supabase
            .from('users')
            .update({
              has_completed_profile_setup: false,
              display_name: null,
              avatar_data: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            console.error('Error resetting profile:', error);
            return;
          }

          // Update local state
          set({
            profile: {
              id: user.id,
              email: user.email || '',
              displayName: null,
              avatar: null,
              hasCompletedProfileSetup: false,
              usernameChangesRemaining: 1,
              usernameChangeHistory: [],
              lastUsernameChange: null,
              displayNameLocked: false,
            },
            needsProfileSetup: true,
          });
        } catch (error) {
          console.error('Error resetting profile:', error);
        }
      },

    }),
    {
      name: 'skrawl-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        profile: state.profile,
        lastUsedEmail: state.lastUsedEmail
      }),
    }
  )
);
