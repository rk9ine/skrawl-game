import React from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text, UserAvatar, CustomIcon } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';
import { useAuthStore } from '../../store/authStore';

// Default avatar icons for mock players
const defaultAvatarIcons = [
  { icon: 'brush', color: '#FF5733' },
  { icon: 'happy', color: '#33FF57' },
  { icon: 'rocket', color: '#3357FF' },
  { icon: 'planet', color: '#FF33E6' },
  { icon: 'star', color: '#FFD700' },
  { icon: 'paw', color: '#795548' },
];

// No more mock data - PlayerList will only show real players

interface PlayerItem {
  id: string;
  name: string;
  score: number;
  isDrawing: boolean;
  isReady: boolean;
  avatarIcon?: string; // Ionicons name for the avatar
  avatarColor?: string; // Background color for the avatar
  avatarData?: string; // JSON string containing avatar data
  isCurrentUser?: boolean; // Whether this is the current user
}

interface PlayerListProps {
  /**
   * Position of the player list
   */
  position: PlayerListPosition;

  /**
   * Players to display - REQUIRED, no more mock data fallback
   */
  players: PlayerItem[];
}

/**
 * Component that displays the list of players in the game
 * Styled to match skribbl.io with ranking, name+points, and avatar
 */
const PlayerList: React.FC<PlayerListProps> = ({
  position,
  players,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const { user, profile } = useAuthStore();

  // Only use real player data - no mock data fallback
  const playerData = players;

  // Sort players by score (highest first)
  const sortedPlayers = [...playerData].sort((a, b) => b.score - a.score);

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
    nameWithIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    playerName: {
      flexWrap: 'wrap',
      flex: 1,
    },
    activeDrawerIcon: {
      marginLeft: spacing.xxs,
    },
    playerScore: {
      marginTop: 0, // Removed spacing between name and score
    },
    avatarContainer: {
      width: 28, // Slightly smaller than the previous text avatar
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.xxs, // Reduced spacing
    },
    currentUserText: {
      // Use bold instead of italic for better cross-platform consistency
    }
  });

  const renderPlayerItem = ({ item, index }: { item: typeof rankedPlayers[0], index: number }) => {
    // Alternating background: Player 1 & 3 have background, Player 2 & 4 don't
    const hasBackground = (index + 1) % 2 === 1; // Odd positions (1, 3, 5...) get background

    return (
      <View
        style={[
          styles.playerItem,
          {
            backgroundColor: hasBackground ? theme.backgroundAlt : 'transparent',
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

        {/* Player name and score with active drawer icon */}
        <View style={styles.playerInfoContainer}>
          <View style={styles.nameScoreContainer}>
            <View style={styles.nameWithIconContainer}>
              <Text
                variant="heading"
                size={typography.fontSizes.sm} // Reduced font size
                color={item.isCurrentUser ? theme.primary : theme.text}
                bold={item.isCurrentUser}
                style={styles.playerName}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {/* Active drawer icon */}
              {item.isDrawing && (
                <CustomIcon
                  name="brush"
                  size={16}
                  color={theme.primary}
                  style={styles.activeDrawerIcon}
                />
              )}
            </View>
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

        {/* Player avatar - show for all players */}
        <UserAvatar
          avatarData={item.isCurrentUser ? (profile?.avatar || undefined) : (item.avatarData || undefined)}
          size={28}
          backgroundColor={item.avatarColor || theme.primary}
        />
      </View>
    );
  };

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
        renderItem={({ item, index }) => renderPlayerItem({ item, index })}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxs }}
      />
    </View>
  );
};

export default PlayerList;
