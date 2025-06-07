/**
 * WebSocket service for Skrawl mobile drawing game
 * Connects React Native app to WebSocket server
 */

import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';
import { ENV } from '../config/env';
import { useAuthStore } from '../store/authStore';

// Types for mobile-optimized events
interface MobileEvent {
  eventType: 'app_background' | 'app_foreground' | 'network_change' | 'low_battery';
  timestamp: number;
  data?: any;
}

interface ConnectionQuality {
  latency: number;
  packetLoss: number;
  connectionType: 'wifi' | 'cellular' | 'unknown';
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MobileOptimizationSettings {
  strokeBatching: boolean;
  compressionLevel: number;
  heartbeatInterval: number;
  reconnectionDelay: number;
  maxReconnectionAttempts: number;
}

class GameWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;
  private connectionStartTime = 0;
  private lastPingTime = 0;
  private currentLatency = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;

  // Mobile optimization settings
  private optimizationSettings: MobileOptimizationSettings = {
    strokeBatching: false,
    compressionLevel: 3,
    heartbeatInterval: 25000,
    reconnectionDelay: 1000,
    maxReconnectionAttempts: 10
  };

  constructor() {
    this.setupMobileEventListeners();
  }

  /**
   * Connect to WebSocket server with mobile optimizations
   */
  async connect(): Promise<boolean> {
    if (this.socket?.connected || this.isConnecting) {
      console.log('🔌 Already connected or connecting to WebSocket');
      return true;
    }

    try {
      this.isConnecting = true;
      this.connectionStartTime = Date.now();

      // Get authentication token
      const { session } = useAuthStore.getState();
      if (!session?.access_token) {
        console.error('❌ No authentication token available');
        this.isConnecting = false;
        return false;
      }

      console.log('🔌 Connecting to WebSocket server:', ENV.WEBSOCKET_URL);

      // Create socket with mobile-optimized configuration
      this.socket = io(ENV.WEBSOCKET_URL, {
        auth: {
          token: session.access_token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: this.optimizationSettings.reconnectionDelay,
        reconnectionAttempts: this.optimizationSettings.maxReconnectionAttempts,
        forceNew: true,
        // Mobile-specific optimizations
        upgrade: true,
        rememberUpgrade: false,
        compression: true
      });

      this.setupSocketEventListeners();
      this.startHeartbeat();

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error('❌ WebSocket connection timeout');
          this.isConnecting = false;
          resolve(false);
        }, 20000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          const connectionTime = Date.now() - this.connectionStartTime;
          console.log(`✅ Connected to WebSocket server in ${connectionTime}ms`);
          
          // Send initial mobile event
          this.sendMobileEvent({
            eventType: 'app_foreground',
            timestamp: Date.now()
          });

          resolve(true);
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error('❌ WebSocket connection error:', error.message);
          resolve(false);
        });
      });

    } catch (error) {
      this.isConnecting = false;
      console.error('❌ WebSocket connection failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Disconnecting from WebSocket server');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.cleanupMobileEventListeners();
  }

  /**
   * Check if connected to WebSocket server
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current connection latency
   */
  getLatency(): number {
    return this.currentLatency;
  }

  /**
   * Send mobile-specific event to server
   */
  private sendMobileEvent(event: MobileEvent): void {
    if (this.socket?.connected) {
      this.socket.emit('mobile_event', event);
    }
  }

  /**
   * Setup mobile event listeners for app lifecycle
   */
  private setupMobileEventListeners(): void {
    // App state change listener
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        this.sendMobileEvent({
          eventType: 'app_background',
          timestamp: Date.now()
        });
      } else if (nextAppState === 'active') {
        this.sendMobileEvent({
          eventType: 'app_foreground',
          timestamp: Date.now()
        });
        // Update connection quality when app becomes active
        this.updateConnectionQuality('unknown');
      }
    });
  }

  /**
   * Cleanup mobile event listeners
   */
  private cleanupMobileEventListeners(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketEventListeners(): void {
    if (!this.socket) return;

    // Authentication events
    this.socket.on('authenticated', (success: boolean, error?: string) => {
      if (success) {
        console.log('✅ WebSocket authentication successful');
      } else {
        console.error('❌ WebSocket authentication failed:', error);
      }
    });

    // Mobile optimization settings
    this.socket.on('mobile_optimization', (settings: MobileOptimizationSettings) => {
      console.log('📱 Received mobile optimization settings:', settings);
      this.optimizationSettings = { ...this.optimizationSettings, ...settings };
      
      // Update heartbeat interval
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.startHeartbeat();
      }
    });

    // Heartbeat response
    this.socket.on('pong', (timestamp: number) => {
      this.currentLatency = Date.now() - timestamp;
      console.log(`💓 Heartbeat: ${this.currentLatency}ms`);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
    });

    // Disconnection handling
    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 WebSocket disconnected:', reason);
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 WebSocket reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
    });
  }

  /**
   * Start heartbeat for connection monitoring
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.lastPingTime = Date.now();
        this.socket.emit('ping', this.lastPingTime);
      }
    }, this.optimizationSettings.heartbeatInterval);
  }

  /**
   * Update connection quality based on network type and latency
   */
  private updateConnectionQuality(connectionType: 'wifi' | 'cellular' | 'unknown'): void {
    const quality: ConnectionQuality = {
      latency: this.currentLatency,
      packetLoss: 0, // TODO: Calculate packet loss
      connectionType,
      signalStrength: this.getSignalStrength()
    };

    if (this.socket?.connected) {
      this.socket.emit('connection_quality', quality);
    }
  }

  /**
   * Determine signal strength based on latency
   */
  private getSignalStrength(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.currentLatency < 50) return 'excellent';
    if (this.currentLatency < 100) return 'good';
    if (this.currentLatency < 200) return 'fair';
    return 'poor';
  }

  // Game-specific methods (to be implemented in Phase 2)
  
  /**
   * Join public game (Phase 2)
   */
  joinPublicGame(): void {
    if (this.socket?.connected) {
      this.socket.emit('join_public_game');
    }
  }

  /**
   * Create private room (Phase 2)
   */
  createPrivateRoom(settings: any): void {
    if (this.socket?.connected) {
      this.socket.emit('create_private_room', settings);
    }
  }

  /**
   * Join private room (Phase 2)
   */
  joinPrivateRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_private_room', roomId);
    }
  }
}

// Export singleton instance
export const gameWebSocketService = new GameWebSocketService();
export default gameWebSocketService;
