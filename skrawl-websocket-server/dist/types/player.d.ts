/**
 * Player types for Skrawl mobile drawing game
 * Optimized for React Native clients
 */
export interface Player {
    id: string;
    socketId: string;
    displayName: string;
    avatar?: PlayerAvatar;
    score: number;
    totalScore: number;
    isReady: boolean;
    isDrawing: boolean;
    hasGuessed: boolean;
    isConnected: boolean;
    joinedAt: Date;
    lastActivity: Date;
    connectionQuality: ConnectionQuality;
}
export interface PlayerAvatar {
    type: 'gif' | 'icon' | 'custom';
    data: string;
    backgroundColor?: string;
}
export interface ConnectionQuality {
    latency: number;
    packetLoss: number;
    connectionType: 'wifi' | 'cellular' | 'unknown';
    signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
}
export interface PlayerStats {
    gamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
    correctGuesses: number;
    wordsDrawn: number;
    successfulDrawings: number;
}
export interface PlayerJoinData {
    id: string;
    displayName: string;
    avatar?: PlayerAvatar;
    connectionInfo: {
        userAgent: string;
        platform: 'ios' | 'android';
        appVersion: string;
        deviceInfo?: string;
    };
}
export interface PlayerLeaveReason {
    type: 'disconnect' | 'kick' | 'leave' | 'timeout';
    reason?: string;
    timestamp: Date;
}
export interface PlayerMobileEvent {
    playerId: string;
    eventType: 'background' | 'foreground' | 'network_change' | 'low_battery';
    timestamp: Date;
    data?: any;
}
export interface PlayerRateLimit {
    chatMessages: number;
    drawingStrokes: number;
    guesses: number;
    lastReset: Date;
}
export interface PlayerSession {
    player: Player;
    rateLimit: PlayerRateLimit;
    mobileEvents: PlayerMobileEvent[];
    reconnectionAttempts: number;
    lastReconnection?: Date;
}
//# sourceMappingURL=player.d.ts.map