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

  // Callbacks for WebSocket events
  public onLobbyMessage: ((message: any) => void) | null = null;
  public onPlayerJoined: ((player: any) => void) | null = null;
  public onPlayerLeft: ((playerId: string) => void) | null = null;
  public onRoomJoined: ((roomData: any) => void) | null = null;

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
        rememberUpgrade: false
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

    // Phase 2: Room Management Events
    this.setupRoomEventListeners();
  }

  /**
   * Set up room management event listeners (Phase 2)
   */
  private setupRoomEventListeners(): void {
    if (!this.socket) return;

    // Room joined successfully - handle initial player list
    this.socket.on('room_joined', (roomData: any) => {
      console.log('🏠 Joined room:', roomData.roomId);
      console.log('👥 Initial players:', roomData.players);

      // Update game store with room data and initial player list
      if (this.onRoomJoined) {
        this.onRoomJoined(roomData);
      }
    });

    // Private room created
    this.socket.on('room_created', (roomData: any) => {
      console.log('🏠 Room created:', roomData.roomId);
      console.log('🔗 Invite link:', roomData.inviteLink);
      // TODO: Update game store with room data
    });

    // Lobby message received
    this.socket.on('lobby_message', (message: any) => {
      console.log('💬 Lobby message:', message);

      // Transform server message to game store format
      const chatMessage = {
        id: message.id, // Include the unique message ID from server
        playerId: message.playerId,
        playerName: message.playerName,
        message: message.message,
        timestamp: message.timestamp,
        type: message.type as 'chat' | 'guess' | 'system',
        isCorrectGuess: false
      };

      // Update game store with new message
      if (this.onLobbyMessage) {
        this.onLobbyMessage(chatMessage);
      }
    });

    // Player joined room (new player joining after initial room join)
    this.socket.on('player_joined', (player: any) => {
      console.log('👤 Player joined:', player.displayName);
      console.log('👤 Player data:', player);

      // Update game store with new player
      if (this.onPlayerJoined) {
        this.onPlayerJoined(player);
      }
    });

    // Player left room
    this.socket.on('player_left', (playerId: string, reason: string) => {
      console.log('👋 Player left:', playerId, 'reason:', reason);

      // Update game store - remove player
      if (this.onPlayerLeft) {
        this.onPlayerLeft(playerId);
      }
    });

    // Player ready status changed
    this.socket.on('player_ready_changed', (playerId: string, ready: boolean) => {
      console.log('✅ Player ready status:', playerId, ready);
      // TODO: Update game store with ready status
    });

    // Room settings updated
    this.socket.on('room_settings_updated', (settings: any) => {
      console.log('⚙️ Room settings updated:', settings);
      // TODO: Update game store with new settings
    });

    // Game starting
    this.socket.on('game_starting', (gameState: any) => {
      console.log('🎮 Game starting:', gameState);
      // TODO: Update game store with starting state
    });

    // Game started
    this.socket.on('game_started', (gameState: any) => {
      console.log('🎮 Game started:', gameState);
      // TODO: Update game store with active game state
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

  // Phase 2: Game Room Methods

  /**
   * Join public game
   */
  joinPublicGame(): void {
    if (this.socket?.connected) {
      console.log('🎮 Requesting to join public game');
      this.socket.emit('join_public_game');
    } else {
      console.error('❌ Cannot join public game - not connected');
    }
  }

  /**
   * Create private room
   */
  createPrivateRoom(settings: any): void {
    if (this.socket?.connected) {
      console.log('🏠 Creating private room with settings:', settings);
      this.socket.emit('create_private_room', settings);
    } else {
      console.error('❌ Cannot create private room - not connected');
    }
  }

  /**
   * Join private room by invite code
   */
  joinPrivateRoom(inviteCode: string): void {
    if (this.socket?.connected) {
      console.log('🏠 Joining private room with invite code:', inviteCode);
      this.socket.emit('join_private_room', inviteCode);
    } else {
      console.error('❌ Cannot join private room - not connected');
    }
  }

  /**
   * Leave current room
   */
  leaveRoom(): void {
    if (this.socket?.connected) {
      console.log('🚪 Leaving current room');
      this.socket.emit('leave_room');
    }
  }

  /**
   * Send lobby chat message
   */
  sendLobbyMessage(message: string): void {
    if (this.socket?.connected) {
      console.log('💬 Sending lobby message:', message);
      this.socket.emit('lobby_chat', message);
    }
  }

  /**
   * Set player ready status
   */
  setPlayerReady(ready: boolean): void {
    if (this.socket?.connected) {
      console.log('✅ Setting ready status:', ready);
      this.socket.emit('player_ready', ready);
    }
  }

  /**
   * Update room settings (host only)
   */
  updateRoomSettings(settings: any): void {
    if (this.socket?.connected) {
      console.log('⚙️ Updating room settings:', settings);
      this.socket.emit('update_room_settings', settings);
    }
  }

  /**
   * Start game (host only)
   */
  startGame(): void {
    if (this.socket?.connected) {
      console.log('🎮 Starting game');
      this.socket.emit('start_game');
    }
  }
}

// Export singleton instance
export const gameWebSocketService = new GameWebSocketService();
export default gameWebSocketService;
