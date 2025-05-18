import React, { useState, useEffect, useCallback } from 'react';
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
import { useDrawingStore } from '../../store/drawingStore';
import {
  CanvasPlaceholder,
  SkiaCanvas,
  DrawingToolbar,
  PlayerList,
  ChatSection,
  MessageInput,
  TopBar,
  SettingsModal,
} from '../../components/drawing-battle';

const DrawingBattleScreen = () => {
  const { theme, spacing } = useTheme();
  const navigation = useNavigation();
  const { chatInputPosition } = useLayoutStore();

  // Get drawing store functions
  const {
    setColor,
    setStrokeWidth,
    clearCanvas,
    undoLastPath
  } = useDrawingStore();

  // Fixed player list position (always on the left)
  const playerListPosition = 'left';

  // State
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWord, setCurrentWord] = useState('house');
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  );

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
    // Use different layouts based on orientation
    if (isLandscape) {
      // In landscape mode, use a vertical layout (side by side)
      return (
        <View style={styles.landscapeLayout}>
          <View style={styles.playerListContainer}>
            <PlayerList position={playerListPosition} />
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
            <PlayerList position={playerListPosition} />
          </View>
          <View style={styles.chatSectionContainer}>
            <ChatSection position={playerListPosition === 'left' ? 'right' : 'left'} />
          </View>
        </View>
      );
    }
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setIsDrawing(prev => !prev);
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
        isDrawing={isDrawing}
        onToggleDrawing={toggleDrawingMode}
        onUndo={undoLastPath}
        onClear={clearCanvas}
        onOpenSettings={() => setIsSettingsModalVisible(true)}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Skia Canvas */}
        <View style={styles.canvasContainer}>
          {isDrawing ? (
            <SkiaCanvas isDrawing={isDrawing} />
          ) : (
            <CanvasPlaceholder isDrawing={isDrawing} />
          )}
        </View>

        {/* Drawing Toolbar - consistent height and styling */}
        <DrawingToolbar
          isDrawing={isDrawing}
          onSelectColor={setColor}
          onChangeBrushSize={setStrokeWidth}
          onUndo={undoLastPath}
          onClear={clearCanvas}
        />

        {/* Message Input - conditionally positioned at top */}
        {chatInputPosition === 'top' && (
          <MessageInput position="top" />
        )}

        {/* Player List and Chat Section */}
        {getPlayerListChatLayout()}

        {/* Message Input - conditionally positioned at bottom */}
        {chatInputPosition === 'bottom' && (
          <MessageInput position="bottom" />
        )}
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onExit={onExit}
      />
    </SafeAreaView>
  );
};

// Cross-platform consistent styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Will be overridden by theme.background
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? 0 : 0, // Adjust if needed for consistency
  },
  content: {
    flex: 1,
    position: 'relative',
    padding: 8, // Reduced padding to maximize space
    paddingHorizontal: 12, // Consistent horizontal padding with other components
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: 0, // Consistent margins
    marginVertical: 0,
  },
  // Portrait mode layout (optimized for vertical screens)
  portraitLayout: {
    flexDirection: 'row',
    height: Math.min(Dimensions.get('window').height * 0.3, 300), // Increased height by 25%
    maxHeight: 300, // Increased from 250px
    minHeight: 180, // Increased from 150px
  },
  // Landscape mode layout (optimized for horizontal screens)
  landscapeLayout: {
    flexDirection: 'row',
    height: Math.min(Dimensions.get('window').height * 0.4, 200), // 40% of screen height in landscape
    maxHeight: 200,
    minHeight: 120,
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
    width: 125, // Reduced from 165px to 125px
    marginRight: 0, // Removed margin to eliminate gap between PlayerList and ChatSection
  },
  chatSectionContainer: {
    flex: 1, // Takes remaining space
  },
  sideContainer: {
    flex: 1,
  },
  bottomContainer: {
    height: 60, // Reduced from 80px
  },
});

export default DrawingBattleScreen;
