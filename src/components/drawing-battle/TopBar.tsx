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
  onOpenSettings,
}) => {
  const { theme: themeContext, typography, spacing, borderRadius } = useTheme();

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: Platform.OS === 'ios' ? spacing.xl + spacing.sm : spacing.xl + spacing.sm, // Increased height to prevent cutoff
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xxs, // Minimal horizontal padding
      paddingVertical: spacing.xxs, // Minimal vertical padding to prevent overflow
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
      paddingHorizontal: spacing.xxs, // Minimal horizontal padding
      paddingVertical: spacing.xxs / 2, // Slightly increased padding
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 54, // Compact width
      height: spacing.md + 2, // Slightly increased height to prevent text cutoff
      marginBottom: 2, // Added margin to prevent cutoff
    },
    settingsButton: {
      width: spacing.md + spacing.xs, // Reduced size
      height: spacing.md + spacing.xs, // Reduced size
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButton: {
      width: 32, // Reduced size
      height: 32, // Reduced size
      justifyContent: 'center',
      alignItems: 'center',
    },
    roundText: {
      marginBottom: 2, // Reduced margin
    },
    timerText: {
      fontWeight: 'bold',
    },
    wordContainer: {
      alignItems: 'center',
    },
    wordLabel: {
      marginBottom: 2, // Reduced margin
    },
    wordPlaceholder: {
      letterSpacing: 2,
    },
  });

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
          // No shadow for skribbl.io-like flat design
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
            variant="heading" // Changed to heading variant to use Patrick Hand font
            size={typography.fontSizes.md} // Increased font size for better readability
            color={
              timeRemaining > 30
                ? themeContext.success
                : timeRemaining > 10
                  ? themeContext.warning
                  : themeContext.error
            }
            style={{ lineHeight: spacing.md }} // Added line height to prevent cutoff
          >
            {formatTimeRemaining()}
          </Text>
        </View>

        {/* Round indicator */}
        <Text
          variant="heading" // Changed to heading variant to use Patrick Hand font
          size={typography.fontSizes.sm} // Increased font size for better readability
          color={themeContext.text}
          style={{ marginTop: 2, textAlign: 'center', marginBottom: 2 }} // Adjusted margins
        >
          Round {round}/{totalRounds}
        </Text>
      </View>

      {/* Middle section - Guess */}
      <View style={styles.middleSection}>
        {/* Guess label */}
        <Text
          variant="heading" // Changed to heading variant to use Patrick Hand font
          size={typography.fontSizes.sm}
          color={themeContext.textSecondary}
          style={{ textAlign: 'center' }}
        >
          GUESS:
        </Text>

        {/* Word placeholder */}
        <Text
          variant="heading" // Changed to heading variant to use Patrick Hand font
          size={typography.fontSizes.md} // Increased font size for better readability
          color={themeContext.primary}
          style={{ marginTop: 1, textAlign: 'center', letterSpacing: 3 }} // Added letter spacing for underscores
        >
          {generateWordPlaceholder()}
        </Text>
      </View>

      {/* Right section - Settings button */}
      <View style={styles.rightSection}>

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

export default TopBar;
