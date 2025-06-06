-- =====================================================
-- SKRAWL GAME - QUICK SETUP (MINIMAL FOR TESTING)
-- =====================================================
-- Run this file first to get your profile setup working immediately
-- Then run the other files when you're ready for full game features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (ESSENTIAL FOR PROFILE SETUP)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_type TEXT CHECK (avatar_type IN ('emoji', 'gif', 'icon')),
  avatar_data TEXT,
  has_completed_profile_setup BOOLEAN DEFAULT FALSE,
  total_games_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BASIC SECURITY FOR USERS TABLE
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles for leaderboard" ON users
FOR SELECT USING (has_completed_profile_setup = TRUE);

-- =====================================================
-- BASIC LEADERBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.display_name,
  u.avatar_type,
  u.avatar_data,
  u.total_games_played,
  u.total_wins,
  u.total_score,
  CASE 
    WHEN u.total_games_played > 0 
    THEN ROUND((u.total_wins::DECIMAL / u.total_games_played::DECIMAL) * 100, 1)
    ELSE 0 
  END as win_percentage
FROM users u
WHERE u.has_completed_profile_setup = TRUE
ORDER BY u.total_score DESC, u.total_wins DESC, u.total_games_played DESC;

-- =====================================================
-- UPDATED_AT TRIGGER FOR USERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🎉 Skrawl Quick Setup Complete!';
  RAISE NOTICE '✅ Users table created with security policies';
  RAISE NOTICE '✅ Profile setup should now work in your app';
  RAISE NOTICE '📝 Run the other SQL files when ready for full game features:';
  RAISE NOTICE '   - 01-tables.sql (game rooms, drawings, chat)';
  RAISE NOTICE '   - 02-security.sql (additional security policies)';
  RAISE NOTICE '   - 03-functions.sql (game logic functions)';
  RAISE NOTICE '   - 04-sample-data.sql (drawing words)';
  RAISE NOTICE '   - 05-indexes.sql (performance optimization)';
END $$;
