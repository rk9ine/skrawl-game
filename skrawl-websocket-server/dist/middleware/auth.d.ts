/**
 * Authentication middleware for WebSocket connections
 * Validates JWT tokens from React Native clients
 */
import { Socket } from 'socket.io';
import { Player } from '../types/player';
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
export declare const authenticateSocket: (socket: AuthenticatedSocket, next: (err?: Error) => void) => Promise<void>;
/**
 * Create Player object from authenticated socket
 */
export declare function createPlayerFromSocket(socket: AuthenticatedSocket): Player;
/**
 * Middleware to check if socket is authenticated
 */
export declare function requireAuth(socket: AuthenticatedSocket, next: (err?: Error) => void): void;
/**
 * Get user ID from authenticated socket
 */
export declare function getUserId(socket: AuthenticatedSocket): string;
/**
 * Check if socket belongs to specific user
 */
export declare function isUser(socket: AuthenticatedSocket, userId: string): boolean;
export type { AuthenticatedSocket };
//# sourceMappingURL=auth.d.ts.map