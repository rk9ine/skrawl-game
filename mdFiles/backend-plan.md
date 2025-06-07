# Skrawl Backend Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the Skrawl real-time multiplayer drawing game backend using the hybrid WebSocket + Supabase architecture.

## Architecture Summary

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │   WebSocket      │    │    Supabase     │
│     Client      │◄──►│     Server       │◄──►│   (Auth + DB)   │
│  (Existing UI)  │    │  (Socket.io)     │    │  (Existing)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**WebSocket Server**: Real-time game logic, drawing sync, chat, turn management
**Supabase**: Authentication, user profiles, game history, leaderboards
**React Native**: Existing UI components (no major changes needed)

## Current App Structure Analysis

### Existing Components (Ready for Backend Integration)
- ✅ **DrawingBattleScreen**: Main game screen with all UI components
- ✅ **DrawingCanvas**: HTML5 canvas with real-time drawing infrastructure
- ✅ **PlayerList**: Player display with scoring and status
- ✅ **ChatSection**: Chat UI with message display
- ✅ **MessageInput**: Chat input with rate limiting
- ✅ **TopBar**: Round/timer display and word blanks
- ✅ **DrawingToolbar**: Complete drawing tools (pen, bucket, colors, sizes)
- ✅ **GameModeSelectionScreen**: Quick Play and Custom Game modes
- ✅ **DashboardScreen**: Main navigation hub

### Existing Services (Ready for Extension)
- ✅ **AuthStore**: Complete authentication with Supabase
- ✅ **ProfileService**: User profile management
- ✅ **Supabase Client**: Configured and working

### Missing Backend Components (To Be Implemented)
- ❌ **WebSocket Server**: Game logic and real-time communication
- ❌ **Game State Management**: Turn cycles, scoring, word selection
- ❌ **Room Management**: Public/private lobbies
- ❌ **Drawing Synchronization**: Real-time stroke broadcasting
- ❌ **Chat System**: Message filtering and guess validation

## Phase 1: WebSocket Server Foundation (Week 1-2)

### 1.1 Server Setup and Basic Infrastructure

**Goal**: Create the core WebSocket server with authentication

**Tasks**:
1. **Initialize Node.js + Socket.io Server**
   ```bash
   mkdir skrawl-websocket-server
   cd skrawl-websocket-server
   npm init -y
   npm install socket.io express cors dotenv jsonwebtoken
   npm install -D @types/node typescript ts-node nodemon
   ```

2. **Basic Server Structure**
   ```
   skrawl-websocket-server/
   ├── src/
   │   ├── server.ts              # Main server entry
   │   ├── middleware/
   │   │   └── auth.ts            # JWT authentication
   │   ├── services/
   │   │   ├── gameService.ts     # Game logic
   │   │   ├── roomService.ts     # Room management
   │   │   └── supabaseClient.ts  # Supabase integration
   │   ├── types/
   │   │   ├── game.ts            # Game state types
   │   │   ├── player.ts          # Player types
   │   │   └── events.ts          # Socket event types
   │   └── utils/
   │       ├── wordBank.ts        # Default word lists
   │       └── profanityFilter.ts # Chat filtering
   ├── package.json
   ├── tsconfig.json
   └── .env
   ```

3. **Authentication Middleware**
   - JWT token validation using Supabase public key
   - User context extraction from token
   - Connection authorization

4. **Basic Socket Events Structure**
   ```typescript
   // Core connection events
   socket.on('authenticate', (token) => {})
   socket.on('disconnect', () => {})

   // Room events (Phase 2)
   socket.on('join-room', (roomId) => {})
   socket.on('leave-room', () => {})

   // Game events (Phase 3)
   socket.on('start-game', () => {})
   socket.on('drawing-stroke', (strokeData) => {})
   socket.on('chat-message', (message) => {})
   ```

**Deliverables**:
- ✅ Working WebSocket server with authentication
- ✅ JWT token validation middleware
- ✅ Basic connection/disconnection handling
- ✅ Environment configuration
- ✅ TypeScript setup with proper types

### 1.2 Supabase Integration

**Goal**: Connect WebSocket server to existing Supabase backend

**Tasks**:
1. **Supabase Client Setup**
   - Service role key configuration
   - User profile fetching
   - Database connection for game history

2. **User Context Service**
   ```typescript
   class UserService {
     static async getUserProfile(userId: string)
     static async updateUserStats(userId: string, stats: GameStats)
     static async validateUserToken(token: string)
   }
   ```

3. **Database Schema Extensions** (Supabase)
   ```sql
   -- Game sessions table
   CREATE TABLE game_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     room_id VARCHAR(10) UNIQUE NOT NULL,
     host_id UUID REFERENCES users(id),
     game_mode VARCHAR(20) NOT NULL, -- 'public' | 'private'
     settings JSONB NOT NULL,
     status VARCHAR(20) NOT NULL, -- 'waiting' | 'active' | 'finished'
     created_at TIMESTAMP DEFAULT NOW(),
     started_at TIMESTAMP,
     ended_at TIMESTAMP
   );

   -- Game participants table
   CREATE TABLE game_participants (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     session_id UUID REFERENCES game_sessions(id),
     user_id UUID REFERENCES users(id),
     score INTEGER DEFAULT 0,
     joined_at TIMESTAMP DEFAULT NOW(),
     left_at TIMESTAMP
   );

   -- Game rounds table
   CREATE TABLE game_rounds (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     session_id UUID REFERENCES game_sessions(id),
     round_number INTEGER NOT NULL,
     drawer_id UUID REFERENCES users(id),
     word VARCHAR(100) NOT NULL,
     started_at TIMESTAMP DEFAULT NOW(),
     ended_at TIMESTAMP,
     scores JSONB -- { userId: points }
   );
   ```

**Deliverables**:
- ✅ Supabase service role integration
- ✅ User profile fetching and validation
- ✅ Database schema for game sessions
- ✅ Basic user statistics tracking

## Phase 2: Room Management System (Week 3-4)

### 2.1 Room Creation and Joining

**Goal**: Implement public and private room functionality

**Tasks**:
1. **Room Service Implementation**
   ```typescript
   class RoomService {
     static createPublicRoom(): Room
     static createPrivateRoom(hostId: string, settings: GameSettings): Room
     static joinRoom(roomId: string, userId: string): boolean
     static leaveRoom(roomId: string, userId: string): void
     static getRoomStatus(roomId: string): RoomStatus
   }
   ```

2. **Room State Management**
   - In-memory room storage with Redis (optional for scaling)
   - Player list management
   - Room settings (rounds, draw time, word mode, etc.)
   - Host privileges for private rooms

3. **Matchmaking for Public Games**
   - Auto-join available public rooms
   - Create new public room when needed
   - Balance player distribution

4. **Socket Event Handlers**
   ```typescript
   // Public game matchmaking
   socket.on('join-public-game', () => {
     const room = RoomService.findOrCreatePublicRoom();
     RoomService.joinRoom(room.id, user.id);
     socket.join(room.id);
     io.to(room.id).emit('player-joined', playerData);
   });

   // Private room creation
   socket.on('create-private-room', (settings) => {
     const room = RoomService.createPrivateRoom(user.id, settings);
     socket.join(room.id);
     socket.emit('room-created', { roomId: room.id, inviteLink });
   });

   // Join private room
   socket.on('join-private-room', (roomId) => {
     if (RoomService.joinRoom(roomId, user.id)) {
       socket.join(roomId);
       io.to(roomId).emit('player-joined', playerData);
     }
   });
   ```

**Deliverables**:
- ✅ Public room auto-matchmaking
- ✅ Private room creation with invite links
- ✅ Room settings configuration
- ✅ Player join/leave handling
- ✅ Host privilege management

### 2.2 Lobby System

**Goal**: Pre-game lobby with chat and settings

**Tasks**:
1. **Lobby State Management**
   - Player list with ready status
   - Chat functionality in lobby
   - Settings display and modification (host only)

2. **Lobby Events**
   ```typescript
   socket.on('lobby-chat', (message) => {
     // Broadcast to lobby participants
     io.to(roomId).emit('lobby-message', {
       playerId: user.id,
       playerName: user.displayName,
       message: filterProfanity(message),
       timestamp: Date.now()
     });
   });

   socket.on('update-room-settings', (settings) => {
     if (isHost(user.id, roomId)) {
       RoomService.updateSettings(roomId, settings);
       io.to(roomId).emit('settings-updated', settings);
     }
   });

   socket.on('start-game', () => {
     if (isHost(user.id, roomId) && canStartGame(roomId)) {
       GameService.startGame(roomId);
       io.to(roomId).emit('game-starting', gameState);
     }
   });
   ```

3. **Game Start Validation**
   - Minimum 2 players
   - Valid settings (custom words count, etc.)
   - Host authorization for private rooms

**Deliverables**:
- ✅ Lobby chat system
- ✅ Room settings management
- ✅ Game start validation and transition
- ✅ Player ready status tracking

## Phase 3: Core Game Logic (Week 5-6)

### 3.1 Turn Management and Game State

**Goal**: Implement the core turn-based game mechanics

**Tasks**:
1. **Game State Service**
   ```typescript
   class GameService {
     static startGame(roomId: string): GameState
     static startNewTurn(roomId: string): TurnState
     static endTurn(roomId: string, scores: PlayerScores): void
     static endGame(roomId: string): GameResults
     static getGameState(roomId: string): GameState
   }

   interface GameState {
     roomId: string;
     status: 'waiting' | 'active' | 'finished';
     currentRound: number;
     totalRounds: number;
     currentTurn: TurnState | null;
     players: Player[];
     turnOrder: string[]; // player IDs
     settings: GameSettings;
     startedAt: Date;
   }

   interface TurnState {
     drawerId: string;
     word: string;
     wordPattern: string; // "_____ ____" for display
     timeRemaining: number;
     startedAt: Date;
     guessedPlayers: Set<string>;
     hints: { position: number; letter: string }[];
   }
   ```

2. **Turn Cycle Implementation**
   - Player turn order determination
   - Word selection from word bank
   - Timer management with auto-end
   - Round progression logic

3. **Word Selection System**
   ```typescript
   class WordService {
     static getWordChoices(gameSettings: GameSettings): string[]
     static selectWord(roomId: string, word: string): void
     static getWordPattern(word: string): string
     static revealHint(word: string, currentHints: Hint[]): Hint
     static validateGuess(guess: string, word: string): boolean
   }
   ```

4. **Game Events**
   ```typescript
   // Turn management
   socket.on('select-word', (word) => {
     if (isCurrentDrawer(user.id, roomId)) {
       WordService.selectWord(roomId, word);
       GameService.startDrawingPhase(roomId);
       io.to(roomId).emit('turn-started', turnState);
     }
   });

   // Auto word selection timeout
   setTimeout(() => {
     if (!wordSelected) {
       const autoWord = WordService.autoSelectWord(roomId);
       GameService.startDrawingPhase(roomId);
       io.to(roomId).emit('turn-started', turnState);
     }
   }, WORD_SELECTION_TIMEOUT);

   // Turn timer
   const turnTimer = setInterval(() => {
     const timeRemaining = updateTurnTimer(roomId);
     io.to(roomId).emit('timer-update', { timeRemaining });

     if (timeRemaining <= 0) {
       GameService.endTurn(roomId);
       clearInterval(turnTimer);
     }
   }, 1000);
   ```

**Deliverables**:
- ✅ Complete turn management system
- ✅ Word selection and pattern display
- ✅ Turn timer with auto-progression
- ✅ Round and game completion logic

### 3.2 Scoring System

**Goal**: Implement the skribbl.io-style scoring mechanics

**Tasks**:
1. **Scoring Service**
   ```typescript
   class ScoringService {
     static calculateGuesserScore(timeRemaining: number, guessOrder: number): number
     static calculateDrawerScore(correctGuesses: number, totalPlayers: number): number
     static updatePlayerScores(roomId: string, turnResults: TurnResults): void
     static getFinalScores(roomId: string): PlayerScore[]
   }

   interface TurnResults {
     drawerId: string;
     correctGuesses: { playerId: string; timestamp: number }[];
     totalPlayers: number;
     turnDuration: number;
   }
   ```

2. **Scoring Algorithm Implementation**
   - Time-based scoring for guessers (faster = more points)
   - Order-based scoring (first guesser gets most points)
   - Drawer scoring based on guess success rate
   - Progressive point reduction for late guesses

3. **Score Broadcasting**
   ```typescript
   // After each correct guess
   socket.on('correct-guess', (playerId) => {
     const score = ScoringService.calculateGuesserScore(timeRemaining, guessOrder);
     ScoringService.updatePlayerScore(roomId, playerId, score);
     io.to(roomId).emit('player-scored', { playerId, score, totalScore });
   });

   // At turn end
   const drawerScore = ScoringService.calculateDrawerScore(correctGuesses, totalPlayers);
   ScoringService.updatePlayerScore(roomId, drawerId, drawerScore);
   io.to(roomId).emit('turn-ended', {
     word: currentWord,
     scores: turnScores,
     totalScores: gameScores
   });
   ```

**Deliverables**:
- ✅ Time and order-based scoring algorithm
- ✅ Drawer performance scoring
- ✅ Real-time score updates
- ✅ Final game results calculation

## Phase 4: Real-Time Drawing System (Week 7-8)

### 4.1 Drawing Synchronization

**Goal**: Implement real-time drawing stroke broadcasting

**Tasks**:
1. **Drawing Service**
   ```typescript
   class DrawingService {
     static broadcastStroke(roomId: string, strokeData: StrokeData): void
     static clearCanvas(roomId: string): void
     static undoLastStroke(roomId: string): void
     static getCanvasState(roomId: string): CanvasState
     static saveCanvasState(roomId: string, state: CanvasState): void
   }

   interface StrokeData {
     tool: 'pen' | 'bucket' | 'eraser';
     color: string;
     size: number;
     points: [number, number][];
     timestamp: number;
   }
   ```

2. **Canvas State Management**
   - Stroke history for turn duration
   - Canvas state for mid-game joiners
   - Undo/clear operations
   - Tool state synchronization

3. **Drawing Events**
   ```typescript
   socket.on('drawing-stroke', (strokeData) => {
     if (isCurrentDrawer(user.id, roomId)) {
       DrawingService.broadcastStroke(roomId, strokeData);
       socket.to(roomId).emit('drawing-stroke', strokeData);
     }
   });

   socket.on('canvas-clear', () => {
     if (isCurrentDrawer(user.id, roomId)) {
       DrawingService.clearCanvas(roomId);
       io.to(roomId).emit('canvas-cleared');
     }
   });

   socket.on('canvas-undo', () => {
     if (isCurrentDrawer(user.id, roomId)) {
       const newState = DrawingService.undoLastStroke(roomId);
       io.to(roomId).emit('canvas-state', newState);
     }
   });
   ```

4. **Mid-Game Join Canvas Sync**
   ```typescript
   socket.on('request-canvas-state', () => {
     const canvasState = DrawingService.getCanvasState(roomId);
     socket.emit('canvas-state', canvasState);
   });
   ```

**Deliverables**:
- ✅ Real-time stroke broadcasting
- ✅ Canvas state management
- ✅ Undo/clear functionality
- ✅ Mid-game join synchronization

### 4.2 Chat and Guessing System

**Goal**: Implement chat with guess validation and filtering

**Tasks**:
1. **Chat Service**
   ```typescript
   class ChatService {
     static processMessage(roomId: string, playerId: string, message: string): ChatResult
     static validateGuess(guess: string, word: string): boolean
     static filterProfanity(message: string): string
     static rateLimitCheck(playerId: string): boolean
   }

   interface ChatResult {
     type: 'chat' | 'correct_guess' | 'blocked';
     message?: string;
     isCorrect?: boolean;
   }
   ```

2. **Guess Validation**
   - Case-insensitive word matching
   - Whitespace normalization
   - Multi-word phrase handling
   - Prevent word revelation in chat

3. **Chat Events**
   ```typescript
   socket.on('chat-message', (message) => {
     if (!ChatService.rateLimitCheck(user.id)) {
       socket.emit('rate-limited');
       return;
     }

     const result = ChatService.processMessage(roomId, user.id, message);

     if (result.type === 'correct_guess') {
       // Handle correct guess
       GameService.playerGuessedCorrect(roomId, user.id);
       io.to(roomId).emit('player-guessed', {
         playerId: user.id,
         playerName: user.displayName
       });

       // Check if all players guessed
       if (GameService.allPlayersGuessed(roomId)) {
         GameService.endTurn(roomId);
       }
     } else if (result.type === 'chat') {
       // Broadcast chat message
       io.to(roomId).emit('chat-message', {
         playerId: user.id,
         playerName: user.displayName,
         message: result.message,
         timestamp: Date.now()
       });
     }
   });
   ```

4. **Anti-Cheat Measures**
   - Word filtering in chat messages
   - Rate limiting for spam prevention
   - Guess attempt tracking
   - Profanity filtering

**Deliverables**:
- ✅ Real-time chat system
- ✅ Guess validation and scoring
- ✅ Profanity and spam filtering
- ✅ Anti-cheat word filtering

## Phase 5: Client Integration (Week 9-10)

### 5.1 React Native WebSocket Service

**Goal**: Connect existing UI components to WebSocket backend

**Tasks**:
1. **WebSocket Service Implementation**
   ```typescript
   class GameWebSocketService {
     private socket: Socket | null = null;
     private reconnectAttempts = 0;
     private maxReconnectAttempts = 5;

     connect(userToken: string): Promise<void>
     disconnect(): void
     joinPublicGame(): void
     createPrivateRoom(settings: GameSettings): void
     joinPrivateRoom(roomId: string): void

     // Game actions
     selectWord(word: string): void
     sendDrawingStroke(strokeData: StrokeData): void
     sendChatMessage(message: string): void
     clearCanvas(): void
     undoStroke(): void

     // Event listeners
     onPlayerJoined(callback: (player: Player) => void): void
     onGameStarted(callback: (gameState: GameState) => void): void
     onTurnStarted(callback: (turnState: TurnState) => void): void
     onDrawingStroke(callback: (stroke: StrokeData) => void): void
     onChatMessage(callback: (message: ChatMessage) => void): void
     onPlayerGuessed(callback: (playerId: string) => void): void
     onScoreUpdate(callback: (scores: PlayerScores) => void): void
   }
   ```

2. **Game State Store (Zustand)**
   ```typescript
   interface GameState {
     // Connection state
     isConnected: boolean;
     connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

     // Room state
     currentRoom: Room | null;
     isInGame: boolean;

     // Game state
     gameState: GameState | null;
     currentTurn: TurnState | null;
     players: Player[];
     chatMessages: ChatMessage[];

     // Actions
     connect: (token: string) => Promise<void>;
     joinPublicGame: () => void;
     createPrivateRoom: (settings: GameSettings) => void;
     sendMessage: (message: string) => void;
     sendDrawingStroke: (stroke: StrokeData) => void;
   }
   ```

3. **Integration with Existing Components**
   - Update DrawingBattleScreen to use real game state
   - Connect DrawingCanvas to WebSocket drawing events
   - Integrate ChatSection with real chat system
   - Update PlayerList with real player data and scores
   - Connect TopBar to real game timer and word display

**Deliverables**:
- ✅ Complete WebSocket service integration
- ✅ Game state management with Zustand
- ✅ All UI components connected to real backend
- ✅ Error handling and reconnection logic

### 5.2 Testing and Optimization

**Goal**: Ensure system reliability and performance

**Tasks**:
1. **Connection Reliability**
   - Automatic reconnection with exponential backoff
   - Network change detection and handling
   - Background/foreground app state management
   - Connection quality monitoring

2. **Performance Optimization**
   - Drawing stroke batching and compression
   - Message queue for offline scenarios
   - Memory management for long games
   - Canvas rendering optimization

3. **Error Handling**
   - Network error recovery
   - Invalid game state handling
   - User feedback for connection issues
   - Graceful degradation

4. **Testing Scenarios**
   - Multiple players in same room
   - Network interruption during game
   - App backgrounding/foregrounding
   - Rapid drawing and chat messages

**Deliverables**:
- ✅ Robust connection management
- ✅ Optimized real-time performance
- ✅ Comprehensive error handling
- ✅ Tested multiplayer scenarios

## Phase 6: Deployment and Monitoring (Week 11-12)

### 6.1 Production Deployment

**Goal**: Deploy WebSocket server to production environment

**Tasks**:
1. **Server Deployment**
   - Heroku/Railway deployment configuration
   - Environment variable management
   - SSL/WSS configuration
   - Load balancer setup (if needed)

2. **Database Integration**
   - Production Supabase configuration
   - Game session persistence
   - Player statistics tracking
   - Leaderboard data management

3. **Monitoring Setup**
   - Server health monitoring
   - WebSocket connection metrics
   - Game session analytics
   - Error tracking and alerting

**Deliverables**:
- ✅ Production WebSocket server deployment
- ✅ Database integration and persistence
- ✅ Monitoring and analytics setup
- ✅ Performance metrics tracking

## Implementation Timeline

| Week | Phase | Focus | Deliverables |
|------|-------|-------|--------------|
| 1-2  | Phase 1 | WebSocket Foundation | Server setup, authentication, Supabase integration |
| 3-4  | Phase 2 | Room Management | Public/private rooms, lobby system, matchmaking |
| 5-6  | Phase 3 | Game Logic | Turn management, scoring, word selection |
| 7-8  | Phase 4 | Real-time Features | Drawing sync, chat system, guess validation |
| 9-10 | Phase 5 | Client Integration | React Native service, UI connection, testing |
| 11-12| Phase 6 | Deployment | Production deployment, monitoring, optimization |

## Risk Mitigation

1. **WebSocket Reliability**: Implement aggressive reconnection and fallback strategies
2. **Scalability**: Design for horizontal scaling from day one
3. **Data Consistency**: Use Supabase for persistent data, WebSocket for ephemeral state
4. **Mobile Networks**: Optimize for high latency and unstable connections
5. **Security**: Validate all inputs, implement rate limiting, filter content

## Success Metrics

- **Latency**: Drawing strokes <50ms, chat messages <100ms
- **Reliability**: 99.9% uptime, <3 second reconnection
- **Scalability**: Support 100 concurrent games (800 players)
- **User Experience**: Smooth gameplay on 3G networks

This plan leverages your existing UI components and Supabase authentication while adding the real-time multiplayer functionality through a dedicated WebSocket server. The phased approach ensures steady progress with testable milestones at each stage.