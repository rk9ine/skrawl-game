import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  ScaledSize,
} from 'react-native';
import { Text } from '../../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useLayoutStore } from '../../store/layoutStore';
import { useAuthStore } from '../../store/authStore';
// Game services removed - will be reimplemented with new backend
import {
  DrawingCanvas,
  DrawingToolbar,
  PlayerList,
  ChatSection,
  MessageInput,
  VirtualKeyboard,
  TopBar,
  SettingsModal,
  ReactionOverlay,
  PrivateModeOverlay,
} from '../../components/drawing-battle';
import WordSelectionModal from '../../components/drawing-battle/WordSelectionModal';

type DrawingBattleScreenRouteProp = RouteProp<MainStackParamList, 'DrawingBattle'>;

const DrawingBattleScreen = () => {
  const { theme, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<DrawingBattleScreenRouteProp>();
  const { chatInputPosition, useSystemKeyboard } = useLayoutStore();
  const { user, profile } = useAuthStore();
  // Game store functionality removed - will be reimplemented with new backend
  const currentGame = null;
  const isConnectedToRealtime = false;
  const currentUserId = user?.id || null;
  const isCurrentUserDrawer = false;

  // Get route parameters
  const { privateMode = false } = route.params || {};

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    statusBarSpacer: {
      height: Platform.OS === 'android' ? 0 : 0, // Adjust if needed for consistency
    },
    content: {
      flex: 1,
      position: 'relative',
      padding: 0, // No padding for edge-to-edge layout
    },
    canvasContainer: {
      flex: 1,
      marginHorizontal: 0,
      marginVertical: 0,
      marginBottom: 0, // No margin between canvas and toolbar
    },
    // Portrait mode layout (optimized for vertical screens)
    portraitLayout: {
      flexDirection: 'row',
      height: Math.min(Dimensions.get('window').height * 0.25, 250), // Reduced from 0.3/300 to give more space to canvas
      maxHeight: 250, // Reduced from 300px
      minHeight: 160, // Reduced from 180px
    },
    // Landscape mode layout (optimized for horizontal screens)
    landscapeLayout: {
      flexDirection: 'row',
      height: Math.min(Dimensions.get('window').height * 0.35, 180), // Reduced from 0.4/200
      maxHeight: 180, // Reduced from 200
      minHeight: 110, // Reduced from 120
    },
    // Legacy layouts (kept for compatibility)
    verticalLayout: {
      flexDirection: 'row',
      height: Math.min(Dimensions.get('window').height * 0.3, 300), // Increased height by 25%
      maxHeight: 300,
      minHeight: 180,
    },
    horizontalLayout: {
      flexDirection: 'column',
      height: Math.min(Dimensions.get('window').height * 0.3, 300),
      maxHeight: 300,
      minHeight: 180,
    },
    mixedLayout: {
      flexDirection: 'column',
      height: Math.min(Dimensions.get('window').height * 0.3, 300),
      maxHeight: 300,
      minHeight: 180,
    },
    playerListContainer: {
      flex: 1, // 50% of available space
      marginRight: 0, // No gap between PlayerList and ChatSection
    },
    chatSectionContainer: {
      flex: 1, // 50% of available space
    },
    sideContainer: {
      flex: 1,
    },
    bottomContainer: {
      height: spacing.xl * 1.875, // Using theme spacing.xl (32) * 1.875 instead of hardcoded 60
    },
  });

  // Fixed player list position (always on the left)
  const playerListPosition = 'left';

  // State
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isPrivateModeOverlayVisible, setIsPrivateModeOverlayVisible] = useState(privateMode);
  const [isWordSelectionVisible, setIsWordSelectionVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(currentGame?.roundDuration || 80);

  // Use real game state instead of mock data
  const currentRound = currentGame?.currentRound || 1;
  const currentWord = currentGame?.currentWord || '';
  const totalRounds = currentGame?.maxRounds || 3;
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  );

  // Drawing state (skribbl.io defaults)
  const [currentTool, setCurrentTool] = useState<'pen' | 'bucket'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000'); // Black - skribbl.io default
  const [currentSize, setCurrentSize] = useState(5); // 5px - skribbl.io default
  const canvasRef = useRef<{ undo: () => void; clear: () => void }>(null);

  // Virtual keyboard state
  const [currentMessage, setCurrentMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Rate limiting state
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(false);

  // Rate limiting constants
  const MESSAGE_RATE_LIMIT = 3; // Max 3 messages
  const RATE_LIMIT_WINDOW = 10000; // Per 10 seconds
  const RATE_LIMIT_COOLDOWN = 5000; // 5 second cooldown when limit hit

  // Reaction state
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  // Generate real player data from game state
  const getCustomPlayerData = useCallback(() => {
    // Return placeholder data for UI testing (real game data will be implemented with new backend)
    const placeholderPlayers = [
      {
        id: 'current-user',
        name: profile?.displayName || 'You',
        score: 150,
        isDrawing: true,
        isReady: true,
        avatarIcon: 'person',
        avatarColor: '#4361EE',
        isCurrentUser: true,
        avatarData: profile?.avatar
      },
      {
        id: 'player-2',
        name: 'ArtMaster',
        score: 120,
        isDrawing: false,
        isReady: true,
        avatarIcon: 'brush',
        avatarColor: '#FF5733',
        isCurrentUser: false
      },
      {
        id: 'player-3',
        name: 'SketchKing',
        score: 95,
        isDrawing: false,
        isReady: true,
        avatarIcon: 'star',
        avatarColor: '#33FF57',
        isCurrentUser: false
      },
      {
        id: 'player-4',
        name: 'DrawingQueen',
        score: 80,
        isDrawing: false,
        isReady: true,
        avatarIcon: 'heart',
        avatarColor: '#FF33E6',
        isCurrentUser: false
      }
    ];

    return placeholderPlayers;
  }, [user, profile]);



  // Handle orientation changes
  const handleDimensionsChange = useCallback(({ window }: { window: ScaledSize }) => {
    setIsLandscape(window.width > window.height);
  }, []);

  // Simple timer effect for demonstration
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
    return () => subscription.remove();
  }, [handleDimensionsChange]);

  // Get layout for player list and chat section - consistent across platforms
  const getPlayerListChatLayout = () => {
    // Get custom player data with current user's profile
    const customPlayerData = getCustomPlayerData();

    // Only render if we have real player data
    if (!customPlayerData || customPlayerData.length === 0) {
      return (
        <View style={styles.landscapeLayout}>
          <View style={styles.playerListContainer}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Loading players...</Text>
            </View>
          </View>
          <View style={styles.chatSectionContainer}>
            <ChatSection
              position={playerListPosition === 'left' ? 'right' : 'left'}
              useRealTimeChat={isConnectedToRealtime}
            />
          </View>
        </View>
      );
    }

    // Use different layouts based on orientation
    if (isLandscape) {
      // In landscape mode, use a vertical layout (side by side)
      return (
        <View style={styles.landscapeLayout}>
          <View style={styles.playerListContainer}>
            <PlayerList
              position={playerListPosition}
              players={customPlayerData}
            />
          </View>
          <View style={styles.chatSectionContainer}>
            <ChatSection
              position={playerListPosition === 'left' ? 'right' : 'left'}
              useRealTimeChat={isConnectedToRealtime}
            />
          </View>
        </View>
      );
    } else {
      // In portrait mode, use a vertical layout with increased height
      return (
        <View style={styles.portraitLayout}>
          <View style={styles.playerListContainer}>
            <PlayerList
              position={playerListPosition}
              players={customPlayerData}
            />
          </View>
          <View style={styles.chatSectionContainer}>
            <ChatSection
              position={playerListPosition === 'left' ? 'right' : 'left'}
              useRealTimeChat={isConnectedToRealtime}
            />
          </View>
        </View>
      );
    }
  };



  // Drawing tool handlers
  const handleToolSelect = (tool: 'pen' | 'bucket') => {
    setCurrentTool(tool);
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };

  const handleSizeSelect = (size: number) => {
    setCurrentSize(size);
  };

  const handleUndo = () => {
    if (canvasRef.current && canvasRef.current.undo) {
      canvasRef.current.undo();
    }
  };

  const handleClear = () => {
    if (canvasRef.current && canvasRef.current.clear) {
      canvasRef.current.clear();
    }
  };

  // Virtual keyboard handlers
  const handleShowKeyboard = () => {
    setIsKeyboardVisible(true);
  };

  const handleHideKeyboard = () => {
    setIsKeyboardVisible(false);
  };

  const handleKeyPress = (key: string) => {
    setCurrentMessage(prev => {
      const newMessage = prev + key;
      // Enforce 50 character limit
      return newMessage.length <= 50 ? newMessage : prev;
    });
  };

  const handleBackspace = () => {
    setCurrentMessage(prev => {
      if (prev.length === 0) return prev;

      // Handle emoji deletion properly by using Array.from to split by Unicode characters
      const chars = Array.from(prev);
      return chars.slice(0, -1).join('');
    });
  };

  const handleSpace = () => {
    setCurrentMessage(prev => {
      const newMessage = prev + ' ';
      // Enforce 50 character limit
      return newMessage.length <= 50 ? newMessage : prev;
    });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || currentMessage;
    if (!messageToSend.trim()) return;

    // Check rate limiting
    const now = Date.now();

    // If in cooldown, prevent sending
    if (rateLimitCooldown) {
      console.log('Rate limited: Please wait before sending another message');
      return;
    }

    // Reset message count if window has passed
    if (now - lastMessageTime > RATE_LIMIT_WINDOW) {
      setMessageCount(1);
      setLastMessageTime(now);
    } else {
      // Check if rate limit exceeded
      if (messageCount >= MESSAGE_RATE_LIMIT) {
        console.log('Rate limit exceeded: Too many messages sent');
        setRateLimitCooldown(true);

        // Remove cooldown after timeout
        setTimeout(() => {
          setRateLimitCooldown(false);
          setMessageCount(0);
        }, RATE_LIMIT_COOLDOWN);

        return;
      }

      setMessageCount(prev => prev + 1);
    }

    // Send the message to real-time service
    console.log('Sending message:', messageToSend);

    // Chat service functionality removed - will be reimplemented with new backend
    console.log('💬 Message would be sent:', messageToSend, '(chat service will be implemented with new backend)');

    setCurrentMessage('');
    setIsKeyboardVisible(false);
  };

  const handleEnterKey = () => {
    handleSendMessage();
  };

  // Handle system keyboard message changes
  const handleMessageChange = (text: string) => {
    // Enforce 50 character limit
    if (text.length <= 50) {
      setCurrentMessage(text);
    }
  };

  // Handle message clear (for real-time mode)
  const handleMessageClear = () => {
    setCurrentMessage('');
    setIsKeyboardVisible(false);
  };

  // Game logic effects
  useEffect(() => {
    // Show word selection modal when user becomes the drawer
    if (isCurrentUserDrawer && currentGame?.status === 'waiting') {
      setIsWordSelectionVisible(true);
    }
  }, [isCurrentUserDrawer, currentGame?.status]);

  // Word selection handler
  const handleWordSelected = async (word: string) => {
    // Game logic service removed - will be reimplemented with new backend
    setIsWordSelectionVisible(false);
    setCurrentWord(word);
    console.log(`Word selected: ${word} - game logic will be implemented with new backend`);
  };

  // Handle round timer
  useEffect(() => {
    if (currentGame?.status !== 'in_progress' || timeRemaining <= 0) return;

    const timer = setTimeout(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Round ended
          handleRoundEnd();
        }
        return newTime;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, currentGame?.status]);

  const handleRoundEnd = async () => {
    // Game logic service removed - will be reimplemented with new backend
    console.log('Round ended - game logic will be implemented with new backend');
  };

  // Handle exit game
  const onExit = () => {
    navigation.goBack();
  };

  // Reaction handlers
  const handleLike = () => {
    setUserReaction('like');
    // TODO: Send reaction to server/other players
    console.log('User liked the drawing');

    // For now, simulate adding a message to chat
    // In real implementation, this would be handled by the server
    // and broadcast to all players
  };

  const handleDislike = () => {
    setUserReaction('dislike');
    // TODO: Send reaction to server/other players
    console.log('User disliked the drawing');

    // For now, simulate adding a message to chat
    // In real implementation, this would be handled by the server
    // and broadcast to all players
  };

  // Private Mode handlers
  const handleDismissPrivateMode = () => {
    setIsPrivateModeOverlayVisible(false);
  };

  const handleStartPrivateGame = (config: any) => {
    console.log('Starting private game with config:', config);
    // TODO: Implement private game logic
    setIsPrivateModeOverlayVisible(false);
    // Here you would typically:
    // 1. Create the private room with the configuration
    // 2. Generate and share the room code
    // 3. Start the game session
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Status Bar Spacer - ensures consistent spacing on both platforms */}
      <View style={styles.statusBarSpacer} />

      {/* Top Bar - with consistent height and padding across platforms */}
      <TopBar
        round={currentRound}
        totalRounds={totalRounds}
        word={currentWord}
        timeRemaining={timeRemaining}
        onOpenSettings={() => setIsSettingsModalVisible(true)}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Drawing Canvas - edge-to-edge */}
        <View style={styles.canvasContainer}>
          <DrawingCanvas
            ref={canvasRef}
            currentTool={currentTool}
            currentColor={currentColor}
            currentSize={currentSize}
            canDraw={isCurrentUserDrawer}
            enableRealTime={isConnectedToRealtime}
            onUndo={handleUndo}
            onClear={handleClear}
            onDrawingStart={() => console.log('Drawing started')}
            onDrawingEnd={() => console.log('Drawing ended')}
          />

          {/* Reaction Overlay - positioned over canvas */}
          <ReactionOverlay
            onLike={handleLike}
            onDislike={handleDislike}
            visible={true}
          />
        </View>

        {/* Drawing Toolbar - fully functional */}
        <DrawingToolbar
          currentTool={currentTool}
          currentColor={currentColor}
          currentSize={currentSize}
          onToolSelect={handleToolSelect}
          onColorSelect={handleColorSelect}
          onSizeSelect={handleSizeSelect}
          onUndo={handleUndo}
          onClear={handleClear}
          onOpenSettings={() => setIsSettingsModalVisible(true)}
        />

        {/* Message Input - conditionally positioned at top */}
        {chatInputPosition === 'top' && (
          <MessageInput
            position="top"
            message={currentMessage}
            isRateLimited={rateLimitCooldown}
            useRealTimeChat={isConnectedToRealtime}
            onSendMessage={handleSendMessage}
            onShowKeyboard={handleShowKeyboard}
            onMessageChange={handleMessageChange}
            onMessageClear={handleMessageClear}
          />
        )}

        {/* Player List and Chat Section */}
        {getPlayerListChatLayout()}

        {/* Message Input - conditionally positioned at bottom */}
        {chatInputPosition === 'bottom' && (
          <MessageInput
            position="bottom"
            message={currentMessage}
            isRateLimited={rateLimitCooldown}
            useRealTimeChat={isConnectedToRealtime}
            onSendMessage={handleSendMessage}
            onShowKeyboard={handleShowKeyboard}
            onMessageChange={handleMessageChange}
            onMessageClear={handleMessageClear}
          />
        )}
      </View>

      {/* Virtual Keyboard - only show when system keyboard is NOT enabled */}
      {!useSystemKeyboard && (
        <VirtualKeyboard
          visible={isKeyboardVisible}
          currentMessage={currentMessage}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
          onEnter={handleEnterKey}
          onHide={handleHideKeyboard}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onExit={onExit}
      />

      {/* Private Mode Overlay */}
      <PrivateModeOverlay
        visible={isPrivateModeOverlayVisible}
        onDismiss={handleDismissPrivateMode}
        onStartGame={handleStartPrivateGame}
      />

      {/* Word Selection Modal */}
      <WordSelectionModal
        visible={isWordSelectionVisible}
        onWordSelected={handleWordSelected}
        onDismiss={() => setIsWordSelectionVisible(false)}
        difficulty="medium"
        timeLimit={15}
      />
    </SafeAreaView>
  );
};

export default DrawingBattleScreen;
