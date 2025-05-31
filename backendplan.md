# Skrawl Backend Implementation Plan
## Complete Authentication & Real-Time Game System

### **Executive Summary**

This document outlines the comprehensive backend implementation for Skrawl, a Skribbl.io-style real-time drawing game built with React Native and Expo. The plan covers authentication, user management, real-time game mechanics, data synchronization, and scalable architecture using Supabase as the primary backend service.

### **Phase 1: Foundation & Database Architecture (Week 1-2)**

#### **1.1 Supabase Database Schema**

```sql
-- Core user profiles extending Supabase auth
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_icon TEXT, -- Ionicon name (e.g., 'brush', 'happy')
  avatar_color TEXT, -- Hex color for avatar background
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  has_completed_profile_setup BOOLEAN DEFAULT FALSE,

  -- Game statistics
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  drawings_created INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,

  -- Profile settings
  is_public BOOLEAN DEFAULT TRUE,
  preferred_theme TEXT DEFAULT 'system',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game rooms/lobbies
CREATE TABLE public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.profiles(id) NOT NULL,

  -- Game configuration
  max_players INTEGER DEFAULT 8 CHECK (max_players BETWEEN 2 AND 20),
  current_players INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')) DEFAULT 'waiting',

  -- Round configuration
  current_round INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 3 CHECK (total_rounds BETWEEN 1 AND 10),
  current_turn INTEGER DEFAULT 0,

  -- Timing configuration
  draw_time_seconds INTEGER DEFAULT 80 CHECK (draw_time_seconds BETWEEN 30 AND 240),
  word_selection_time_seconds INTEGER DEFAULT 10,

  -- Game settings
  hints_enabled INTEGER DEFAULT 2 CHECK (hints_enabled BETWEEN 0 AND 5),
  language TEXT DEFAULT 'en',
  word_mode TEXT DEFAULT 'normal' CHECK (word_mode IN ('normal', 'hidden', 'combination')),
  max_word_count INTEGER DEFAULT 2,

  -- Privacy settings
  is_public BOOLEAN DEFAULT TRUE,
  game_code TEXT UNIQUE, -- 6-character code for private games

  -- Custom words
  use_custom_words BOOLEAN DEFAULT FALSE,
  custom_words TEXT[], -- Array of custom words

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Current game state
  current_word TEXT, -- Secret word for current turn
  current_artist_id UUID REFERENCES public.profiles(id),
  turn_start_time TIMESTAMP WITH TIME ZONE,
  turn_end_time TIMESTAMP WITH TIME ZONE
);

-- Game participants and their scores
CREATE TABLE public.game_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Participation details
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  is_ready BOOLEAN DEFAULT FALSE,

  -- Scoring
  total_score INTEGER DEFAULT 0,
  current_round_score INTEGER DEFAULT 0,
  final_placement INTEGER, -- 1st, 2nd, 3rd place etc.

  -- Turn tracking
  has_drawn_this_round BOOLEAN DEFAULT FALSE,
  turn_order INTEGER, -- Position in drawing order

  UNIQUE(game_id, user_id)
);

-- Individual turn results and scoring
CREATE TABLE public.game_turns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  turn_number INTEGER NOT NULL,

  -- Turn details
  artist_id UUID REFERENCES public.profiles(id) NOT NULL,
  word TEXT NOT NULL,
  word_difficulty TEXT CHECK (word_difficulty IN ('easy', 'medium', 'hard')),

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Results
  artist_score INTEGER DEFAULT 0,
  total_guessers INTEGER DEFAULT 0,
  correct_guessers INTEGER DEFAULT 0,
  was_skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT, -- 'artist_left', 'vote_skip', 'timeout', etc.

  UNIQUE(game_id, round_number, turn_number)
);

-- Individual guess tracking for scoring
CREATE TABLE public.game_guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turn_id UUID REFERENCES public.game_turns(id) ON DELETE CASCADE,
  guesser_id UUID REFERENCES public.profiles(id) NOT NULL,

  -- Guess details
  guess_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  guessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Scoring (only for correct guesses)
  points_earned INTEGER DEFAULT 0,
  guess_order INTEGER, -- 1st, 2nd, 3rd to guess correctly
  time_to_guess_seconds INTEGER -- Time from turn start to correct guess
);

-- Real-time drawing data storage
CREATE TABLE public.drawing_strokes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turn_id UUID REFERENCES public.game_turns(id) ON DELETE CASCADE,

  -- Stroke data
  stroke_data JSONB NOT NULL, -- {tool, color, size, points: [[x,y],...]}
  stroke_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  artist_id UUID REFERENCES public.profiles(id) NOT NULL
);

-- Saved drawings (for portfolio/gallery)
CREATE TABLE public.drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  turn_id UUID REFERENCES public.game_turns(id), -- NULL for freehand drawings

  -- Drawing metadata
  title TEXT NOT NULL,
  description TEXT,
  word_prompt TEXT, -- The word that was drawn

  -- Drawing data
  svg_data TEXT, -- Serialized SVG or canvas data
  stroke_data JSONB, -- Raw stroke data for replay
  thumbnail_url TEXT, -- Generated thumbnail

  -- Social features
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Tags and categorization
  tags TEXT[] DEFAULT '{}',
  difficulty_rating DECIMAL(2,1) -- User-rated difficulty 1.0-5.0
);

-- Chat messages for games
CREATE TABLE public.game_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),

  -- Message content
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'guess', 'system', 'correct_guess')),

  -- Context
  turn_id UUID REFERENCES public.game_turns(id),
  is_guess BOOLEAN DEFAULT FALSE,
  is_correct_guess BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Moderation
  is_filtered BOOLEAN DEFAULT FALSE,
  original_text TEXT -- Store original before profanity filtering
);

-- Leaderboard materialized view for performance
CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.avatar_icon,
  p.avatar_color,
  p.total_score,
  p.games_played,
  p.games_won,
  p.current_streak,
  p.best_streak,
  CASE
    WHEN p.games_played > 0
    THEN ROUND((p.games_won::DECIMAL / p.games_played) * 100, 1)
    ELSE 0
  END as win_rate,
  ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.games_won DESC) as rank,
  p.last_active
FROM public.profiles p
WHERE p.games_played > 0 AND p.is_public = true
ORDER BY p.total_score DESC, p.games_won DESC
LIMIT 1000;

-- Word banks for different languages
CREATE TABLE public.word_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  category TEXT, -- 'animals', 'objects', 'actions', etc.
  word_length INTEGER GENERATED ALWAYS AS (LENGTH(word)) STORED,
  is_active BOOLEAN DEFAULT TRUE,

  UNIQUE(language_code, word)
);
```

#### **1.2 Row Level Security (RLS) Policies**

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawing_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_chat ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles" ON public.profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Anyone can view public games" ON public.games
  FOR SELECT USING (is_public = true OR creator_id = auth.uid() OR
    id IN (SELECT game_id FROM public.game_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can create games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their games" ON public.games
  FOR UPDATE USING (auth.uid() = creator_id);

-- Game participants policies
CREATE POLICY "Participants can view game participants" ON public.game_participants
  FOR SELECT USING (game_id IN (
    SELECT id FROM public.games WHERE is_public = true OR creator_id = auth.uid() OR
    id IN (SELECT game_id FROM public.game_participants WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can join games" ON public.game_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.game_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

### **Phase 2: Authentication & User Management (Week 2-3)**

#### **2.1 Enhanced Authentication Service**

```typescript
// src/services/supabaseAuth.ts
import { supabase } from '../utils/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarIcon?: string;
  avatarColor?: string;
  hasCompletedProfileSetup: boolean;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    drawingsCreated: number;
    totalScore: number;
    currentStreak: number;
    bestStreak: number;
    winRate: number;
  };
  preferences: {
    isPublic: boolean;
    preferredTheme: string;
  };
  lastActive: string;
}

export class SupabaseAuthService {
  // Initialize auth listener
  static initializeAuthListener(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      callback(session);
    });
  }

  // Sign in with email (magic link)
  static async signInWithEmail(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'skrawl://auth/callback',
        shouldCreateUser: true
      }
    });
    return { error };
  }

  // Sign in with Google OAuth
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'skrawl://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
  }

  // Get current session
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Get user profile with stats
  static async getUserProfile(userId: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        game_participants!inner(
          total_score,
          final_placement
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Calculate win rate
    const winRate = data.games_played > 0
      ? Math.round((data.games_won / data.games_played) * 100)
      : 0;

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      avatarIcon: data.avatar_icon,
      avatarColor: data.avatar_color,
      hasCompletedProfileSetup: data.has_completed_profile_setup,
      stats: {
        gamesPlayed: data.games_played,
        gamesWon: data.games_won,
        drawingsCreated: data.drawings_created,
        totalScore: data.total_score,
        currentStreak: data.current_streak,
        bestStreak: data.best_streak,
        winRate
      },
      preferences: {
        isPublic: data.is_public,
        preferredTheme: data.preferred_theme
      },
      lastActive: data.last_active
    };
  }

  // Create user profile (called after first sign up)
  static async createUserProfile(userId: string, email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: email.split('@')[0] || 'Player',
        has_completed_profile_setup: false,
        last_active: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<AuthUser>) {
    const updateData: any = {
      updated_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    if (updates.displayName) updateData.display_name = updates.displayName;
    if (updates.avatarIcon) updateData.avatar_icon = updates.avatarIcon;
    if (updates.avatarColor) updateData.avatar_color = updates.avatarColor;
    if (updates.hasCompletedProfileSetup !== undefined) {
      updateData.has_completed_profile_setup = updates.hasCompletedProfileSetup;
    }
    if (updates.preferences?.isPublic !== undefined) {
      updateData.is_public = updates.preferences.isPublic;
    }
    if (updates.preferences?.preferredTheme) {
      updateData.preferred_theme = updates.preferences.preferredTheme;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }

  // Update user stats after game completion
  static async updateUserStats(userId: string, gameResult: {
    scoreGained: number;
    won: boolean;
    placement: number;
  }) {
    // Use a database function for atomic stats updates
    const { data, error } = await supabase.rpc('update_user_game_stats', {
      user_id: userId,
      score_gained: gameResult.scoreGained,
      game_won: gameResult.won,
      final_placement: gameResult.placement
    });

    return { data, error };
  }
}
```

#### **2.2 Database Functions for Atomic Operations**

```sql
-- Function to update user stats atomically
CREATE OR REPLACE FUNCTION update_user_game_stats(
  user_id UUID,
  score_gained INTEGER,
  game_won BOOLEAN,
  final_placement INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN game_won THEN 1 ELSE 0 END,
    total_score = total_score + score_gained,
    current_streak = CASE
      WHEN game_won THEN current_streak + 1
      ELSE 0
    END,
    best_streak = CASE
      WHEN game_won AND (current_streak + 1) > best_streak
      THEN current_streak + 1
      ELSE best_streak
    END,
    last_active = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique game codes
CREATE OR REPLACE FUNCTION generate_game_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.games WHERE game_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
```

### **Phase 3: Real-Time Game Engine (Week 3-5)**

#### **3.1 Game Service Architecture**

```typescript
// src/services/gameService.ts
import { supabase } from '../utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface GameConfig {
  name: string;
  description?: string;
  maxPlayers: number;
  totalRounds: number;
  drawTimeSeconds: number;
  hintsEnabled: number;
  isPublic: boolean;
  useCustomWords: boolean;
  customWords?: string[];
  language: string;
}

export interface GameState {
  id: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  currentRound: number;
  totalRounds: number;
  currentTurn: number;
  currentArtistId?: string;
  currentWord?: string;
  turnStartTime?: string;
  turnEndTime?: string;
  participants: GameParticipant[];
  config: GameConfig;
}

export interface GameParticipant {
  id: string;
  userId: string;
  displayName: string;
  avatarIcon?: string;
  avatarColor?: string;
  totalScore: number;
  currentRoundScore: number;
  isActive: boolean;
  isReady: boolean;
  hasDrawnThisRound: boolean;
  turnOrder: number;
  joinedAt: string;
}

export interface DrawingStroke {
  tool: 'brush' | 'eraser' | 'clear';
  color?: string;
  size?: number;
  points?: [number, number][];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  displayName?: string;
  messageText: string;
  messageType: 'chat' | 'guess' | 'system' | 'correct_guess';
  isGuess: boolean;
  isCorrectGuess: boolean;
  createdAt: string;
}

export class GameService {
  private gameChannel: RealtimeChannel | null = null;
  private currentGameId: string | null = null;

  // Create a new game
  async createGame(config: GameConfig, creatorId: string): Promise<{ data: GameState | null; error: any }> {
    try {
      // Generate game code for private games
      const gameCode = !config.isPublic ? await this.generateGameCode() : null;

      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          name: config.name,
          description: config.description,
          creator_id: creatorId,
          max_players: config.maxPlayers,
          total_rounds: config.totalRounds,
          draw_time_seconds: config.drawTimeSeconds,
          hints_enabled: config.hintsEnabled,
          is_public: config.isPublic,
          game_code: gameCode,
          use_custom_words: config.useCustomWords,
          custom_words: config.customWords,
          language: config.language,
          current_players: 1
        })
        .select()
        .single();

      if (gameError) return { data: null, error: gameError };

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_id: game.id,
          user_id: creatorId,
          is_ready: true,
          turn_order: 0
        });

      if (participantError) return { data: null, error: participantError };

      // Fetch complete game state
      const gameState = await this.getGameState(game.id);
      return { data: gameState, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  // Join an existing game
  async joinGame(gameId: string, userId: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Check if game exists and has space
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, max_players, current_players, status')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        return { success: false, error: 'Game not found' };
      }

      if (game.current_players >= game.max_players) {
        return { success: false, error: 'Game is full' };
      }

      if (game.status === 'completed' || game.status === 'cancelled') {
        return { success: false, error: 'Game has ended' };
      }

      // Check if user is already in the game
      const { data: existingParticipant } = await supabase
        .from('game_participants')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .single();

      if (existingParticipant) {
        return { success: false, error: 'Already in this game' };
      }

      // Add participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_id: gameId,
          user_id: userId,
          turn_order: game.current_players // Assign turn order based on join order
        });

      if (participantError) return { success: false, error: participantError };

      // Update game player count
      await supabase
        .from('games')
        .update({ current_players: game.current_players + 1 })
        .eq('id', gameId);

      return { success: true };

    } catch (error) {
      return { success: false, error };
    }
  }

  // Start a game (host only)
  async startGame(gameId: string, hostId: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Verify host permissions
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('creator_id, status, current_players')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        return { success: false, error: 'Game not found' };
      }

      if (game.creator_id !== hostId) {
        return { success: false, error: 'Only the host can start the game' };
      }

      if (game.status !== 'waiting') {
        return { success: false, error: 'Game has already started' };
      }

      if (game.current_players < 2) {
        return { success: false, error: 'Need at least 2 players to start' };
      }

      // Start the game
      const { error: updateError } = await supabase
        .from('games')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString(),
          current_round: 1,
          current_turn: 1
        })
        .eq('id', gameId);

      if (updateError) return { success: false, error: updateError };

      // Start first turn
      await this.startNextTurn(gameId);

      return { success: true };

    } catch (error) {
      return { success: false, error };
    }
  }

  // Get complete game state
  async getGameState(gameId: string): Promise<GameState | null> {
    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          game_participants!inner(
            id,
            user_id,
            total_score,
            current_round_score,
            is_active,
            is_ready,
            has_drawn_this_round,
            turn_order,
            joined_at,
            profiles!inner(
              display_name,
              avatar_icon,
              avatar_color
            )
          )
        `)
        .eq('id', gameId)
        .single();

      if (gameError || !game) return null;

      const participants: GameParticipant[] = game.game_participants.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        displayName: p.profiles.display_name,
        avatarIcon: p.profiles.avatar_icon,
        avatarColor: p.profiles.avatar_color,
        totalScore: p.total_score,
        currentRoundScore: p.current_round_score,
        isActive: p.is_active,
        isReady: p.is_ready,
        hasDrawnThisRound: p.has_drawn_this_round,
        turnOrder: p.turn_order,
        joinedAt: p.joined_at
      }));

      return {
        id: game.id,
        status: game.status,
        currentRound: game.current_round,
        totalRounds: game.total_rounds,
        currentTurn: game.current_turn,
        currentArtistId: game.current_artist_id,
        currentWord: game.current_word,
        turnStartTime: game.turn_start_time,
        turnEndTime: game.turn_end_time,
        participants: participants.sort((a, b) => a.turnOrder - b.turnOrder),
        config: {
          name: game.name,
          description: game.description,
          maxPlayers: game.max_players,
          totalRounds: game.total_rounds,
          drawTimeSeconds: game.draw_time_seconds,
          hintsEnabled: game.hints_enabled,
          isPublic: game.is_public,
          useCustomWords: game.use_custom_words,
          customWords: game.custom_words,
          language: game.language
        }
      };

    } catch (error) {
      console.error('Error fetching game state:', error);
      return null;
    }
  }

  // Start next turn in the game
  private async startNextTurn(gameId: string): Promise<void> {
    try {
      // Get current game state
      const gameState = await this.getGameState(gameId);
      if (!gameState) return;

      // Determine next artist
      const activeParticipants = gameState.participants.filter(p => p.isActive);
      if (activeParticipants.length === 0) return;

      // Find next artist in turn order
      const currentTurnIndex = (gameState.currentTurn - 1) % activeParticipants.length;
      const nextArtist = activeParticipants[currentTurnIndex];

      // Select word for the turn
      const word = await this.selectWordForTurn(gameState.config);

      // Create turn record
      const { data: turn, error: turnError } = await supabase
        .from('game_turns')
        .insert({
          game_id: gameId,
          round_number: gameState.currentRound,
          turn_number: gameState.currentTurn,
          artist_id: nextArtist.userId,
          word: word,
          started_at: new Date().toISOString(),
          total_guessers: activeParticipants.length - 1
        })
        .select()
        .single();

      if (turnError) {
        console.error('Error creating turn:', turnError);
        return;
      }

      // Update game with current turn info
      const turnEndTime = new Date();
      turnEndTime.setSeconds(turnEndTime.getSeconds() + gameState.config.drawTimeSeconds);

      await supabase
        .from('games')
        .update({
          current_artist_id: nextArtist.userId,
          current_word: word,
          turn_start_time: new Date().toISOString(),
          turn_end_time: turnEndTime.toISOString()
        })
        .eq('id', gameId);

      // Schedule turn end
      setTimeout(() => {
        this.endTurn(gameId, turn.id, 'timeout');
      }, gameState.config.drawTimeSeconds * 1000);

    } catch (error) {
      console.error('Error starting next turn:', error);
    }
  }

  // Select a word for the current turn
  private async selectWordForTurn(config: GameConfig): Promise<string> {
    try {
      if (config.useCustomWords && config.customWords && config.customWords.length > 0) {
        // Use custom words
        const randomIndex = Math.floor(Math.random() * config.customWords.length);
        return config.customWords[randomIndex];
      } else {
        // Use default word bank
        const { data: words, error } = await supabase
          .from('word_banks')
          .select('word')
          .eq('language_code', config.language)
          .eq('is_active', true)
          .limit(100);

        if (error || !words || words.length === 0) {
          // Fallback words
          const fallbackWords = ['cat', 'dog', 'house', 'tree', 'car', 'book', 'phone', 'computer'];
          return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
        }

        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex].word;
      }
    } catch (error) {
      console.error('Error selecting word:', error);
      return 'drawing'; // Ultimate fallback
    }
  }

  // End current turn
  private async endTurn(gameId: string, turnId: string, reason: 'timeout' | 'all_guessed' | 'artist_left'): Promise<void> {
    try {
      // Update turn record
      await supabase
        .from('game_turns')
        .update({
          ended_at: new Date().toISOString(),
          was_skipped: reason === 'artist_left',
          skip_reason: reason
        })
        .eq('id', turnId);

      // Calculate and award points
      await this.calculateTurnScores(turnId);

      // Check if round/game is complete
      const gameState = await this.getGameState(gameId);
      if (!gameState) return;

      const activeParticipants = gameState.participants.filter(p => p.isActive);
      const allHaveDrawn = activeParticipants.every(p => p.hasDrawnThisRound);

      if (allHaveDrawn) {
        // Round complete
        if (gameState.currentRound >= gameState.totalRounds) {
          // Game complete
          await this.endGame(gameId);
        } else {
          // Start next round
          await this.startNextRound(gameId);
        }
      } else {
        // Continue with next turn
        await supabase
          .from('games')
          .update({
            current_turn: gameState.currentTurn + 1
          })
          .eq('id', gameId);

        await this.startNextTurn(gameId);
      }

    } catch (error) {
      console.error('Error ending turn:', error);
    }
  }

  // Calculate scores for completed turn
  private async calculateTurnScores(turnId: string): Promise<void> {
    try {
      // Get turn data with guesses
      const { data: turn, error: turnError } = await supabase
        .from('game_turns')
        .select(`
          *,
          game_guesses(*)
        `)
        .eq('id', turnId)
        .single();

      if (turnError || !turn) return;

      const correctGuesses = turn.game_guesses.filter((g: any) => g.is_correct);
      const totalCorrectGuesses = correctGuesses.length;

      // Calculate artist score (based on how many guessed correctly)
      const artistScore = Math.round((totalCorrectGuesses / turn.total_guessers) * 100);

      // Update turn with artist score
      await supabase
        .from('game_turns')
        .update({
          artist_score: artistScore,
          correct_guessers: totalCorrectGuesses
        })
        .eq('id', turnId);

      // Update artist's score
      if (artistScore > 0) {
        await supabase
          .from('game_participants')
          .update({
            total_score: supabase.raw(`total_score + ${artistScore}`),
            current_round_score: supabase.raw(`current_round_score + ${artistScore}`)
          })
          .eq('user_id', turn.artist_id)
          .eq('game_id', turn.game_id);
      }

      // Mark artist as having drawn this round
      await supabase
        .from('game_participants')
        .update({ has_drawn_this_round: true })
        .eq('user_id', turn.artist_id)
        .eq('game_id', turn.game_id);

    } catch (error) {
      console.error('Error calculating turn scores:', error);
    }
  }

  // Start next round
  private async startNextRound(gameId: string): Promise<void> {
    try {
      // Reset round-specific flags
      await supabase
        .from('game_participants')
        .update({
          has_drawn_this_round: false,
          current_round_score: 0
        })
        .eq('game_id', gameId);

      // Update game round
      const { data: game } = await supabase
        .from('games')
        .select('current_round')
        .eq('id', gameId)
        .single();

      if (game) {
        await supabase
          .from('games')
          .update({
            current_round: game.current_round + 1,
            current_turn: 1
          })
          .eq('id', gameId);

        // Start first turn of new round
        await this.startNextTurn(gameId);
      }

    } catch (error) {
      console.error('Error starting next round:', error);
    }
  }

  // End game and calculate final results
  private async endGame(gameId: string): Promise<void> {
    try {
      // Update game status
      await supabase
        .from('games')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', gameId);

      // Calculate final placements
      const { data: participants } = await supabase
        .from('game_participants')
        .select('user_id, total_score')
        .eq('game_id', gameId)
        .order('total_score', { ascending: false });

      if (participants) {
        // Update final placements and user stats
        for (let i = 0; i < participants.length; i++) {
          const participant = participants[i];
          const placement = i + 1;
          const won = placement === 1;

          // Update participant placement
          await supabase
            .from('game_participants')
            .update({ final_placement: placement })
            .eq('game_id', gameId)
            .eq('user_id', participant.user_id);

          // Update user stats
          await supabase.rpc('update_user_game_stats', {
            user_id: participant.user_id,
            score_gained: participant.total_score,
            game_won: won,
            final_placement: placement
          });
        }
      }

      // Refresh leaderboard
      await supabase.rpc('refresh_leaderboard');

    } catch (error) {
      console.error('Error ending game:', error);
    }
  }

  // Generate unique game code
  private async generateGameCode(): Promise<string> {
    const { data } = await supabase.rpc('generate_game_code');
    return data || Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
```

#### **3.2 Real-Time Communication Service**

```typescript
// src/services/realtimeService.ts
import { supabase } from '../utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { GameState, DrawingStroke, ChatMessage } from './gameService';

export interface RealtimeCallbacks {
  onGameStateChange: (gameState: GameState) => void;
  onDrawingStroke: (stroke: DrawingStroke) => void;
  onChatMessage: (message: ChatMessage) => void;
  onPlayerJoin: (participant: any) => void;
  onPlayerLeave: (userId: string) => void;
  onTurnStart: (turnData: any) => void;
  onTurnEnd: (turnData: any) => void;
  onGameEnd: (finalResults: any) => void;
}

export class RealtimeService {
  private gameChannel: RealtimeChannel | null = null;
  private drawingChannel: RealtimeChannel | null = null;
  private chatChannel: RealtimeChannel | null = null;
  private currentGameId: string | null = null;

  // Subscribe to game events
  subscribeToGame(gameId: string, callbacks: RealtimeCallbacks): void {
    this.currentGameId = gameId;
    this.unsubscribeAll(); // Clean up existing subscriptions

    // Game state changes
    this.gameChannel = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, (payload) => {
        console.log('Game state changed:', payload);
        this.handleGameStateChange(payload, callbacks.onGameStateChange);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_participants',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('Participant changed:', payload);
        this.handleParticipantChange(payload, callbacks);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_turns',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('Turn started:', payload);
        callbacks.onTurnStart(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_turns',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('Turn updated:', payload);
        if (payload.new.ended_at) {
          callbacks.onTurnEnd(payload.new);
        }
      })
      .subscribe();

    // Real-time drawing
    this.drawingChannel = supabase
      .channel(`drawing:${gameId}`)
      .on('broadcast', { event: 'drawing_stroke' }, (payload) => {
        callbacks.onDrawingStroke(payload.payload as DrawingStroke);
      })
      .on('broadcast', { event: 'canvas_clear' }, () => {
        callbacks.onDrawingStroke({
          tool: 'clear',
          timestamp: Date.now()
        });
      })
      .subscribe();

    // Real-time chat
    this.chatChannel = supabase
      .channel(`chat:${gameId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_chat',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        this.handleChatMessage(payload.new, callbacks.onChatMessage);
      })
      .subscribe();
  }

  // Send drawing stroke
  sendDrawingStroke(stroke: DrawingStroke): void {
    if (this.drawingChannel) {
      this.drawingChannel.send({
        type: 'broadcast',
        event: 'drawing_stroke',
        payload: stroke
      });
    }
  }

  // Clear canvas
  clearCanvas(): void {
    if (this.drawingChannel) {
      this.drawingChannel.send({
        type: 'broadcast',
        event: 'canvas_clear',
        payload: {}
      });
    }
  }

  // Send chat message/guess
  async sendChatMessage(gameId: string, userId: string, message: string, isGuess: boolean = false): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_chat')
        .insert({
          game_id: gameId,
          user_id: userId,
          message_text: message,
          is_guess: isGuess,
          message_type: isGuess ? 'guess' : 'chat'
        });

      if (error) {
        console.error('Error sending chat message:', error);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }

  // Process guess and check if correct
  async processGuess(gameId: string, userId: string, guess: string): Promise<{ isCorrect: boolean; points?: number }> {
    try {
      // Get current game state and word
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('current_word, current_artist_id, turn_start_time')
        .eq('id', gameId)
        .single();

      if (gameError || !game || !game.current_word) {
        return { isCorrect: false };
      }

      // Don't allow artist to guess their own word
      if (game.current_artist_id === userId) {
        return { isCorrect: false };
      }

      // Check if guess is correct (case-insensitive, trimmed)
      const normalizedGuess = guess.trim().toLowerCase();
      const normalizedWord = game.current_word.trim().toLowerCase();
      const isCorrect = normalizedGuess === normalizedWord;

      if (isCorrect) {
        // Calculate points based on time taken
        const timeToGuess = Date.now() - new Date(game.turn_start_time).getTime();
        const points = this.calculateGuessPoints(timeToGuess);

        // Get current turn
        const { data: turn } = await supabase
          .from('game_turns')
          .select('id')
          .eq('game_id', gameId)
          .eq('ended_at', null)
          .single();

        if (turn) {
          // Record the correct guess
          await supabase
            .from('game_guesses')
            .insert({
              turn_id: turn.id,
              guesser_id: userId,
              guess_text: guess,
              is_correct: true,
              points_earned: points,
              time_to_guess_seconds: Math.round(timeToGuess / 1000)
            });

          // Update participant score
          await supabase
            .from('game_participants')
            .update({
              total_score: supabase.raw(`total_score + ${points}`),
              current_round_score: supabase.raw(`current_round_score + ${points}`)
            })
            .eq('game_id', gameId)
            .eq('user_id', userId);

          // Send correct guess notification
          await supabase
            .from('game_chat')
            .insert({
              game_id: gameId,
              user_id: userId,
              message_text: `${guess}`,
              message_type: 'correct_guess',
              is_guess: true,
              is_correct_guess: true
            });
        }

        return { isCorrect: true, points };
      } else {
        // Record incorrect guess
        await this.sendChatMessage(gameId, userId, guess, true);
        return { isCorrect: false };
      }

    } catch (error) {
      console.error('Error processing guess:', error);
      return { isCorrect: false };
    }
  }

  // Calculate points for a correct guess based on timing
  private calculateGuessPoints(timeToGuessMs: number): number {
    // Base points: 100
    // Reduce points based on time taken (max 80 seconds)
    const maxTimeMs = 80 * 1000;
    const timeRatio = Math.min(timeToGuessMs / maxTimeMs, 1);
    const basePoints = 100;
    const timeBonus = Math.round(basePoints * (1 - timeRatio * 0.5)); // 50% reduction max
    return Math.max(timeBonus, 10); // Minimum 10 points
  }

  // Handle game state changes
  private async handleGameStateChange(payload: any, callback: (gameState: GameState) => void): Promise<void> {
    if (this.currentGameId) {
      // Fetch complete game state
      const gameService = new (await import('./gameService')).GameService();
      const gameState = await gameService.getGameState(this.currentGameId);
      if (gameState) {
        callback(gameState);
      }
    }
  }

  // Handle participant changes
  private handleParticipantChange(payload: any, callbacks: RealtimeCallbacks): void {
    if (payload.eventType === 'INSERT') {
      callbacks.onPlayerJoin(payload.new);
    } else if (payload.eventType === 'DELETE') {
      callbacks.onPlayerLeave(payload.old.user_id);
    }
  }

  // Handle chat messages
  private async handleChatMessage(messageData: any, callback: (message: ChatMessage) => void): Promise<void> {
    try {
      // Get user info for the message
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_icon, avatar_color')
        .eq('id', messageData.user_id)
        .single();

      const chatMessage: ChatMessage = {
        id: messageData.id,
        userId: messageData.user_id,
        displayName: profile?.display_name || 'Unknown',
        messageText: messageData.message_text,
        messageType: messageData.message_type,
        isGuess: messageData.is_guess,
        isCorrectGuess: messageData.is_correct_guess,
        createdAt: messageData.created_at
      };

      callback(chatMessage);
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    if (this.gameChannel) {
      supabase.removeChannel(this.gameChannel);
      this.gameChannel = null;
    }
    if (this.drawingChannel) {
      supabase.removeChannel(this.drawingChannel);
      this.drawingChannel = null;
    }
    if (this.chatChannel) {
      supabase.removeChannel(this.chatChannel);
      this.chatChannel = null;
    }
    this.currentGameId = null;
  }
}
```

### **Phase 4: Enhanced State Management (Week 4-5)**

#### **4.1 Updated Game Store with Real-Time Integration**

```typescript
// src/store/gameStore.ts - Enhanced version
import { create } from 'zustand';
import { GameService, GameState, GameConfig } from '../services/gameService';
import { RealtimeService, RealtimeCallbacks } from '../services/realtimeService';
import { useAuthStore } from './authStore';

interface GameStoreState {
  // Current game state
  currentGame: GameState | null;
  isLoading: boolean;
  error: string | null;

  // Game discovery
  publicGames: GameState[];

  // Real-time data
  drawingStrokes: any[];
  chatMessages: any[];

  // Services
  gameService: GameService;
  realtimeService: RealtimeService;

  // Actions
  createGame: (config: GameConfig) => Promise<{ success: boolean; gameId?: string; error?: string }>;
  joinGame: (gameId: string) => Promise<{ success: boolean; error?: string }>;
  joinGameByCode: (gameCode: string) => Promise<{ success: boolean; error?: string }>;
  startGame: (gameId: string) => Promise<{ success: boolean; error?: string }>;
  leaveGame: () => void;

  // Real-time actions
  sendDrawingStroke: (stroke: any) => void;
  clearCanvas: () => void;
  sendChatMessage: (message: string) => void;
  sendGuess: (guess: string) => Promise<{ isCorrect: boolean; points?: number }>;

  // Game discovery
  loadPublicGames: () => Promise<void>;
  refreshGameState: () => Promise<void>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial state
  currentGame: null,
  isLoading: false,
  error: null,
  publicGames: [],
  drawingStrokes: [],
  chatMessages: [],

  // Services
  gameService: new GameService(),
  realtimeService: new RealtimeService(),

  // Create a new game
  createGame: async (config: GameConfig) => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      set({ isLoading: true, error: null });

      const { gameService } = get();
      const { data: gameState, error } = await gameService.createGame(config, user.id);

      if (error || !gameState) {
        set({ isLoading: false, error: error?.message || 'Failed to create game' });
        return { success: false, error: error?.message || 'Failed to create game' };
      }

      set({ currentGame: gameState, isLoading: false });

      // Subscribe to real-time updates
      get().subscribeToGameUpdates(gameState.id);

      return { success: true, gameId: gameState.id };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Join an existing game
  joinGame: async (gameId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      set({ isLoading: true, error: null });

      const { gameService } = get();
      const { success, error } = await gameService.joinGame(gameId, user.id);

      if (!success) {
        set({ isLoading: false, error: error || 'Failed to join game' });
        return { success: false, error: error || 'Failed to join game' };
      }

      // Get updated game state
      const gameState = await gameService.getGameState(gameId);
      if (gameState) {
        set({ currentGame: gameState, isLoading: false });

        // Subscribe to real-time updates
        get().subscribeToGameUpdates(gameId);
      }

      return { success: true };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Join game by code
  joinGameByCode: async (gameCode: string) => {
    try {
      set({ isLoading: true, error: null });

      // Find game by code
      const { data: game, error } = await supabase
        .from('games')
        .select('id')
        .eq('game_code', gameCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (error || !game) {
        set({ isLoading: false, error: 'Game not found' });
        return { success: false, error: 'Game not found' };
      }

      return await get().joinGame(game.id);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Start game (host only)
  startGame: async (gameId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      set({ isLoading: true, error: null });

      const { gameService } = get();
      const { success, error } = await gameService.startGame(gameId, user.id);

      if (!success) {
        set({ isLoading: false, error: error || 'Failed to start game' });
        return { success: false, error: error || 'Failed to start game' };
      }

      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Leave current game
  leaveGame: () => {
    const { realtimeService } = get();
    realtimeService.unsubscribeAll();
    set({
      currentGame: null,
      drawingStrokes: [],
      chatMessages: [],
      error: null
    });
  },

  // Send drawing stroke
  sendDrawingStroke: (stroke: any) => {
    const { realtimeService } = get();
    realtimeService.sendDrawingStroke(stroke);

    // Add to local state immediately for responsiveness
    set(state => ({
      drawingStrokes: [...state.drawingStrokes, stroke]
    }));
  },

  // Clear canvas
  clearCanvas: () => {
    const { realtimeService } = get();
    realtimeService.clearCanvas();
    set({ drawingStrokes: [] });
  },

  // Send chat message
  sendChatMessage: (message: string) => {
    const { currentGame, realtimeService } = get();
    const { user } = useAuthStore.getState();

    if (currentGame && user) {
      realtimeService.sendChatMessage(currentGame.id, user.id, message, false);
    }
  },

  // Send guess
  sendGuess: async (guess: string) => {
    const { currentGame, realtimeService } = get();
    const { user } = useAuthStore.getState();

    if (currentGame && user) {
      return await realtimeService.processGuess(currentGame.id, user.id, guess);
    }

    return { isCorrect: false };
  },

  // Load public games
  loadPublicGames: async () => {
    try {
      set({ isLoading: true });

      const { data: games, error } = await supabase
        .from('games')
        .select(`
          *,
          game_participants(count)
        `)
        .eq('is_public', true)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading public games:', error);
        set({ isLoading: false });
        return;
      }

      // Transform to GameState format
      const gameStates: GameState[] = games.map(game => ({
        id: game.id,
        status: game.status,
        currentRound: game.current_round,
        totalRounds: game.total_rounds,
        currentTurn: game.current_turn,
        participants: [], // Will be loaded when joining
        config: {
          name: game.name,
          description: game.description,
          maxPlayers: game.max_players,
          totalRounds: game.total_rounds,
          drawTimeSeconds: game.draw_time_seconds,
          hintsEnabled: game.hints_enabled,
          isPublic: game.is_public,
          useCustomWords: game.use_custom_words,
          customWords: game.custom_words,
          language: game.language
        }
      }));

      set({ publicGames: gameStates, isLoading: false });
    } catch (error) {
      console.error('Error loading public games:', error);
      set({ isLoading: false });
    }
  },

  // Refresh current game state
  refreshGameState: async () => {
    const { currentGame, gameService } = get();
    if (currentGame) {
      const updatedState = await gameService.getGameState(currentGame.id);
      if (updatedState) {
        set({ currentGame: updatedState });
      }
    }
  },

  // Subscribe to real-time game updates
  subscribeToGameUpdates: (gameId: string) => {
    const { realtimeService } = get();

    const callbacks: RealtimeCallbacks = {
      onGameStateChange: (gameState: GameState) => {
        set({ currentGame: gameState });
      },

      onDrawingStroke: (stroke: any) => {
        set(state => ({
          drawingStrokes: [...state.drawingStrokes, stroke]
        }));
      },

      onChatMessage: (message: any) => {
        set(state => ({
          chatMessages: [...state.chatMessages, message]
        }));
      },

      onPlayerJoin: (participant: any) => {
        // Refresh game state to get updated participants
        get().refreshGameState();
      },

      onPlayerLeave: (userId: string) => {
        // Refresh game state to get updated participants
        get().refreshGameState();
      },

      onTurnStart: (turnData: any) => {
        // Clear drawing strokes for new turn
        set({ drawingStrokes: [] });
        get().refreshGameState();
      },

      onTurnEnd: (turnData: any) => {
        get().refreshGameState();
      },

      onGameEnd: (finalResults: any) => {
        get().refreshGameState();
      }
    };

    realtimeService.subscribeToGame(gameId, callbacks);
  }
}));
```

### **Phase 5: Migration Strategy & Feature Flags (Week 5-6)**

#### **5.1 Gradual Migration Approach**

```typescript
// src/utils/featureFlags.ts
export const featureFlags = {
  // Authentication
  USE_REAL_AUTH: process.env.NODE_ENV === 'production',
  USE_MOCK_AUTH_FALLBACK: true,

  // Game functionality
  USE_REAL_GAMES: process.env.NODE_ENV === 'production',
  USE_REAL_LEADERBOARD: process.env.NODE_ENV === 'production',
  USE_REAL_DRAWING_SYNC: process.env.NODE_ENV === 'production',

  // Development features
  ENABLE_DEBUG_LOGS: __DEV__,
  ENABLE_MOCK_DATA_OVERLAY: __DEV__,
  SKIP_PROFILE_SETUP: __DEV__ && false, // For testing
};

// Service factory pattern for gradual migration
export class ServiceFactory {
  static createAuthService() {
    if (featureFlags.USE_REAL_AUTH) {
      return new SupabaseAuthService();
    } else {
      return new MockAuthService();
    }
  }

  static createGameService() {
    if (featureFlags.USE_REAL_GAMES) {
      return new GameService();
    } else {
      return new MockGameService();
    }
  }

  static createRealtimeService() {
    if (featureFlags.USE_REAL_DRAWING_SYNC) {
      return new RealtimeService();
    } else {
      return new MockRealtimeService();
    }
  }
}
```

#### **5.2 Migration Timeline**

**Week 1-2: Foundation**
- Set up Supabase project and database schema
- Implement RLS policies and database functions
- Create authentication service layer
- Test authentication flow with real backend

**Week 3: Authentication Migration**
- Update auth store to use real Supabase auth
- Implement profile management with real backend
- Test profile setup and user management
- Maintain mock fallback for development

**Week 4: Game Infrastructure**
- Implement game service with database integration
- Create real-time communication layer
- Test game creation and joining
- Implement basic turn management

**Week 5: Real-Time Features**
- Implement drawing synchronization
- Add chat and guessing functionality
- Test real-time updates and scoring
- Optimize performance and handle edge cases

**Week 6: Leaderboard & Polish**
- Implement real leaderboard with live updates
- Add game statistics and user analytics
- Performance optimization and bug fixes
- Final testing and deployment preparation

### **Phase 6: Testing & Quality Assurance (Week 6-7)**

#### **6.1 Testing Strategy**

```typescript
// src/tests/services/authService.test.ts
import { SupabaseAuthService } from '../../services/supabaseAuth';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase for testing
jest.mock('@supabase/supabase-js');

describe('SupabaseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should send magic link successfully', async () => {
      const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
      (createClient as jest.Mock).mockReturnValue({
        auth: { signInWithOtp: mockSignInWithOtp }
      });

      const result = await SupabaseAuthService.signInWithEmail('test@example.com');

      expect(result.error).toBeNull();
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'amazonian://auth/callback',
          shouldCreateUser: true
        }
      });
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile with stats', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'TestUser',
        games_played: 10,
        games_won: 5
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
        })
      });

      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({ select: mockSelect })
      });

      const result = await SupabaseAuthService.getUserProfile('user-123');

      expect(result).toBeDefined();
      expect(result?.displayName).toBe('TestUser');
      expect(result?.stats.gamesPlayed).toBe(10);
      expect(result?.stats.winRate).toBe(50);
    });
  });
});

// src/tests/services/gameService.test.ts
describe('GameService', () => {
  describe('createGame', () => {
    it('should create game with correct configuration', async () => {
      const gameConfig = {
        name: 'Test Game',
        maxPlayers: 4,
        totalRounds: 3,
        drawTimeSeconds: 80,
        hintsEnabled: 2,
        isPublic: true,
        useCustomWords: false,
        language: 'en'
      };

      const gameService = new GameService();
      const result = await gameService.createGame(gameConfig, 'user-123');

      expect(result.data).toBeDefined();
      expect(result.data?.config.name).toBe('Test Game');
      expect(result.data?.participants).toHaveLength(1);
    });
  });

  describe('joinGame', () => {
    it('should allow user to join available game', async () => {
      const gameService = new GameService();
      const result = await gameService.joinGame('game-123', 'user-456');

      expect(result.success).toBe(true);
    });

    it('should reject joining full game', async () => {
      const gameService = new GameService();
      const result = await gameService.joinGame('full-game-123', 'user-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Game is full');
    });
  });
});
```

#### **6.2 Integration Testing**

```typescript
// src/tests/integration/gameFlow.test.ts
describe('Complete Game Flow Integration', () => {
  let gameService: GameService;
  let realtimeService: RealtimeService;
  let authService: SupabaseAuthService;

  beforeEach(async () => {
    // Set up test environment
    gameService = new GameService();
    realtimeService = new RealtimeService();
    authService = new SupabaseAuthService();
  });

  it('should complete full game cycle', async () => {
    // 1. Create users
    const host = await createTestUser('host@test.com');
    const player = await createTestUser('player@test.com');

    // 2. Create game
    const gameConfig = createTestGameConfig();
    const { data: game } = await gameService.createGame(gameConfig, host.id);
    expect(game).toBeDefined();

    // 3. Player joins
    const joinResult = await gameService.joinGame(game!.id, player.id);
    expect(joinResult.success).toBe(true);

    // 4. Host starts game
    const startResult = await gameService.startGame(game!.id, host.id);
    expect(startResult.success).toBe(true);

    // 5. Simulate game turns
    const gameState = await gameService.getGameState(game!.id);
    expect(gameState?.status).toBe('in-progress');

    // 6. Test drawing and guessing
    // ... additional test steps
  });
});
```

#### **6.3 Performance Testing**

```typescript
// src/tests/performance/realtimePerformance.test.ts
describe('Real-time Performance Tests', () => {
  it('should handle multiple concurrent drawing strokes', async () => {
    const strokeCount = 1000;
    const startTime = Date.now();

    const promises = Array.from({ length: strokeCount }, (_, i) =>
      realtimeService.sendDrawingStroke({
        tool: 'brush',
        color: '#000000',
        size: 2,
        points: [[i, i], [i+1, i+1]],
        timestamp: Date.now()
      })
    );

    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle multiple users joining simultaneously', async () => {
    const userCount = 20;
    const gameId = 'test-game-123';

    const joinPromises = Array.from({ length: userCount }, (_, i) =>
      gameService.joinGame(gameId, `user-${i}`)
    );

    const results = await Promise.allSettled(joinPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    expect(successful).toBeGreaterThan(0);
  });
});
```

### **Phase 7: Deployment & Monitoring (Week 7-8)**

#### **7.1 Environment Configuration**

```typescript
// src/utils/config.ts - Enhanced version
interface Config {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    enableRealTimeSync: boolean;
    enableAnalytics: boolean;
    enableCrashReporting: boolean;
  };
  performance: {
    maxConcurrentGames: number;
    drawingStrokeBufferSize: number;
    chatMessageRateLimit: number;
  };
}

const config: Config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    name: 'Skrawl',
    version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    environment: (process.env.EXPO_PUBLIC_ENVIRONMENT as any) || 'development',
  },
  features: {
    enableRealTimeSync: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableCrashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  },
  performance: {
    maxConcurrentGames: parseInt(process.env.EXPO_PUBLIC_MAX_CONCURRENT_GAMES || '100'),
    drawingStrokeBufferSize: parseInt(process.env.EXPO_PUBLIC_DRAWING_BUFFER_SIZE || '50'),
    chatMessageRateLimit: parseInt(process.env.EXPO_PUBLIC_CHAT_RATE_LIMIT || '5'),
  },
};

export default config;
```

#### **7.2 Monitoring & Analytics**

```typescript
// src/services/analytics.ts
export class AnalyticsService {
  static trackGameCreated(gameConfig: GameConfig) {
    if (config.features.enableAnalytics) {
      // Track game creation metrics
      console.log('Game created:', {
        maxPlayers: gameConfig.maxPlayers,
        totalRounds: gameConfig.totalRounds,
        isPublic: gameConfig.isPublic,
        useCustomWords: gameConfig.useCustomWords
      });
    }
  }

  static trackGameJoined(gameId: string, userId: string) {
    if (config.features.enableAnalytics) {
      console.log('Game joined:', { gameId, userId });
    }
  }

  static trackGameCompleted(gameId: string, duration: number, participants: number) {
    if (config.features.enableAnalytics) {
      console.log('Game completed:', { gameId, duration, participants });
    }
  }

  static trackDrawingStroke(strokeCount: number) {
    if (config.features.enableAnalytics) {
      console.log('Drawing stroke:', { strokeCount });
    }
  }

  static trackGuessAccuracy(isCorrect: boolean, timeToGuess: number) {
    if (config.features.enableAnalytics) {
      console.log('Guess made:', { isCorrect, timeToGuess });
    }
  }
}

// src/services/errorReporting.ts
export class ErrorReportingService {
  static reportError(error: Error, context?: any) {
    if (config.features.enableCrashReporting) {
      console.error('Error reported:', error, context);
      // Integrate with crash reporting service (Sentry, Bugsnag, etc.)
    }
  }

  static reportPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      console.warn('Performance issue:', { metric, value, threshold });
    }
  }
}
```

### **Phase 8: Final Implementation Checklist**

#### **8.1 Pre-Launch Checklist**

- [ ] **Database Setup**
  - [ ] Supabase project configured
  - [ ] All tables created with proper schema
  - [ ] RLS policies implemented and tested
  - [ ] Database functions deployed
  - [ ] Word banks populated

- [ ] **Authentication System**
  - [ ] Email magic link authentication working
  - [ ] Google OAuth integration tested
  - [ ] Profile setup flow complete
  - [ ] User stats tracking functional
  - [ ] Session management robust

- [ ] **Game Engine**
  - [ ] Game creation and joining working
  - [ ] Turn management system functional
  - [ ] Scoring system accurate
  - [ ] Real-time synchronization stable
  - [ ] Chat and guessing system working

- [ ] **Real-Time Features**
  - [ ] Drawing synchronization smooth
  - [ ] Chat messages delivered instantly
  - [ ] Game state updates propagated
  - [ ] Performance optimized for multiple users

- [ ] **Testing Complete**
  - [ ] Unit tests passing
  - [ ] Integration tests successful
  - [ ] Performance tests within limits
  - [ ] User acceptance testing completed

- [ ] **Deployment Ready**
  - [ ] Environment variables configured
  - [ ] Monitoring and analytics set up
  - [ ] Error reporting functional
  - [ ] Backup and recovery procedures in place

#### **8.2 Success Metrics**

- **Technical Metrics**
  - Real-time latency < 100ms for drawing strokes
  - Game state synchronization < 500ms
  - Support for 20+ concurrent games
  - 99.9% uptime for authentication

- **User Experience Metrics**
  - Profile setup completion rate > 90%
  - Game completion rate > 80%
  - Average session duration > 15 minutes
  - User retention rate > 60% after 7 days

- **Performance Metrics**
  - App startup time < 3 seconds
  - Game join time < 2 seconds
  - Drawing responsiveness < 50ms
  - Chat message delivery < 200ms

This comprehensive backend plan provides a complete roadmap for implementing a scalable, real-time drawing game backend that integrates seamlessly with your existing React Native frontend while maintaining the ability to develop with mock data during the transition period.