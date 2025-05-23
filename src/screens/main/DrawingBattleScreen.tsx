import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  ScaledSize,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useLayoutStore } from '../../store/layoutStore';
import { useAuthStore } from '../../store/authStore';
import {
  DrawingCanvas,
  DrawingToolbar,
  PlayerList,
  ChatSection,
  MessageInput,
  VirtualKeyboard,
  TopBar,
  SettingsModal,
} from '../../components/drawing-battle';

const DrawingBattleScreen = () => {
  const { theme, spacing } = useTheme();
  const navigation = useNavigation();
  const { chatInputPosition } = useLayoutStore();
  const { user } = useAuthStore();

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
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWord, setCurrentWord] = useState('house');
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

  // Generate custom player data with current user's profile
  const getCustomPlayerData = useCallback(() => {
    // If user is not logged in or skipped, return undefined to use default mock data
    if (!user) return undefined;

    // Create a custom player list with the current user's profile data
    return [
      {
        id: '1',
        name: 'Player 1',
        score: 1265,
        isDrawing: true,
        isReady: true,
        avatarIcon: 'brush',
        avatarColor: '#FF5733'
      },
      {
        id: '2',
        name: 'Player 2',
        score: 1195,
        isDrawing: false,
        isReady: true,
        avatarIcon: 'happy',
        avatarColor: '#33FF57'
      },
      {
        id: '3',
        name: 'Player 3',
        score: 915,
        isDrawing: false,
        isReady: true,
        avatarIcon: 'rocket',
        avatarColor: '#3357FF'
      },
      {
        id: '4',
        name: 'Player 4',
        score: 500,
        isDrawing: false,
        isReady: false,
        avatarIcon: 'planet',
        avatarColor: '#FF33E6'
      },
      {
        id: '5',
        name: 'Player 5',
        score: 240,
        isDrawing: false,
        isReady: true,
        avatarIcon: 'star',
        avatarColor: '#FFD700'
      },
      {
        id: '6',
        name: user.displayName || 'You',
        score: 0,
        isDrawing: false,
        isReady: true,
        avatarIcon: user.avatar || 'person',
        avatarColor: '#4361EE',
        isCurrentUser: true
      },
    ];
  }, [user]);



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
            <ChatSection position={playerListPosition === 'left' ? 'right' : 'left'} />
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
            <ChatSection position={playerListPosition === 'left' ? 'right' : 'left'} />
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
    setCurrentMessage(prev => prev + key);
  };

  const handleBackspace = () => {
    setCurrentMessage(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setCurrentMessage(prev => prev + ' ');
  };

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || currentMessage;
    if (messageToSend.trim()) {
      // TODO: Send message to chat/game logic
      console.log('Sending message:', messageToSend);
      setCurrentMessage('');
      setIsKeyboardVisible(false);
    }
  };

  const handleEnterKey = () => {
    handleSendMessage();
  };

  // Handle exit game
  const onExit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Status Bar Spacer - ensures consistent spacing on both platforms */}
      <View style={styles.statusBarSpacer} />

      {/* Top Bar - with consistent height and padding across platforms */}
      <TopBar
        round={currentRound}
        totalRounds={5}
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
            onUndo={handleUndo}
            onClear={handleClear}
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
            onSendMessage={handleSendMessage}
            onShowKeyboard={handleShowKeyboard}
          />
        )}

        {/* Player List and Chat Section */}
        {getPlayerListChatLayout()}

        {/* Message Input - conditionally positioned at bottom */}
        {chatInputPosition === 'bottom' && (
          <MessageInput
            position="bottom"
            message={currentMessage}
            onSendMessage={handleSendMessage}
            onShowKeyboard={handleShowKeyboard}
          />
        )}
      </View>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        visible={isKeyboardVisible}
        currentMessage={currentMessage}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onSpace={handleSpace}
        onEnter={handleEnterKey}
        onHide={handleHideKeyboard}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onExit={onExit}
      />
    </SafeAreaView>
  );
};

export default DrawingBattleScreen;
