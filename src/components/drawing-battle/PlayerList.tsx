import React from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';

// Mock player data for placeholder
const mockPlayers = [
  { id: '1', name: 'Player 1', score: 120, isDrawing: true, isReady: true, avatar: '🎨' },
  { id: '2', name: 'Player 2', score: 85, isDrawing: false, isReady: true, avatar: '😀' },
  { id: '3', name: 'Player 3', score: 65, isDrawing: false, isReady: true, avatar: '🎮' },
  { id: '4', name: 'Player 4', score: 40, isDrawing: false, isReady: false, avatar: '👤' },
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
  }>;
}

/**
 * Component that displays the list of players in the game
 */
const PlayerList: React.FC<PlayerListProps> = ({
  position,
  players = mockPlayers,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();

  const renderPlayerItem = ({ item }: { item: typeof players[0] }) => (
    <View
      style={[
        styles.playerItem,
        {
          backgroundColor: item.isDrawing ? theme.primary + '20' : 'transparent',
          borderBottomColor: theme.divider,
        }
      ]}
    >
      <View style={styles.playerItemTopRow}>
        {/* Player avatar */}
        <Text
          style={styles.playerAvatar}
          size={typography.fontSizes.lg}
        >
          {item.avatar || '👤'}
        </Text>

        {/* Player name */}
        <Text
          variant="body"
          size={typography.fontSizes.sm}
          color={item.isDrawing ? theme.primary : theme.text}
          bold={item.isDrawing}
          style={styles.playerName}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Player status icon */}
        <View
          style={[
            styles.statusIcon,
            {
              backgroundColor: item.isReady
                ? theme.success + '20'
                : theme.warning + '20'
            }
          ]}
        >
          <Ionicons
            name={item.isDrawing ? "brush" : (item.isReady ? "checkmark" : "time")}
            size={14}
            color={item.isDrawing ? theme.primary : (item.isReady ? theme.success : theme.warning)}
          />
        </View>
      </View>

      {/* Player score row */}
      <View style={styles.playerItemBottomRow}>
        <Text
          variant="body"
          size={typography.fontSizes.xs}
          color={theme.textSecondary}
          style={styles.playerScore}
        >
          Score: {item.score}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        position === 'left' ? styles.leftPosition : styles.rightPosition,
        {
          backgroundColor: theme.surface,
          borderRadius: borderRadius.md,
          borderColor: theme.border,
          ...applyThemeShadow('sm')
        }
      ]}
    >
      <View style={styles.header}>
        <Text
          variant="subtitle"
          size={typography.fontSizes.sm}
          color={theme.textSecondary}
        >
          PLAYERS
        </Text>
      </View>

      <FlatList
        data={players}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xs }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Use full width of parent container
    height: '100%', // Use full height of parent container
    borderWidth: 1,
    overflow: 'hidden',
  },
  leftPosition: {
    marginRight: 0, // Removed margin to eliminate gap with ChatSection
  },
  rightPosition: {
    marginLeft: 8,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  playerItem: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  playerItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  playerItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 28, // Align with the text after avatar
  },
  playerAvatar: {
    marginRight: 4,
    width: 24,
    textAlign: 'center',
  },
  statusIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  playerName: {
    flex: 1,
    flexWrap: 'wrap',
  },
  playerScore: {
    marginLeft: 0,
  },
});

export default PlayerList;
