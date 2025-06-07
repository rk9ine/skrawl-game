"use strict";
/**
 * Socket.io event types for Skrawl mobile drawing game
 * Optimized for React Native WebSocket communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
// Error Codes
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AUTHENTICATION_FAILED"] = "AUTH_FAILED";
    ErrorCode["ROOM_NOT_FOUND"] = "ROOM_NOT_FOUND";
    ErrorCode["ROOM_FULL"] = "ROOM_FULL";
    ErrorCode["GAME_IN_PROGRESS"] = "GAME_IN_PROGRESS";
    ErrorCode["NOT_HOST"] = "NOT_HOST";
    ErrorCode["NOT_DRAWER"] = "NOT_DRAWER";
    ErrorCode["INVALID_WORD"] = "INVALID_WORD";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCode["CONNECTION_LOST"] = "CONNECTION_LOST";
    ErrorCode["INVALID_SETTINGS"] = "INVALID_SETTINGS";
    ErrorCode["PLAYER_NOT_FOUND"] = "PLAYER_NOT_FOUND";
    ErrorCode["ALREADY_GUESSED"] = "ALREADY_GUESSED";
    ErrorCode["GAME_NOT_ACTIVE"] = "GAME_NOT_ACTIVE";
    ErrorCode["MOBILE_COMPATIBILITY"] = "MOBILE_COMPATIBILITY";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=events.js.map