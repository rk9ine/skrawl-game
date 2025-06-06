-- =====================================================
-- SKRAWL GAME - CORE TABLES
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
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
-- GAME ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('classic', 'drawing_battle')),
  max_players INTEGER DEFAULT 8,
  current_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 3,
  round_duration INTEGER DEFAULT 60, -- seconds
  current_drawer_id UUID REFERENCES users(id),
  current_word TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GAME PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  has_guessed_correctly BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- DRAWINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  drawer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  drawing_data JSONB, -- Canvas drawing data
  round_number INTEGER NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DRAWING RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS drawing_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drawing_id, user_id)
);

-- =====================================================
-- CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 50),
  is_guess BOOLEAN DEFAULT TRUE,
  is_correct_guess BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORDS TABLE (for drawing prompts)
-- =====================================================
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT UNIQUE NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEADERBOARD VIEW
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
