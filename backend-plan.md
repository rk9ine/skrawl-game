# Skrawl Backend Implementation Plan

## Overview
This document provides a comprehensive, step-by-step roadmap for implementing the complete backend infrastructure for the Skrawl drawing app. The plan is organized into sequential phases with clear dependencies and technical specifications.

## Current Frontend Analysis
Based on the codebase analysis, the frontend includes:
- **Authentication Flow**: Login → Profile Setup → Dashboard
- **Main Screens**: Dashboard, Drawing Battle, Leaderboard, Settings, Private Match
- **Drawing System**: HTML5 Canvas with tools (pen, paint bucket, colors, sizes)
- **State Management**: Zustand stores for auth, drawing, game, multiplayer
- **UI Components**: Complete drawing battle interface with chat, player list, reactions
- **Navigation**: React Navigation with proper auth flow routing

## Phase 1: Authentication System

### 1.1 Supabase Project Setup
- **Objective**: Configure Supabase authentication with email verification and Google Sign-in
- **Dependencies**: Existing Supabase project (yazfoqqewzezwjigsuqq.supabase.co)

#### Implementation Steps:
1. **Install Supabase Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configure Supabase Client**
   - Create `src/services/supabase.ts`
   - Set up client with project URL and anon key
   - Configure auth settings for email verification codes

3. **Authentication Providers Setup**
   - Configure Google OAuth with existing client IDs:
     - iOS: `521406618633-qnlvheehuo39v8kojplskov57n52a3sh.apps.googleusercontent.com`
     - Android: `521406618633-3k31rl0mpfamqmacr9tgslb57nf9ucgg.apps.googleusercontent.com`
   - Set redirect URL: `skrawl://auth/callback`

4. **Email Verification Code Flow**
   - Implement 6-digit OTP system instead of magic links
   - Configure email templates in Supabase dashboard
   - Set up rate limiting for OTP requests

### 1.2 Authentication Service Implementation
- **File**: `src/services/authService.ts`

#### Core Functions:
```typescript
interface AuthService {
  sendEmailOtp(email: string): Promise<{ error: any }>
  verifyEmailOtp(email: string, token: string): Promise<{ user: User | null, error: any }>
  signInWithGoogle(): Promise<{ user: User | null, error: any }>
  signOut(): Promise<{ error: any }>
  getCurrentUser(): User | null
  onAuthStateChange(callback: (user: User | null) => void): () => void
}
```

### 1.3 Update Auth Store
- Replace mock implementations in `src/store/authStore.ts`
- Integrate with real Supabase authentication
- Maintain existing interface for seamless frontend integration
- Add proper error handling and loading states

### 1.4 Profile Completion Check
- Implement backend logic to check if user has completed profile setup
- Query user profile table for required fields (displayName, avatar)
- Update routing logic in AppNavigator

## Phase 2: Database Schema Design

### 2.1 Core Tables

#### Users Table (extends Supabase auth.users)
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_type TEXT CHECK (avatar_type IN ('emoji', 'gif', 'custom')),
  avatar_data TEXT, -- emoji, gif filename, or custom avatar data
  has_completed_profile_setup BOOLEAN DEFAULT FALSE,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Games Table
```sql
CREATE TABLE public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.users(id) NOT NULL,
  max_players INTEGER DEFAULT 8 CHECK (max_players BETWEEN 2 AND 20),
  current_players INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 3 CHECK (total_rounds BETWEEN 1 AND 10),
  current_round INTEGER DEFAULT 1,
  time_per_round INTEGER DEFAULT 80 CHECK (time_per_round BETWEEN 30 AND 240),
  hints_enabled INTEGER DEFAULT 1 CHECK (hints_enabled BETWEEN 0 AND 5),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  is_public BOOLEAN DEFAULT TRUE,
  game_code TEXT UNIQUE, -- for private games
  custom_words TEXT[], -- custom word list for private games
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);
```

#### Game Players Table
```sql
CREATE TABLE public.game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_data TEXT,
  score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  is_current_drawer BOOLEAN DEFAULT FALSE,
  turn_order INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);
```

#### Game Turns Table
```sql
CREATE TABLE public.game_turns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  turn_number INTEGER NOT NULL,
  drawer_id UUID REFERENCES public.users(id),
  word TEXT NOT NULL,
  word_choices TEXT[], -- the 3 options presented to drawer
  drawing_data JSONB, -- canvas drawing paths and strokes
  hints_revealed TEXT[], -- letters revealed as hints
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'skipped'))
);
```

#### Game Guesses Table
```sql
CREATE TABLE public.game_guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turn_id UUID REFERENCES public.game_turns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  guess TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  guess_order INTEGER, -- 1st, 2nd, 3rd correct guess
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Drawings Table (for saved drawings)
```sql
CREATE TABLE public.drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  drawing_data JSONB NOT NULL, -- canvas paths and metadata
  svg_data TEXT, -- rendered SVG for display
  is_public BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Chat Messages Table
```sql
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'guess', 'system')),
  is_correct_guess BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Indexes and Performance
```sql
-- Game performance indexes
CREATE INDEX idx_games_status_public ON public.games(status, is_public);
CREATE INDEX idx_games_creator ON public.games(creator_id);
CREATE INDEX idx_game_players_game ON public.game_players(game_id);
CREATE INDEX idx_game_turns_game ON public.game_turns(game_id, round_number, turn_number);
CREATE INDEX idx_chat_messages_game ON public.chat_messages(game_id, created_at);

-- Leaderboard indexes
CREATE INDEX idx_users_total_score ON public.users(total_score DESC);
CREATE INDEX idx_users_games_won ON public.users(games_won DESC);
```

## Phase 3: Real-time Multiplayer Infrastructure

### 3.1 WebSocket Connection Management
- **File**: `src/services/websocketService.ts`

#### Implementation:
```typescript
interface WebSocketService {
  connect(gameId: string, userId: string): Promise<void>
  disconnect(): void
  sendDrawingData(pathData: NetworkPath): void
  sendChatMessage(message: string): void
  sendGuess(guess: string): void
  onDrawingUpdate(callback: (pathData: NetworkPath) => void): void
  onChatMessage(callback: (message: ChatMessage) => void): void
  onGameStateUpdate(callback: (gameState: GameState) => void): void
  onPlayerUpdate(callback: (players: GamePlayer[]) => void): void
}
```

### 3.2 Supabase Realtime Setup
- Configure Supabase Realtime for tables:
  - `game_players` - player join/leave events
  - `game_turns` - turn changes and drawing updates
  - `chat_messages` - real-time chat
  - `game_guesses` - guess submissions

### 3.3 Drawing Synchronization
- Implement efficient path streaming for real-time drawing
- Batch drawing points for network optimization
- Handle drawing conflicts and state synchronization
- Store drawing data in `game_turns.drawing_data` as JSONB

## Phase 4: Game Logic Backend

### 4.1 Game Service Implementation
- **File**: `src/services/gameService.ts`

#### Core Functions:
```typescript
interface GameService {
  // Game Management
  createGame(gameData: CreateGameRequest): Promise<Game>
  joinGame(gameId: string, userId: string): Promise<GamePlayer>
  leaveGame(gameId: string, userId: string): Promise<void>
  startGame(gameId: string, hostId: string): Promise<void>
  
  // Game Flow
  startTurn(gameId: string): Promise<GameTurn>
  selectWord(turnId: string, word: string): Promise<void>
  submitGuess(turnId: string, userId: string, guess: string): Promise<GuessResult>
  endTurn(turnId: string): Promise<TurnResult>
  
  // Game State
  getGameState(gameId: string): Promise<GameState>
  getPublicGames(): Promise<Game[]>
  joinGameByCode(gameCode: string, userId: string): Promise<Game>
}
```

### 4.2 Word Management System
- Create word bank tables for different languages
- Implement word selection algorithm (3 random choices)
- Support custom word lists for private games
- Implement hint system (progressive letter reveals)

### 4.3 Scoring Algorithm
```typescript
interface ScoringSystem {
  calculateGuesserPoints(guessOrder: number, timeRemaining: number, totalTime: number): number
  calculateDrawerPoints(correctGuesses: number, totalPlayers: number, averageGuessTime: number): number
  updatePlayerScores(turnId: string): Promise<void>
  updateLeaderboard(userId: string, pointsEarned: number): Promise<void>
}
```

### 4.4 Turn Management
- Implement turn rotation logic
- Handle player disconnections during turns
- Auto-skip inactive players
- Manage round progression

## Phase 5: API Endpoints

### 5.1 Authentication Endpoints
```typescript
// Already handled by Supabase Auth
POST /auth/signup
POST /auth/signin
POST /auth/signout
POST /auth/verify-otp
GET /auth/user
```

### 5.2 Game Management Endpoints
```typescript
GET /api/games/public          // Get public games list
POST /api/games                // Create new game
GET /api/games/:id             // Get game details
POST /api/games/:id/join       // Join game
DELETE /api/games/:id/leave    // Leave game
POST /api/games/:id/start      // Start game (host only)
POST /api/games/join-by-code   // Join by game code

// Game Flow
POST /api/games/:id/turns/:turnId/select-word
POST /api/games/:id/turns/:turnId/guess
POST /api/games/:id/turns/:turnId/end
```

### 5.3 Drawing Endpoints
```typescript
GET /api/drawings              // Get public drawings
POST /api/drawings             // Save drawing
GET /api/drawings/:id          // Get specific drawing
PUT /api/drawings/:id          // Update drawing
DELETE /api/drawings/:id       // Delete drawing
POST /api/drawings/:id/like    // Like/unlike drawing
```

### 5.4 User & Leaderboard Endpoints
```typescript
GET /api/users/profile         // Get user profile
PUT /api/users/profile         // Update profile
GET /api/leaderboard           // Get leaderboard
GET /api/users/:id/stats       // Get user statistics
```

## Phase 6: Data Storage Strategy

### 6.1 Drawing Data Storage
- Store drawing paths as JSONB in PostgreSQL
- Implement efficient serialization for NetworkPath objects
- Generate SVG representations for thumbnails
- Optimize storage for large drawing datasets

### 6.2 Asset Management
- Store custom avatars in Supabase Storage
- Implement avatar upload and validation
- Create CDN strategy for fast asset delivery
- Handle GIF avatar storage and serving

### 6.3 Game State Persistence
- Maintain game state in database
- Implement state recovery for disconnected players
- Store turn history for replay functionality
- Archive completed games for statistics

## Phase 7: Leaderboard System

### 7.1 Scoring Metrics
```typescript
interface LeaderboardMetrics {
  totalScore: number
  gamesPlayed: number
  gamesWon: number
  winRate: number
  averageScore: number
  bestScore: number
  drawingAccuracy: number // how often others guess their drawings
  guessingAccuracy: number // how often they guess correctly
}
```

### 7.2 Leaderboard Types
- Global leaderboard (all-time)
- Weekly/Monthly leaderboards
- Friends leaderboard
- Game-specific leaderboards

### 7.3 Real-time Updates
- Update scores after each game
- Broadcast leaderboard changes
- Implement efficient ranking calculations
- Cache leaderboard data for performance

## Phase 8: Security & Performance

### 8.1 Row Level Security (RLS) Policies
```sql
-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Players can only join games they're invited to
CREATE POLICY "Players can join public games" ON public.game_players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games 
      WHERE id = game_id AND (is_public = true OR creator_id = auth.uid())
    )
  );

-- Only game participants can see chat messages
CREATE POLICY "Game participants can see chat" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_players 
      WHERE game_id = chat_messages.game_id AND user_id = auth.uid()
    )
  );
```

### 8.2 Rate Limiting
- Implement guess rate limiting (1 guess per second)
- Chat message rate limiting
- Drawing data rate limiting
- API endpoint rate limiting

### 8.3 Data Validation
- Validate drawing data structure
- Sanitize chat messages and usernames
- Validate game settings and parameters
- Implement profanity filtering

### 8.4 Performance Optimizations
- Database query optimization
- Real-time event batching
- Drawing data compression
- Caching strategies for frequently accessed data

## Implementation Timeline

### Week 1-2: Foundation
- Phase 1: Authentication System
- Phase 2: Database Schema (Core tables)

### Week 3-4: Core Functionality  
- Phase 3: Real-time Infrastructure
- Phase 4: Basic Game Logic

### Week 5-6: Advanced Features
- Phase 5: API Endpoints
- Phase 6: Data Storage

### Week 7-8: Polish & Performance
- Phase 7: Leaderboard System
- Phase 8: Security & Performance

## Dependencies & Prerequisites
1. Supabase project with proper configuration
2. Development build setup for authentication testing
3. WebSocket/Realtime infrastructure
4. Profanity filtering word lists
5. Game word banks for multiple languages

## Testing Strategy
- Unit tests for game logic and scoring
- Integration tests for real-time features
- Load testing for multiplayer scenarios
- Security testing for RLS policies
- End-to-end testing for complete game flows

This plan provides a comprehensive roadmap for implementing the complete Skrawl backend while maintaining compatibility with the existing frontend architecture.
