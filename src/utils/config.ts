// Environment configuration
export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    anonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  },

  // App configuration
  app: {
    name: 'Skrawl',
    version: '1.0.0',
  },

  // API configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  },
};

export default config;
