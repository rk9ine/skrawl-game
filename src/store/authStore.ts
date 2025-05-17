import { create } from 'zustand';
import { MockUser } from '../mock';
import { authApi } from '../services/mockApi';

interface AuthState {
  user: MockUser | null;
  isLoading: boolean;
  isSkipped: boolean;

  // Auth actions
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  skipAuth: () => void;

  // Session management
  setUser: (user: MockUser | null) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isSkipped: false,

  signInWithEmail: async (email: string) => {
    try {
      const response = await authApi.signInWithEmail(email);

      if (response.success) {
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
        set({ user: response.user, isLoading: false });
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  },

  signOut: async () => {
    try {
      await authApi.signOut();
      set({ user: null, isSkipped: false });
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

      // In mock mode, we'll just set isLoading to false
      // In a real app, we would check for a valid session
      set({ isLoading: false });

      // Optionally, you can uncomment this to simulate a logged-in user
      // const user = await authApi.getCurrentUser();
      // set({ user, isLoading: false });
    } catch (error) {
      console.error('Error checking session:', error);
      set({ isLoading: false });
    }
  },
}));
