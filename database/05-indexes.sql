-- =====================================================
-- SKRAWL GAME - PERFORMANCE INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_profile_setup ON users(has_completed_profile_setup);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score);

-- Game rooms indexes
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_room_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host_id ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_game_mode ON game_rooms(game_mode);

-- Game participants indexes
CREATE INDEX IF NOT EXISTS idx_game_participants_room_id ON game_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_user_id ON game_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_score ON game_participants(score);

-- Drawings indexes
CREATE INDEX IF NOT EXISTS idx_drawings_room_id ON drawings(room_id);
CREATE INDEX IF NOT EXISTS idx_drawings_drawer_id ON drawings(drawer_id);
CREATE INDEX IF NOT EXISTS idx_drawings_round_number ON drawings(round_number);
CREATE INDEX IF NOT EXISTS idx_drawings_likes ON drawings(likes);

-- Drawing ratings indexes
CREATE INDEX IF NOT EXISTS idx_drawing_ratings_drawing_id ON drawing_ratings(drawing_id);
CREATE INDEX IF NOT EXISTS idx_drawing_ratings_user_id ON drawing_ratings(user_id);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_correct_guess ON chat_messages(is_correct_guess);

-- Words indexes
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_is_active ON words(is_active);
