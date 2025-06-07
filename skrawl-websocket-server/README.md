# Skrawl WebSocket Server

Real-time multiplayer drawing game server optimized for React Native mobile clients.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase project with service role key
- React Native client app

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   npm run setup-env
   ```
   Follow the prompts to enter your Supabase credentials.

3. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or your configured port).

## 📱 Mobile Optimizations

This server is specifically optimized for React Native mobile clients:

- **Connection Management**: Automatic reconnection with exponential backoff
- **Network Adaptation**: Adjusts settings based on WiFi/cellular connection
- **Battery Optimization**: Reduces heartbeat frequency when app is backgrounded
- **Bandwidth Compression**: Compresses drawing data for mobile networks
- **Latency Handling**: Optimized for high-latency mobile connections

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │   WebSocket      │    │    Supabase     │
│     Client      │◄──►│     Server       │◄──►│   (Auth + DB)   │
│  (Mobile App)   │    │  (This Server)   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Responsibilities

**WebSocket Server (This)**:
- Real-time game logic
- Drawing synchronization
- Chat and messaging
- Turn management
- Room management

**Supabase**:
- User authentication
- User profiles
- Game history
- Leaderboards
- Persistent data

## 🎮 Game Features (Implementation Status)

### ✅ Phase 1: Foundation (COMPLETED)
- [x] WebSocket server with mobile optimizations
- [x] JWT authentication with Supabase
- [x] Connection quality monitoring
- [x] Mobile event handling
- [x] Basic error handling

### 🚧 Phase 2: Room Management (IN PROGRESS)
- [ ] Public game matchmaking
- [ ] Private room creation
- [ ] Lobby system with chat
- [ ] Host privileges
- [ ] Player join/leave handling

### 📋 Phase 3: Game Logic (PLANNED)
- [ ] Turn-based gameplay
- [ ] Word selection system
- [ ] Scoring mechanics
- [ ] Round management
- [ ] Game completion

### 📋 Phase 4: Real-time Features (PLANNED)
- [ ] Drawing synchronization
- [ ] Chat with guess validation
- [ ] Anti-cheat measures
- [ ] Profanity filtering

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Required |
| `SUPABASE_ANON_KEY` | Supabase anon key | Required |
| `HEARTBEAT_INTERVAL_MS` | Mobile heartbeat interval | `25000` |
| `CONNECTION_TIMEOUT_MS` | Connection timeout | `20000` |
| `MAX_RECONNECTION_ATTEMPTS` | Max reconnection tries | `10` |

### Mobile-Specific Settings

The server automatically adjusts these based on client conditions:

- **WiFi**: Full features, low compression
- **Cellular**: Stroke batching, higher compression
- **Low Battery**: Extended heartbeat, maximum compression
- **Background**: Reduced frequency, minimal features

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns server status and metrics.

### Server Info
```
GET /info
```
Returns server information and capabilities.

## 📡 Socket Events

### Client → Server
- `authenticate` - JWT token authentication
- `join_public_game` - Join public matchmaking
- `create_private_room` - Create private room
- `mobile_event` - Mobile app lifecycle events
- `connection_quality` - Network quality updates
- `ping` - Heartbeat for connection monitoring

### Server → Client
- `authenticated` - Authentication result
- `mobile_optimization` - Optimization settings
- `error` - Error messages
- `pong` - Heartbeat response

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run setup-env    # Configure environment
npm run type-check   # TypeScript type checking
npm run clean        # Clean build files
```

### Project Structure
```
src/
├── server.ts              # Main server entry
├── middleware/
│   └── auth.ts            # JWT authentication
├── services/
│   └── supabaseClient.ts  # Supabase integration
├── types/
│   ├── player.ts          # Player types
│   ├── game.ts            # Game state types
│   └── events.ts          # Socket event types
└── utils/                 # Utility functions
```

## 🔒 Security

- JWT token validation for all connections
- Rate limiting for mobile clients
- Input sanitization and validation
- CORS configuration for React Native
- Environment variable protection

## 📊 Monitoring

The server provides real-time metrics:
- Active connections
- Memory usage
- Connection quality
- Mobile events
- Error rates

Access via `/health` endpoint or server logs.

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Setup
Ensure all environment variables are configured in production. Never expose service role keys in client code.

## 🤝 Integration with React Native

This server is designed to work seamlessly with the Skrawl React Native app. The mobile client should:

1. Authenticate with Supabase JWT token
2. Connect to WebSocket server
3. Handle mobile-specific events
4. Monitor connection quality
5. Implement reconnection logic

## 📝 License

Private project for Skrawl drawing game.
