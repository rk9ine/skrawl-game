# Skrawl Real-Time Architecture Recommendation

## Executive Summary

**Recommendation: Hybrid WebSocket + Supabase Architecture**

Primary real-time communication via Socket.io WebSocket server with Supabase for authentication and persistent data.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │   WebSocket      │    │    Supabase     │
│     Client      │◄──►│     Server       │◄──►│   (Auth + DB)   │
│                 │    │  (Socket.io)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Technical Justification

### Why WebSocket Over Supabase Realtime

1. **Ultra-Low Latency Requirements**
   - Drawing synchronization needs <50ms latency
   - Socket.io provides direct WebSocket connection
   - Supabase Realtime adds abstraction layer overhead

2. **Mobile Network Reliability**
   - Socket.io has superior reconnection handling
   - Better WiFi/cellular switching support
   - Custom retry logic for unstable connections

3. **Drawing Data Optimization**
   - Can implement custom compression for stroke data
   - Batch multiple drawing points efficiently
   - Optimize payload structure for mobile bandwidth

4. **Game-Specific Features**
   - Custom room management logic
   - Turn-based state machine control
   - Real-time player cursor tracking

### Why Keep Supabase

1. **Authentication Integration**
   - Existing Google OAuth setup
   - JWT token validation
   - User profile management

2. **Persistent Data**
   - Game history and statistics
   - Leaderboards and rankings
   - User preferences and settings

3. **Development Efficiency**
   - Proven authentication flow
   - Database schema already designed
   - Reduced backend complexity

## Implementation Plan

### Phase 1: WebSocket Server Setup

**Technology Stack:**
- Node.js + Socket.io server
- JWT authentication middleware
- Redis for session management
- Docker deployment

**Core Features:**
```javascript
// Game room events
socket.on('join-room', (roomId, userToken))
socket.on('leave-room', (roomId))
socket.on('start-game', (roomId))

// Drawing events
socket.on('drawing-stroke', (strokeData))
socket.on('drawing-clear', ())
socket.on('drawing-undo', ())

// Chat events
socket.on('chat-message', (message))
socket.on('chat-guess', (guess))

// Game state events
socket.on('turn-start', (playerId, word))
socket.on('turn-end', (scores))
socket.on('game-end', (finalScores))
```

### Phase 2: Client Integration

**React Native Implementation:**
```typescript
// WebSocket service
class GameWebSocketService {
  private socket: Socket;
  
  connect(userToken: string) {
    this.socket = io(WS_SERVER_URL, {
      auth: { token: userToken },
      transports: ['websocket'],
      upgrade: false,
      rememberUpgrade: false
    });
  }
  
  // Drawing synchronization
  sendDrawingStroke(strokeData: DrawingStroke) {
    this.socket.emit('drawing-stroke', strokeData);
  }
  
  onDrawingStroke(callback: (stroke: DrawingStroke) => void) {
    this.socket.on('drawing-stroke', callback);
  }
}
```

### Phase 3: Optimization Features

1. **Connection Management**
   - Automatic reconnection with exponential backoff
   - Connection quality monitoring
   - Graceful degradation for poor networks

2. **Drawing Optimization**
   - Stroke compression and batching
   - Predictive drawing for smooth experience
   - Canvas state synchronization

3. **Mobile-Specific Enhancements**
   - Background/foreground handling
   - Network change detection
   - Battery optimization

## Performance Specifications

### Latency Targets
- Drawing stroke propagation: <50ms
- Chat messages: <100ms
- Game state updates: <200ms

### Scalability Targets
- 100 concurrent games (800 players)
- 1000 messages/second per server
- Horizontal scaling with load balancer

### Mobile Network Handling
- Automatic reconnection within 3 seconds
- Graceful handling of network switches
- Offline queue for critical messages

## Security Considerations

1. **Authentication**
   - JWT token validation on WebSocket connection
   - Supabase user context verification
   - Rate limiting per user

2. **Game Integrity**
   - Server-side game state validation
   - Anti-cheat measures for drawing/guessing
   - Room access control

3. **Data Protection**
   - Encrypted WebSocket connections (WSS)
   - Message sanitization
   - User data privacy compliance

## Development Timeline

**Week 1-2: WebSocket Server**
- Basic Socket.io server setup
- JWT authentication middleware
- Room management system

**Week 3-4: Client Integration**
- React Native WebSocket service
- Drawing synchronization
- Chat functionality

**Week 5-6: Game Logic**
- Turn management
- Scoring system
- Game state synchronization

**Week 7-8: Optimization**
- Performance tuning
- Mobile network handling
- Testing and debugging

## Deployment Strategy

1. **Development Environment**
   - Local Socket.io server
   - Ngrok for mobile testing
   - Development Supabase instance

2. **Production Environment**
   - Heroku/Railway for WebSocket server
   - Redis Cloud for session storage
   - Production Supabase instance

3. **Monitoring**
   - WebSocket connection metrics
   - Latency monitoring
   - Error tracking and alerts

## Risk Mitigation

1. **WebSocket Server Reliability**
   - Health checks and auto-restart
   - Load balancer with multiple instances
   - Fallback to Supabase Realtime if needed

2. **Mobile Network Issues**
   - Aggressive reconnection strategy
   - Local state caching
   - User feedback for connection status

3. **Scalability Concerns**
   - Horizontal scaling architecture
   - Database connection pooling
   - Caching strategy for game state

## Conclusion

The hybrid WebSocket + Supabase architecture provides the best balance of performance, reliability, and development efficiency for Skrawl's real-time multiplayer requirements. This approach leverages the strengths of both technologies while mitigating their individual weaknesses.

The WebSocket server handles the latency-critical real-time features, while Supabase continues to provide robust authentication and data persistence. This architecture is specifically optimized for mobile drawing games and addresses the unique challenges of real-time collaboration on mobile networks.
