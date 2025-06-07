/**
 * Authentication middleware for WebSocket connections
 * Validates JWT tokens from React Native clients
 */

import { Socket } from 'socket.io';
import { supabaseService } from '../services/supabaseClient';
import { Player, PlayerJoinData } from '../types/player';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userProfile?: any;
  isAuthenticated?: boolean;
  connectionStartTime?: Date;
  lastActivity?: Date;
}

/**
 * Middleware to authenticate socket connections
 */
export const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    console.log(`🔐 Authentication attempt for socket ${socket.id}`);
    
    // Set connection start time
    socket.connectionStartTime = new Date();
    socket.lastActivity = new Date();
    
    // Extract token from handshake auth
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      console.log(`❌ No token provided for socket ${socket.id}`);
      return next(new Error('Authentication token required'));
    }

    // Validate token with Supabase
    const validation = await supabaseService.validateUserToken(token);
    
    if (!validation.valid || !validation.userId) {
      console.log(`❌ Invalid token for socket ${socket.id}: ${validation.error}`);
      return next(new Error(validation.error || 'Invalid authentication token'));
    }

    // Get user profile
    const userProfile = await supabaseService.getUserProfile(validation.userId);
    
    if (!userProfile) {
      console.log(`❌ User profile not found for ${validation.userId}`);
      return next(new Error('User profile not found'));
    }

    // Check if profile is complete
    if (!userProfile.has_completed_profile_setup) {
      console.log(`❌ Incomplete profile for user ${validation.userId}`);
      return next(new Error('Profile setup not completed'));
    }

    // Attach user data to socket
    socket.userId = validation.userId;
    socket.userProfile = userProfile;
    socket.isAuthenticated = true;

    console.log(`✅ Socket ${socket.id} authenticated as ${userProfile.display_name} (${validation.userId})`);
    
    // Set up activity tracking
    setupActivityTracking(socket);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

/**
 * Set up activity tracking for mobile connection monitoring
 */
function setupActivityTracking(socket: AuthenticatedSocket) {
  // Update last activity on any event
  const originalEmit = socket.emit;
  socket.emit = function(...args) {
    socket.lastActivity = new Date();
    return originalEmit.apply(this, args);
  };

  // Track mobile-specific events
  socket.on('mobile_event', (eventData) => {
    socket.lastActivity = new Date();
    console.log(`📱 Mobile event from ${socket.userId}: ${eventData.eventType}`);
    
    // Handle specific mobile events
    switch (eventData.eventType) {
      case 'app_background':
        // Reduce heartbeat frequency when app is backgrounded
        socket.emit('mobile_optimization', {
          heartbeatInterval: 60000, // 1 minute
          strokeBatching: true,
          compressionLevel: 7
        });
        break;
      
      case 'app_foreground':
        // Restore normal heartbeat when app is foregrounded
        socket.emit('mobile_optimization', {
          heartbeatInterval: 25000, // 25 seconds
          strokeBatching: false,
          compressionLevel: 3
        });
        break;
      
      case 'network_change':
        // Adjust settings based on network type
        const networkType = eventData.data?.connectionType;
        if (networkType === 'cellular') {
          socket.emit('mobile_optimization', {
            strokeBatching: true,
            compressionLevel: 8,
            heartbeatInterval: 30000
          });
        } else if (networkType === 'wifi') {
          socket.emit('mobile_optimization', {
            strokeBatching: false,
            compressionLevel: 3,
            heartbeatInterval: 25000
          });
        }
        break;
      
      case 'low_battery':
        // Optimize for battery saving
        socket.emit('mobile_optimization', {
          heartbeatInterval: 45000,
          strokeBatching: true,
          compressionLevel: 9
        });
        break;
    }
  });

  // Handle connection quality updates
  socket.on('connection_quality', (qualityData) => {
    socket.lastActivity = new Date();
    
    // Adjust settings based on connection quality
    if (qualityData.latency > 200 || qualityData.packetLoss > 5) {
      // Poor connection - optimize
      socket.emit('mobile_optimization', {
        strokeBatching: true,
        compressionLevel: 8,
        heartbeatInterval: 35000,
        reconnectionDelay: 2000
      });
    } else if (qualityData.latency < 50 && qualityData.packetLoss < 1) {
      // Excellent connection - full features
      socket.emit('mobile_optimization', {
        strokeBatching: false,
        compressionLevel: 2,
        heartbeatInterval: 20000,
        reconnectionDelay: 500
      });
    }
  });

  // Heartbeat for mobile connection monitoring
  socket.on('ping', (timestamp) => {
    socket.lastActivity = new Date();
    socket.emit('pong', timestamp);
  });
}

/**
 * Create Player object from authenticated socket
 */
export function createPlayerFromSocket(socket: AuthenticatedSocket): Player {
  if (!socket.isAuthenticated || !socket.userId || !socket.userProfile) {
    throw new Error('Socket not authenticated');
  }

  const profile = socket.userProfile;
  
  return {
    id: socket.userId,
    socketId: socket.id,
    displayName: profile.display_name,
    avatar: profile.avatar_data ? {
      type: profile.avatar_data.type || 'icon',
      data: profile.avatar_data.data || 'person',
      backgroundColor: profile.avatar_data.backgroundColor
    } : undefined,
    score: 0,
    totalScore: profile.total_score || 0,
    isReady: false,
    isDrawing: false,
    hasGuessed: false,
    isConnected: true,
    joinedAt: socket.connectionStartTime || new Date(),
    lastActivity: socket.lastActivity || new Date(),
    connectionQuality: {
      latency: 0,
      packetLoss: 0,
      connectionType: 'unknown',
      signalStrength: 'good'
    }
  };
}

/**
 * Middleware to check if socket is authenticated
 */
export function requireAuth(socket: AuthenticatedSocket, next: (err?: Error) => void) {
  if (!socket.isAuthenticated || !socket.userId) {
    return next(new Error('Authentication required'));
  }
  next();
}

/**
 * Get user ID from authenticated socket
 */
export function getUserId(socket: AuthenticatedSocket): string {
  if (!socket.userId) {
    throw new Error('Socket not authenticated');
  }
  return socket.userId;
}

/**
 * Check if socket belongs to specific user
 */
export function isUser(socket: AuthenticatedSocket, userId: string): boolean {
  return socket.userId === userId;
}

export type { AuthenticatedSocket };
