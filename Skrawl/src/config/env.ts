// Environment configuration for Skrawl app
// Values are loaded from .env file using Expo's environment variable system

export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rtvqfvaprpovtcmtyqht.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  // App Environment
  NODE_ENV: __DEV__ ? 'development' : 'production',
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',

  // WebSocket Server Configuration
  WEBSOCKET_URL: __DEV__
    ? (process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'ws://192.168.0.15:3001')
    : (process.env.EXPO_PUBLIC_WEBSOCKET_URL_PROD || 'wss://your-production-server.com'),

  // Google OAuth Configuration
  GOOGLE_OAUTH: {
    IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '521406618633-qnlvheehuo39v8kojplskov57n52a3sh.apps.googleusercontent.com',
    ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '521406618633-3k31rl0mpfamqmacr9tgslb57nf9ucgg.apps.googleusercontent.com',
    WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '521406618633-mief1kv08aur34v74dsi2fricdjsfas3.apps.googleusercontent.com',
    REDIRECT_URL: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URL || 'skrawl://auth/callback',
  },

  // API Configuration
  API: {
    TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
    RETRY_ATTEMPTS: 3,
  },

  // Real-time and WebSocket configurations removed - will be reimplemented with new backend
};

// Validation function to ensure required environment variables are set
export const validateEnv = (): boolean => {
  const requiredVars = [
    { key: 'SUPABASE_URL', value: ENV.SUPABASE_URL },
    { key: 'SUPABASE_ANON_KEY', value: ENV.SUPABASE_ANON_KEY },
  ];

  const missing = requiredVars.filter(({ value }) => {
    return !value || value === 'your_supabase_anon_key_here' || value === '';
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.map(v => v.key));
    console.error('Please update your .env file with your Supabase credentials');
    console.error('Copy .env.example to .env and fill in your values');
    return false;
  }

  console.log('✅ Environment configuration validated');
  return true;
};

export default ENV;
