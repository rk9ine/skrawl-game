import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockUser } from '../mock';
import { authApi } from '../services/mockApi';

interface AuthState {
  user: MockUser | null;
  isLoading: boolean;
  isSkipped: boolean;
  // Store preserved profile data when user signs out
  preservedProfileData?: {
    displayName: string;
    avatar?: string;
    hasCompletedProfileSetup: boolean;
  };

  // Auth actions
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  skipAuth: () => void;

  // Session management
  setUser: (user: MockUser | null) => void;
  checkSession: () => Promise<void>;

  // Profile management
  updateUserProfile: (profileData: Partial<MockUser>) => void;
  resetUserProfile: () => void;
  hasCompletedProfileSetup: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  isLoading: true,
  isSkipped: false,
  preservedProfileData: undefined,

  signInWithEmail: async (email: string) => {
    try {
      const response = await authApi.signInWithEmail(email);

      if (response.success) {
        // Get the current state to check if we have any persisted profile data
        const currentState = get();

        // If we have preserved profile data from a previous session, use it
        if (currentState.preservedProfileData) {
          console.log('Found preserved profile data for email login:', currentState.preservedProfileData);

          // If we have a user, update with preserved profile data
          if (currentState.user) {
            set({
              user: {
                ...currentState.user,
                displayName: currentState.preservedProfileData.displayName,
                avatar: currentState.preservedProfileData.avatar,
                hasCompletedProfileSetup: currentState.preservedProfileData.hasCompletedProfileSetup
              },
              preservedProfileData: undefined // Clear preserved data
            });
          }
        } else {
          // For new users, set hasCompletedProfileSetup to false to trigger profile setup
          if (currentState.user) {
            const username = email.split('@')[0] || 'User';

            set({
              user: {
                ...currentState.user,
                displayName: username,
                hasCompletedProfileSetup: false // Set to false to trigger profile setup
              }
            });

            console.log('Email login: New user, profile setup required:', {
              displayName: username,
              hasCompletedProfileSetup: false
            });
          }
        }

        return { error: null };
      } else {
        return { error: new Error(response.message) };
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { error: error as Error };
    }
  },

  signInWithGoogle: async () => {
    try {
      const response = await authApi.signInWithGoogle();

      if (response.success && response.user) {
        // Get the current state to check if we have any persisted profile data
        const currentState = get();
        console.log('Current state before sign in:', currentState);

        // Check if we have preserved profile data from a previous session
        if (currentState.preservedProfileData) {
          console.log('Found preserved profile data:', currentState.preservedProfileData);

          // Merge the new user data with the preserved profile data
          set({
            user: {
              ...response.user,
              displayName: currentState.preservedProfileData.displayName || response.user.displayName,
              avatar: currentState.preservedProfileData.avatar || response.user.avatar,
              hasCompletedProfileSetup: currentState.preservedProfileData.hasCompletedProfileSetup
            },
            isLoading: false,
            // Clear the preserved profile data since we've used it
            preservedProfileData: undefined
          });
        }
        // If no preserved data but we have user data with hasCompletedProfileSetup
        else if (currentState.user && currentState.user.hasCompletedProfileSetup) {
          console.log('Using existing profile data from current session:', {
            displayName: currentState.user.displayName,
            avatar: currentState.user.avatar,
            hasCompletedProfileSetup: currentState.user.hasCompletedProfileSetup
          });

          // Merge the new user data with the existing profile data
          set({
            user: {
              ...response.user,
              displayName: currentState.user.displayName || response.user.displayName,
              avatar: currentState.user.avatar || response.user.avatar,
              hasCompletedProfileSetup: currentState.user.hasCompletedProfileSetup
            },
            isLoading: false
          });
        } else {
          // For new users, set hasCompletedProfileSetup to false to trigger profile setup
          const username = response.user.email?.split('@')[0] || 'User';
          console.log('New Google user, profile setup required:', {
            displayName: username,
            hasCompletedProfileSetup: false
          });

          set({
            user: {
              ...response.user,
              displayName: username,
              hasCompletedProfileSetup: false // Set to false to trigger profile setup
            },
            isLoading: false
          });
        }
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  },

  signOut: async () => {
    try {
      await authApi.signOut();

      // Get the current user data before signing out
      const currentState = get();
      const userData = currentState.user;

      console.log('Signing out, current user data:', userData);

      // If the user has completed profile setup, preserve that data
      if (userData && userData.hasCompletedProfileSetup) {
        const profileData = {
          displayName: userData.displayName,
          avatar: userData.avatar,
          hasCompletedProfileSetup: userData.hasCompletedProfileSetup
        };
        console.log('Preserving profile data for next sign-in:', profileData);

        // Store the profile data in the preservedProfileData field
        // and set user to null
        set({
          user: null,
          isSkipped: false,
          preservedProfileData: profileData
        });
      } else {
        // Just set user to null
        set({
          user: null,
          isSkipped: false
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  skipAuth: () => {
    set({ isSkipped: true });
  },

  setUser: (user) => {
    set({
      user,
      isLoading: false,
    });
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });

      // Simulate a short delay to mimic a real API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the current state to check if we have any persisted data
      const currentState = get();
      console.log('Checking session, current state:', currentState);

      // Just set isLoading to false
      // The user and preservedProfileData are already loaded from AsyncStorage
      set({ isLoading: false });
    } catch (error) {
      console.error('Error checking session:', error);
      set({ isLoading: false });
    }
  },

  // Profile management methods
  updateUserProfile: (profileData) => {
    const { user } = get();
    if (user) {
      // Update user profile with new data
      set({
        user: {
          ...user,
          ...profileData,
        },
      });
    }
  },

  resetUserProfile: () => {
    const { user } = get();
    if (user) {
      // Reset profile data and set hasCompletedProfileSetup to false
      // to trigger the profile setup screen
      const username = user.email?.split('@')[0] || 'User';
      set({
        user: {
          ...user,
          displayName: username,
          avatar: undefined, // Clear avatar
          hasCompletedProfileSetup: false, // Set to false to trigger profile setup
        },
      });

      console.log('Profile reset, setup required:', {
        displayName: username,
        avatar: undefined,
        hasCompletedProfileSetup: false
      });
    }
  },

  hasCompletedProfileSetup: () => {
    const { user } = get();

    // If user doesn't exist, return false
    if (!user) return false;

    // For new users, hasCompletedProfileSetup might be undefined
    // We want to explicitly check if it's true
    // If it's undefined or false, we should return false
    return user.hasCompletedProfileSetup === true;
  },
}),
    {
      name: 'skrawl-user-data',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        isSkipped: state.isSkipped,
        preservedProfileData: state.preservedProfileData,
      }),
    }
  )
);
