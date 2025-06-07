import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text, CustomIcon } from '../ui';
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
      height: Platform.OS === 'ios' ? spacing.xl + spacing.sm : spacing.xl + spacing.sm, // Consistent height across platforms
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
      paddingVertical: Platform.OS === 'ios' ? spacing.xxs : 0, // Extra padding on iOS to prevent overflow
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
      paddingVertical: Platform.OS === 'ios' ? 1 : spacing.xxs / 2, // Reduced padding on iOS
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 54, // Compact width
      height: Platform.OS === 'ios' ? spacing.md : spacing.md + 2, // Reduced height on iOS
      marginBottom: 1, // Reduced margin to prevent overflow
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
            variant="heading" // Using heading variant for Patrick Hand font
            size={Platform.OS === 'ios' ? typography.fontSizes.sm : typography.fontSizes.md} // Smaller size on iOS
            color={
              timeRemaining > 30
                ? themeContext.success
                : timeRemaining > 10
                  ? themeContext.warning
                  : themeContext.error
            }
            style={{
              lineHeight: Platform.OS === 'ios' ? spacing.md - 2 : spacing.md, // Reduced line height on iOS
              fontWeight: '400', // Ensure consistent font weight
            }}
          >
            {formatTimeRemaining()}
          </Text>
        </View>

        {/* Round indicator */}
        <Text
          variant="heading" // Using heading variant for Patrick Hand font
          size={typography.fontSizes.xs} // Reduced font size for better fit
          color={themeContext.text}
          style={{
            marginTop: 1,
            textAlign: 'center',
            marginBottom: 0,
            lineHeight: Platform.OS === 'ios' ? spacing.sm : undefined // Control line height on iOS
          }}
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
          <CustomIcon name="settings" size={20} color={themeContext.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopBar;
