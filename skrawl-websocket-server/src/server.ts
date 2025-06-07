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
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: io.engine.clientsCount,
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
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

  // Basic room management (Phase 2 will expand this)
  socket.on('join_public_game', () => {
    console.log(`🎮 ${socket.userProfile?.display_name} wants to join public game`);
    // TODO: Implement in Phase 2
    socket.emit('error', {
      code: 'NOT_IMPLEMENTED',
      message: 'Public game joining will be implemented in Phase 2',
      timestamp: Date.now()
    });
  });

  socket.on('create_private_room', (settings) => {
    console.log(`🏠 ${socket.userProfile?.display_name} wants to create private room`);
    // TODO: Implement in Phase 2
    socket.emit('error', {
      code: 'NOT_IMPLEMENTED',
      message: 'Private room creation will be implemented in Phase 2',
      timestamp: Date.now()
    });
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
    
    // TODO: Handle player leaving rooms in Phase 2
    
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
