import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/database';
import { ENV, validateEnv } from '../config/env';

// Validate environment configuration
validateEnv();

// Create Supabase client for React Native (based on official docs)
export const supabase = createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    // Configure auth settings for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for React Native
    // Configure for email verification codes instead of magic links
    flowType: 'pkce',
    // Use AsyncStorage for proper session persistence in React Native
    storage: AsyncStorage,
  },
});

// Auth configuration for email verification codes
export const authConfig = {
  // Email OTP configuration
  emailOtp: {
    // 6-digit verification code
    codeLength: 6,
    // Code expires in 10 minutes
    expirationTime: 10 * 60 * 1000,
    // Rate limiting: 1 request per minute
    rateLimitWindow: 60 * 1000,
  },

  // Google OAuth configuration
  googleOAuth: {
    // iOS client ID
    iosClientId: ENV.GOOGLE_OAUTH.IOS_CLIENT_ID,
    // Android client ID
    androidClientId: ENV.GOOGLE_OAUTH.ANDROID_CLIENT_ID,
    // Web client ID (for React Native with Supabase)
    webClientId: ENV.GOOGLE_OAUTH.WEB_CLIENT_ID,
    // Redirect URL
    redirectUrl: ENV.GOOGLE_OAUTH.REDIRECT_URL,
  },
};

// Export types for TypeScript support
export type SupabaseClient = typeof supabase;
export type { Database };
