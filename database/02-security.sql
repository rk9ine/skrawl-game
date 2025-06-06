-- =====================================================
-- SKRAWL GAME - ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view other profiles for leaderboard" ON users;

CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles for leaderboard" ON users
FOR SELECT USING (has_completed_profile_setup = TRUE);

-- =====================================================
-- GAME ROOMS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active game rooms" ON game_rooms;
DROP POLICY IF EXISTS "Authenticated users can create game rooms" ON game_rooms;
DROP POLICY IF EXISTS "Host can update their game room" ON game_rooms;
DROP POLICY IF EXISTS "Host can delete their game room" ON game_rooms;

CREATE POLICY "Anyone can view active game rooms" ON game_rooms
FOR SELECT USING (status IN ('waiting', 'in_progress'));

CREATE POLICY "Authenticated users can create game rooms" ON game_rooms
FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their game room" ON game_rooms
FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Host can delete their game room" ON game_rooms
FOR DELETE USING (auth.uid() = host_id);

-- =====================================================
-- GAME PARTICIPANTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Participants can view room participants" ON game_participants;
DROP POLICY IF EXISTS "Users can join games" ON game_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON game_participants;
DROP POLICY IF EXISTS "Users can leave games" ON game_participants;

CREATE POLICY "Participants can view room participants" ON game_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_participants gp2
    WHERE gp2.room_id = game_participants.room_id
    AND gp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join games" ON game_participants
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON game_participants
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave games" ON game_participants
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DRAWINGS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Participants can view room drawings" ON drawings;
DROP POLICY IF EXISTS "Drawer can create drawings" ON drawings;
DROP POLICY IF EXISTS "Drawer can update their drawings" ON drawings;

CREATE POLICY "Participants can view room drawings" ON drawings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_participants gp
    WHERE gp.room_id = drawings.room_id
    AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Drawer can create drawings" ON drawings
FOR INSERT WITH CHECK (auth.uid() = drawer_id);

CREATE POLICY "Drawer can update their drawings" ON drawings
FOR UPDATE USING (auth.uid() = drawer_id);

-- =====================================================
-- DRAWING RATINGS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Participants can view ratings" ON drawing_ratings;
DROP POLICY IF EXISTS "Users can rate drawings" ON drawing_ratings;
DROP POLICY IF EXISTS "Users can update their ratings" ON drawing_ratings;
DROP POLICY IF EXISTS "Users can delete their ratings" ON drawing_ratings;

CREATE POLICY "Participants can view ratings" ON drawing_ratings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM drawings d
    JOIN game_participants gp ON gp.room_id = d.room_id
    WHERE d.id = drawing_ratings.drawing_id
    AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can rate drawings" ON drawing_ratings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings" ON drawing_ratings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their ratings" ON drawing_ratings
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CHAT MESSAGES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Participants can view room chat" ON chat_messages;
DROP POLICY IF EXISTS "Participants can send messages" ON chat_messages;

CREATE POLICY "Participants can view room chat" ON chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM game_participants gp
    WHERE gp.room_id = chat_messages.room_id
    AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can send messages" ON chat_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM game_participants gp
    WHERE gp.room_id = chat_messages.room_id
    AND gp.user_id = auth.uid()
  )
);

-- =====================================================
-- WORDS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view words" ON words;

CREATE POLICY "Authenticated users can view words" ON words
FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
