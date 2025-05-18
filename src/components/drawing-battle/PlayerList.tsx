import React from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';

// Mock player data for placeholder with rankings
const mockPlayers = [
  { id: '1', name: 'Player 1', score: 1265, isDrawing: true, isReady: true, avatar: '🎨' },
  { id: '2', name: 'Player 2', score: 1195, isDrawing: false, isReady: true, avatar: '😀' },
  { id: '3', name: 'Player 3', score: 915, isDrawing: false, isReady: true, avatar: '🎮' },
  { id: '4', name: 'Player 4', score: 500, isDrawing: false, isReady: false, avatar: '👤' },
  { id: '5', name: 'Player 5', score: 240, isDrawing: false, isReady: true, avatar: '🐱' },
  { id: '6', name: 'You', score: 0, isDrawing: false, isReady: true, avatar: '👻', isCurrentUser: true },
];

interface PlayerListProps {
  /**
   * Position of the player list
   */
  position: PlayerListPosition;

  /**
   * Players to display
   * If not provided, uses mock data
   */
  players?: Array<{
    id: string;
    name: string;
    score: number;
    isDrawing: boolean;
    isReady: boolean;
    avatar?: string; // Emoji avatar for the player
    isCurrentUser?: boolean; // Whether this is the current user
  }>;
}

/**
 * Component that displays the list of players in the game
 * Styled to match skribbl.io with ranking, name+points, and avatar
 */
const PlayerList: React.FC<PlayerListProps> = ({
  position,
  players = mockPlayers,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();

  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Add ranking to each player
  const rankedPlayers = sortedPlayers.map((player, index) => ({
    ...player,
    rank: index + 1
  }));

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      width: '100%', // Use full width of parent container
      height: '100%', // Use full height of parent container
      borderWidth: 1,
      overflow: 'hidden',
      borderRadius: 0, // No border radius for edge-to-edge design
    },
    leftPosition: {
      marginRight: 0, // No margin to eliminate gap with ChatSection
    },
    rightPosition: {
      marginLeft: 0, // No margin for edge-to-edge design
    },
    header: {
      paddingHorizontal: spacing.xs, // Consistent padding
      paddingVertical: spacing.xxs, // Reduced vertical padding
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      alignItems: 'center',
      height: 28, // Fixed height for consistent header size with ChatSection
    },
    playerItem: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xxs, // Reduced horizontal padding
      paddingVertical: spacing.xxs / 2, // Significantly reduced vertical padding
      borderBottomWidth: 1,
      alignItems: 'center',
      height: 36, // Fixed compact height for each player item
    },
    rankContainer: {
      width: 30, // Slightly reduced width for rank
      alignItems: 'center',
      marginRight: spacing.xxs, // Reduced spacing
    },
    playerInfoContainer: {
      flex: 1,
      paddingHorizontal: spacing.xxs, // Reduced padding
    },
    nameScoreContainer: {
      flexDirection: 'column',
    },
    playerName: {
      flexWrap: 'wrap',
    },
    playerScore: {
      marginTop: 0, // Removed spacing between name and score
    },
    playerAvatar: {
      width: 32, // Reduced width for avatar
      textAlign: 'center',
      marginLeft: spacing.xxs, // Reduced spacing
    },
    currentUserText: {
      fontStyle: 'italic',
    }
  });

  const renderPlayerItem = ({ item }: { item: typeof rankedPlayers[0] }) => (
    <View
      style={[
        styles.playerItem,
        {
          backgroundColor: item.isDrawing ? theme.primary + '20' : 'transparent',
          borderBottomColor: theme.divider,
        }
      ]}
    >
      {/* Player rank */}
      <View style={styles.rankContainer}>
        <Text
          variant="heading"
          size={typography.fontSizes.xs} // Reduced font size
          color={theme.textSecondary}
        >
          #{item.rank}
        </Text>
      </View>

      {/* Player name and score */}
      <View style={styles.playerInfoContainer}>
        <View style={styles.nameScoreContainer}>
          <Text
            variant="heading"
            size={typography.fontSizes.sm} // Reduced font size
            color={item.isDrawing ? theme.primary : theme.text}
            style={[
              styles.playerName,
              item.isCurrentUser && styles.currentUserText
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            variant="body"
            size={typography.fontSizes.xs} // Reduced font size
            color={theme.textSecondary}
            style={styles.playerScore}
          >
            {item.score} points
          </Text>
        </View>
      </View>

      {/* Player avatar */}
      <Text
        style={styles.playerAvatar}
        size={typography.fontSizes.lg} // Reduced font size
      >
        {item.avatar || '👤'}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        position === 'left' ? styles.leftPosition : styles.rightPosition,
        {
          backgroundColor: theme.surface,
          borderRadius: 0, // No border radius for edge-to-edge design
          borderColor: theme.border,
          // No shadow for skribbl.io-like flat design
        }
      ]}
    >
      <View style={styles.header}>
        <Text
          variant="heading" // Uses Patrick Hand font
          size={typography.fontSizes.md} // Consistent font size with ChatSection
          color={theme.textSecondary}
        >
          PLAYERS
        </Text>
      </View>

      <FlatList
        data={rankedPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxs }}
      />
    </View>
  );
};

export default PlayerList;
