-- =====================================================
-- SKRAWL GAME - FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (drop if exists to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_rooms_updated_at ON game_rooms;
CREATE TRIGGER update_game_rooms_updated_at BEFORE UPDATE ON game_rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update room participant count
CREATE OR REPLACE FUNCTION update_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE game_rooms 
    SET current_players = current_players + 1 
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE game_rooms 
    SET current_players = current_players - 1 
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for participant count (drop if exists to avoid conflicts)
DROP TRIGGER IF EXISTS update_participant_count_insert ON game_participants;
CREATE TRIGGER update_participant_count_insert
AFTER INSERT ON game_participants
FOR EACH ROW EXECUTE FUNCTION update_room_participant_count();

DROP TRIGGER IF EXISTS update_participant_count_delete ON game_participants;
CREATE TRIGGER update_participant_count_delete
AFTER DELETE ON game_participants
FOR EACH ROW EXECUTE FUNCTION update_room_participant_count();

-- Function to update drawing likes/dislikes count
CREATE OR REPLACE FUNCTION update_drawing_rating_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.rating = 'like' THEN
      UPDATE drawings SET likes = likes + 1 WHERE id = NEW.drawing_id;
    ELSIF NEW.rating = 'dislike' THEN
      UPDATE drawings SET dislikes = dislikes + 1 WHERE id = NEW.drawing_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old rating
    IF OLD.rating = 'like' THEN
      UPDATE drawings SET likes = likes - 1 WHERE id = OLD.drawing_id;
    ELSIF OLD.rating = 'dislike' THEN
      UPDATE drawings SET dislikes = dislikes - 1 WHERE id = OLD.drawing_id;
    END IF;
    -- Add new rating
    IF NEW.rating = 'like' THEN
      UPDATE drawings SET likes = likes + 1 WHERE id = NEW.drawing_id;
    ELSIF NEW.rating = 'dislike' THEN
      UPDATE drawings SET dislikes = dislikes + 1 WHERE id = NEW.drawing_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.rating = 'like' THEN
      UPDATE drawings SET likes = likes - 1 WHERE id = OLD.drawing_id;
    ELSIF OLD.rating = 'dislike' THEN
      UPDATE drawings SET dislikes = dislikes - 1 WHERE id = OLD.drawing_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for drawing ratings (drop if exists to avoid conflicts)
DROP TRIGGER IF EXISTS update_drawing_rating_count_insert ON drawing_ratings;
CREATE TRIGGER update_drawing_rating_count_insert
AFTER INSERT ON drawing_ratings
FOR EACH ROW EXECUTE FUNCTION update_drawing_rating_count();

DROP TRIGGER IF EXISTS update_drawing_rating_count_update ON drawing_ratings;
CREATE TRIGGER update_drawing_rating_count_update
AFTER UPDATE ON drawing_ratings
FOR EACH ROW EXECUTE FUNCTION update_drawing_rating_count();

DROP TRIGGER IF EXISTS update_drawing_rating_count_delete ON drawing_ratings;
CREATE TRIGGER update_drawing_rating_count_delete
AFTER DELETE ON drawing_ratings
FOR EACH ROW EXECUTE FUNCTION update_drawing_rating_count();
