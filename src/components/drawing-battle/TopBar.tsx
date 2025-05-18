import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';

interface TopBarProps {
  /**
   * Current round number
   */
  round?: number;

  /**
   * Total number of rounds
   */
  totalRounds?: number;

  /**
   * Current drawing theme/word
   */
  word?: string;

  /**
   * Time remaining in seconds
   */
  timeRemaining?: number;

  /**
   * Whether the user is currently drawing
   */
  isDrawing?: boolean;

  /**
   * Callback to toggle drawing mode
   */
  onToggleDrawing?: () => void;

  /**
   * Callback to undo the last drawing action
   */
  onUndo?: () => void;

  /**
   * Callback to redo the last undone drawing action
   */
  onRedo?: () => void;

  /**
   * Callback to clear the canvas
   */
  onClear?: () => void;

  /**
   * Callback when settings button is pressed
   */
  onOpenSettings?: () => void;
}

/**
 * Top bar component for the Drawing Battle screen
 */
const TopBar: React.FC<TopBarProps> = ({
  round = 1,
  totalRounds = 5,
  word = 'house',
  timeRemaining = 60,
  isDrawing = false,
  onToggleDrawing,
  onUndo,
  onRedo,
  onClear,
  onOpenSettings,
}) => {
  const { theme: themeContext, typography, spacing, borderRadius } = useTheme();

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate word placeholder with underscores
  const generateWordPlaceholder = () => {
    const underscores = Array(word.length).fill('_').join(' ');
    return `${underscores} (${word.length})`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeContext.surface,
          borderBottomColor: themeContext.border,
          ...applyThemeShadow('sm')
        }
      ]}
    >
      {/* Left section - Timer and Round */}
      <View style={styles.leftSection}>
        {/* Timer */}
        <View
          style={[
            styles.timerContainer,
            {
              backgroundColor:
                timeRemaining > 30
                  ? themeContext.success + '20'
                  : timeRemaining > 10
                    ? themeContext.warning + '20'
                    : themeContext.error + '20',
              borderRadius: borderRadius.md,
            }
          ]}
        >
          <Text
            variant="body"
            size={typography.fontSizes.md}
            bold
            color={
              timeRemaining > 30
                ? themeContext.success
                : timeRemaining > 10
                  ? themeContext.warning
                  : themeContext.error
            }
          >
            {formatTimeRemaining()}
          </Text>
        </View>

        {/* Round indicator */}
        <Text
          variant="body"
          size={typography.fontSizes.sm}
          bold
          color={themeContext.text}
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          Round {round}/{totalRounds}
        </Text>
      </View>

      {/* Middle section - Guess */}
      <View style={styles.middleSection}>
        {/* Guess label */}
        <Text
          variant="body"
          size={typography.fontSizes.sm}
          color={themeContext.textSecondary}
          style={{ textAlign: 'center' }}
        >
          GUESS:
        </Text>

        {/* Word placeholder */}
        <Text
          variant="body"
          size={typography.fontSizes.md}
          bold
          color={themeContext.primary}
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          {generateWordPlaceholder()}
        </Text>
      </View>

      {/* Right section - Drawing toggle and Settings buttons */}
      <View style={styles.rightSection}>
        {/* Drawing toggle button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isDrawing ? themeContext.primary : themeContext.backgroundAlt,
              borderRadius: borderRadius.round,
              marginRight: 8,
            }
          ]}
          onPress={onToggleDrawing}
        >
          <Ionicons
            name={isDrawing ? "brush" : "brush-outline"}
            size={20}
            color={isDrawing ? themeContext.buttonTextLight : themeContext.text}
          />
        </TouchableOpacity>

        {/* Settings button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: themeContext.backgroundAlt,
              borderRadius: borderRadius.round,
            }
          ]}
          onPress={onOpenSettings}
        >
          <Ionicons name="settings-outline" size={20} color={themeContext.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Platform.OS === 'ios' ? 60 : 64, // Reduced height by ~15%
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6, // Reduced padding
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  settingsButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopBar;
