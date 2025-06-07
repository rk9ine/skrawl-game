/**
 * WebSocket connection test component
 * For testing the connection to the WebSocket server
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../theme/ThemeContext';

interface WebSocketTestProps {
  onClose?: () => void;
}

export const WebSocketTest: React.FC<WebSocketTestProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  
  const {
    connectionStatus,
    connectionError,
    latency,
    isConnected,
    connect,
    disconnect,
    joinPublicGame,
    createPrivateRoom,
    isJoiningGame,
    isCreatingRoom
  } = useGameStore();

  const handleConnect = async () => {
    try {
      const success = await connect();
      if (success) {
        Alert.alert('✅ Success', 'Connected to WebSocket server!');
      } else {
        Alert.alert('❌ Error', connectionError || 'Failed to connect');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Connection failed');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    Alert.alert('🔌 Disconnected', 'Disconnected from WebSocket server');
  };

  const handleJoinPublicGame = () => {
    if (!isConnected) {
      Alert.alert('❌ Error', 'Not connected to server');
      return;
    }
    joinPublicGame();
    Alert.alert('🎮 Public Game', 'Attempting to join public game...\n(Will be implemented in Phase 2)');
  };

  const handleCreatePrivateRoom = () => {
    if (!isConnected) {
      Alert.alert('❌ Error', 'Not connected to server');
      return;
    }
    
    const settings = {
      maxPlayers: 8,
      rounds: 3,
      drawTime: 80,
      language: 'en',
      hints: 2,
      allowMidGameJoin: true
    };
    
    createPrivateRoom(settings);
    Alert.alert('🏠 Private Room', 'Attempting to create private room...\n(Will be implemented in Phase 2)');
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      case 'reconnecting': return '#2196F3';
      default: return theme.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected';
      case 'connecting': return '🔄 Connecting...';
      case 'error': return '❌ Error';
      case 'reconnecting': return '🔄 Reconnecting...';
      default: return '⚪ Disconnected';
    }
  };

  if (!isVisible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1000,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    closeButton: {
      padding: 5,
    },
    closeText: {
      fontSize: 18,
      color: theme.textSecondary,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    statusText: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 10,
    },
    latencyText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    errorText: {
      fontSize: 14,
      color: '#F44336',
      marginTop: 5,
      fontStyle: 'italic',
    },
    buttonContainer: {
      gap: 10,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: theme.textSecondary,
      opacity: 0.5,
    },
    buttonSecondary: {
      backgroundColor: theme.secondary,
    },
    buttonDanger: {
      backgroundColor: '#F44336',
    },
    buttonText: {
      color: theme.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginLeft: 10,
      color: theme.surface,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebSocket Test</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            setIsVisible(false);
            onClose?.();
          }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {isConnected && (
          <Text style={styles.latencyText}>
            {latency > 0 ? `${latency}ms` : 'Measuring...'}
          </Text>
        )}
      </View>

      {connectionError && (
        <Text style={styles.errorText}>{connectionError}</Text>
      )}

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.button, connectionStatus === 'connecting' && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.surface} />
                <Text style={styles.loadingText}>Connecting...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Connect to Server</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleDisconnect}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, isJoiningGame && styles.buttonDisabled]}
              onPress={handleJoinPublicGame}
              disabled={isJoiningGame}
            >
              {isJoiningGame ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.surface} />
                  <Text style={styles.loadingText}>Joining...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Join Public Game</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isCreatingRoom && styles.buttonDisabled]}
              onPress={handleCreatePrivateRoom}
              disabled={isCreatingRoom}
            >
              {isCreatingRoom ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.surface} />
                  <Text style={styles.loadingText}>Creating...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Create Private Room</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
