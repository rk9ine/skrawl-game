/**
 * Skrawl WebSocket Server
 * Optimized for React Native mobile clients
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateSocket, createPlayerFromSocket, AuthenticatedSocket } from './middleware/auth';
import { ClientToServerEvents, ServerToClientEvents } from './types/events';
import { RoomService } from './services/roomService';
import { LobbyService } from './services/lobbyService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration for React Native
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:8081',      // Expo development server
      'exp://192.168.1.100:8081',  // Expo on local network
      'exp://localhost:19000',     // Expo development
    ];
    
    // Allow any localhost or 192.168.x.x for development
    if (origin.includes('localhost') || origin.includes('192.168.') || origin.includes('exp://')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log(`❌ CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO server with mobile optimizations
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: corsOptions,
  
  // Mobile-optimized transport settings
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  
  // Connection settings optimized for mobile networks
  pingTimeout: parseInt(process.env.CONNECTION_TIMEOUT_MS || '20000'),
  pingInterval: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '25000'),
  
  // Upgrade settings for mobile
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6, // 1MB for drawing data
  
  // Compression for mobile bandwidth
  httpCompression: {
    threshold: 1024,
    level: 6,
    chunkSize: 1024,
  },
  
  // Connection state recovery for mobile disconnections
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const roomStats = RoomService.getStats();
    const lobbyStats = LobbyService.getStats();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connections: io.engine.clientsCount,
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      rooms: roomStats,
      lobbies: lobbyStats,
      phase: 'Phase 2 - Room Management'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to get server stats'
    });
  }
});

// Server info endpoint
app.get('/info', (req, res) => {
  res.json({
    name: 'Skrawl WebSocket Server',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Real-time multiplayer drawing game server optimized for React Native',
    features: [
      'Mobile-optimized WebSocket connections',
      'React Native compatibility',
      'Automatic reconnection handling',
      'Network quality adaptation',
      'Battery optimization',
      'Bandwidth compression'
    ],
    endpoints: {
      health: '/health',
      info: '/info'
    }
  });
});

// Authentication middleware for all socket connections
io.use(authenticateSocket);

// Connection handling
io.on('connection', (socket: AuthenticatedSocket) => {
  console.log(`📱 Mobile client connected: ${socket.id} (User: ${socket.userProfile?.display_name})`);
  
  // Send initial mobile optimization settings
  socket.emit('mobile_optimization', {
    strokeBatching: false,
    compressionLevel: 3,
    heartbeatInterval: 25000,
    reconnectionDelay: 1000,
    maxReconnectionAttempts: 10
  });

  // Handle authentication confirmation
  socket.on('authenticate', (token: string) => {
    // Already authenticated by middleware, just confirm
    socket.emit('authenticated', true);
  });

  // Phase 2: Room Management Implementation

  // Join public game
  socket.on('join_public_game', async () => {
    try {
      console.log(`🎮 ${socket.userProfile?.display_name} joining public game`);

      const player = createPlayerFromSocket(socket);
      const { room, isNewRoom } = await RoomService.joinPublicGame(player);

      // Join socket room
      socket.join(room.id);

      // Send room data to player
      socket.emit('room_joined', {
        roomId: room.id,
        gameState: room.gameState,
        players: Array.from(room.players.values()),
        isHost: false, // Public games have no host
        canvasState: undefined // No canvas state in lobby
      });

      // Notify other players
      socket.to(room.id).emit('player_joined', player);

      // Handle lobby join and broadcast system message
      const joinMessage = LobbyService.handlePlayerJoin(room.id, player);

      // Broadcast join system message to ALL players in room (including new player)
      io.to(room.id).emit('lobby_message', joinMessage);

      // Industry standard: No message history for new players
      // Players start with clean chat - only see messages from current session

      console.log(`✅ ${player.displayName} joined public room ${room.id}`);

    } catch (error) {
      console.error(`❌ Failed to join public game:`, error);
      socket.emit('error', {
        code: 'JOIN_FAILED',
        message: error instanceof Error ? error.message : 'Failed to join public game',
        timestamp: Date.now()
      });
    }
  });

  // Create private room
  socket.on('create_private_room', async (settings) => {
    try {
      console.log(`🏠 ${socket.userProfile?.display_name} creating private room`);

      const player = createPlayerFromSocket(socket);
      const room = await RoomService.createPrivateRoom(player, settings);

      // Join socket room
      socket.join(room.id);

      // Send room creation confirmation
      socket.emit('room_created', {
        roomId: room.id,
        inviteLink: `skrawl://join/${room.inviteCode}`,
        settings: room.gameState.settings
      });

      // Send room data
      socket.emit('room_joined', {
        roomId: room.id,
        gameState: room.gameState,
        players: Array.from(room.players.values()),
        isHost: true,
        canvasState: undefined
      });

      // Handle lobby join
      LobbyService.handlePlayerJoin(room.id, player);

      console.log(`✅ ${player.displayName} created private room ${room.id} with invite code ${room.inviteCode}`);

    } catch (error) {
      console.error(`❌ Failed to create private room:`, error);
      socket.emit('error', {
        code: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create private room',
        timestamp: Date.now()
      });
    }
  });

  // Join private room
  socket.on('join_private_room', async (roomId) => {
    try {
      console.log(`🏠 ${socket.userProfile?.display_name} joining private room ${roomId}`);

      const player = createPlayerFromSocket(socket);
      const room = await RoomService.joinPrivateRoom(player, roomId);

      // Join socket room
      socket.join(room.id);

      // Send room data to player
      socket.emit('room_joined', {
        roomId: room.id,
        gameState: room.gameState,
        players: Array.from(room.players.values()),
        isHost: room.hostId === player.id,
        canvasState: undefined
      });

      // Notify other players
      socket.to(room.id).emit('player_joined', player);

      // Handle lobby join and broadcast system message
      const joinMessage = LobbyService.handlePlayerJoin(room.id, player);

      // Broadcast join system message to ALL players in room (including new player)
      io.to(room.id).emit('lobby_message', joinMessage);

      // Industry standard: No message history for new players
      // Players start with clean chat - only see messages from current session

      console.log(`✅ ${player.displayName} joined private room ${room.id}`);

    } catch (error) {
      console.error(`❌ Failed to join private room:`, error);
      socket.emit('error', {
        code: 'JOIN_FAILED',
        message: error instanceof Error ? error.message : 'Failed to join private room',
        timestamp: Date.now()
      });
    }
  });

  // Leave room
  socket.on('leave_room', () => {
    try {
      const player = createPlayerFromSocket(socket);
      const room = RoomService.getPlayerRoom(player.id);

      if (room) {
        console.log(`🚪 ${player.displayName} leaving room ${room.id}`);

        // Leave socket room
        socket.leave(room.id);

        // Handle lobby leave and broadcast system message
        const leaveMessage = LobbyService.handlePlayerLeave(room.id, player.id);

        // Remove from room service
        RoomService.leaveRoom(player.id);

        // Notify other players
        socket.to(room.id).emit('player_left', player.id, 'left');

        // Broadcast leave system message to remaining players
        if (leaveMessage) {
          socket.to(room.id).emit('lobby_message', leaveMessage);
        }

        console.log(`✅ ${player.displayName} left room ${room.id}`);
      }

    } catch (error) {
      console.error(`❌ Failed to leave room:`, error);
    }
  });

  // Lobby event handlers

  // Lobby chat
  socket.on('lobby_chat', (message) => {
    try {
      const player = createPlayerFromSocket(socket);
      const lobbyMessage = LobbyService.sendLobbyMessage(player.id, message);

      if (lobbyMessage) {
        const room = RoomService.getPlayerRoom(player.id);
        if (room) {
          // Broadcast to all players in room
          io.to(room.id).emit('lobby_message', lobbyMessage);
        }
      }

    } catch (error) {
      console.error(`❌ Lobby chat error:`, error);
    }
  });

  // Player ready status
  socket.on('player_ready', (ready) => {
    try {
      const player = createPlayerFromSocket(socket);
      const result = LobbyService.setPlayerReady(player.id, ready);

      if (result.success) {
        const room = RoomService.getPlayerRoom(player.id);
        if (room) {
          // Broadcast ready status change
          io.to(room.id).emit('player_ready_changed', player.id, ready);

          // Broadcast ready status system message to all players
          if (result.systemMessage) {
            io.to(room.id).emit('lobby_message', result.systemMessage);
          }
        }
      }

    } catch (error) {
      console.error(`❌ Player ready error:`, error);
    }
  });

  // Update room settings (host only)
  socket.on('update_room_settings', (settings) => {
    try {
      const player = createPlayerFromSocket(socket);
      const success = LobbyService.updateRoomSettings(player.id, settings);

      if (success) {
        const room = RoomService.getPlayerRoom(player.id);
        if (room) {
          // Broadcast settings update
          io.to(room.id).emit('room_settings_updated', room.gameState.settings);
        }
      } else {
        socket.emit('error', {
          code: 'UPDATE_FAILED',
          message: 'Failed to update room settings - you may not be the host',
          timestamp: Date.now()
        });
      }

    } catch (error) {
      console.error(`❌ Update settings error:`, error);
      socket.emit('error', {
        code: 'UPDATE_FAILED',
        message: 'Failed to update room settings',
        timestamp: Date.now()
      });
    }
  });

  // Start game (host only for private rooms)
  socket.on('start_game', () => {
    try {
      const player = createPlayerFromSocket(socket);
      const room = RoomService.getPlayerRoom(player.id);

      if (!room) {
        socket.emit('error', {
          code: 'NO_ROOM',
          message: 'You are not in a room',
          timestamp: Date.now()
        });
        return;
      }

      const canStart = LobbyService.canStartGame(room.id, player.id);

      if (!canStart.canStart) {
        socket.emit('error', {
          code: 'CANNOT_START',
          message: canStart.reason || 'Cannot start game',
          timestamp: Date.now()
        });
        return;
      }

      console.log(`🎮 Starting game in room ${room.id}`);

      // Update game status
      room.gameState.status = 'starting';
      room.gameState.startedAt = new Date();

      // Broadcast game starting
      io.to(room.id).emit('game_starting', room.gameState);

      // TODO: Phase 3 will implement actual game logic
      // For now, just notify that game would start
      setTimeout(() => {
        io.to(room.id).emit('game_started', room.gameState);
        console.log(`✅ Game started in room ${room.id}`);
      }, 3000); // 3 second countdown

    } catch (error) {
      console.error(`❌ Start game error:`, error);
      socket.emit('error', {
        code: 'START_FAILED',
        message: 'Failed to start game',
        timestamp: Date.now()
      });
    }
  });

  // Mobile-specific event handlers
  socket.on('mobile_event', (event) => {
    console.log(`📱 Mobile event from ${socket.userProfile?.display_name}: ${event.eventType}`);
    // Handled in auth middleware
  });

  socket.on('connection_quality', (quality) => {
    console.log(`📶 Connection quality update from ${socket.userProfile?.display_name}: ${quality.signalStrength}`);
    // Handled in auth middleware
  });

  // Heartbeat handling
  socket.on('ping', (timestamp) => {
    socket.emit('pong', timestamp);
  });

  // Disconnection handling
  socket.on('disconnect', (reason) => {
    console.log(`📱 Mobile client disconnected: ${socket.id} (${socket.userProfile?.display_name}) - Reason: ${reason}`);

    try {
      // Handle player leaving room
      const player = createPlayerFromSocket(socket);
      const room = RoomService.getPlayerRoom(player.id);

      if (room) {
        console.log(`🚪 ${player.displayName} disconnected from room ${room.id}`);

        // Handle lobby leave and broadcast system message
        const leaveMessage = LobbyService.handlePlayerLeave(room.id, player.id);

        // Remove from room service
        RoomService.leaveRoom(player.id);

        // Notify other players
        socket.to(room.id).emit('player_left', player.id, 'disconnected');

        // Broadcast leave system message to remaining players
        if (leaveMessage) {
          socket.to(room.id).emit('lobby_message', leaveMessage);
        }

        console.log(`✅ ${player.displayName} removed from room ${room.id} due to disconnect`);
      }

    } catch (error) {
      console.error(`❌ Error handling disconnect:`, error);
    }

    // Log disconnection for analytics
    const connectionDuration = socket.connectionStartTime ?
      Date.now() - socket.connectionStartTime.getTime() : 0;

    console.log(`📊 Connection duration: ${Math.round(connectionDuration / 1000)}s`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// Global error handling
io.engine.on('connection_error', (err) => {
  console.error('❌ Connection error:', err.req);
  console.error('❌ Error code:', err.code);
  console.error('❌ Error message:', err.message);
  console.error('❌ Error context:', err.context);
});

// Server startup
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('🚀 Skrawl WebSocket Server started');
  console.log(`📱 Optimized for React Native mobile clients`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Server info: http://localhost:${PORT}/info`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log mobile optimization settings
  console.log('📱 Mobile Optimizations:');
  console.log(`   • Heartbeat interval: ${process.env.HEARTBEAT_INTERVAL_MS || '25000'}ms`);
  console.log(`   • Connection timeout: ${process.env.CONNECTION_TIMEOUT_MS || '20000'}ms`);
  console.log(`   • Max reconnection attempts: ${process.env.MAX_RECONNECTION_ATTEMPTS || '10'}`);
  console.log(`   • Compression enabled: true`);
  console.log(`   • Connection state recovery: 2 minutes`);

  // Phase 2 features
  console.log('🎮 Phase 2 Features Enabled:');
  console.log(`   • Public game matchmaking`);
  console.log(`   • Private room creation`);
  console.log(`   • Lobby chat system`);
  console.log(`   • Room settings management`);
  console.log(`   • Player ready status`);

  // Start periodic cleanup
  setInterval(() => {
    try {
      const roomStats = RoomService.getStats();
      const lobbyStats = LobbyService.getStats();

      console.log(`📊 Server Stats: ${roomStats.totalRooms} rooms, ${roomStats.totalPlayers} players, ${lobbyStats.totalMessages} lobby messages`);

      // Cleanup inactive rooms and lobbies every 5 minutes
      // This will be called every 5 minutes but only cleanup if needed
    } catch (error) {
      console.error('❌ Error in periodic cleanup:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default server;
