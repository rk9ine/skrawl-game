import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store';
import { Text, SafeAreaContainer, UserAvatar } from '../../components/ui';
import { applyThemeShadow } from '../../utils/styleUtils';

// Placeholder leaderboard data - will be replaced with real leaderboard service
interface LeaderboardPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  gamesPlayed: number;
  winRate: number;
}

// Placeholder data for UI testing (will be replaced with real leaderboard service)
const placeholderLeaderboardData: LeaderboardPlayer[] = [
  { id: '1', name: 'ArtMaster', avatar: 'brush', score: 2450, rank: 1, gamesPlayed: 45, winRate: 78 },
  { id: '2', name: 'SketchKing', avatar: 'trophy', score: 2380, rank: 2, gamesPlayed: 52, winRate: 73 },
  { id: '3', name: 'DrawingQueen', avatar: 'star', score: 2290, rank: 3, gamesPlayed: 38, winRate: 81 },
  { id: '4', name: 'PaintPro', avatar: 'brush', score: 2150, rank: 4, gamesPlayed: 41, winRate: 69 },
  { id: '5', name: 'CanvasHero', avatar: 'flash', score: 2080, rank: 5, gamesPlayed: 33, winRate: 75 },
  { id: '6', name: 'DoodleMaster', avatar: 'brush', score: 1950, rank: 6, gamesPlayed: 29, winRate: 72 },
  { id: '7', name: 'PixelArtist', avatar: 'star', score: 1890, rank: 7, gamesPlayed: 35, winRate: 68 },
  { id: '8', name: 'SketchWiz', avatar: 'rocket', score: 1820, rank: 8, gamesPlayed: 27, winRate: 74 },
  { id: '9', name: 'DrawingNinja', avatar: 'flash', score: 1750, rank: 9, gamesPlayed: 31, winRate: 65 },
  { id: '10', name: 'ArtGenius', avatar: 'heart', score: 1680, rank: 10, gamesPlayed: 24, winRate: 70 },
  { id: 'current-user', name: 'You', avatar: 'happy', score: 1420, rank: 15, gamesPlayed: 18, winRate: 61 },
];

const LeaderboardScreen: React.FC = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user, profile } = useAuthStore();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load leaderboard data
  const loadLeaderboardData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Using placeholder data for UI testing (real leaderboard service will be implemented later)
      setLeaderboardData(placeholderLeaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  // Get rank color based on position
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return theme.textSecondary;
    }
  };

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal';
      default: return 'person';
    }
  };

  // Check if this is the current user
  const isCurrentUser = (playerId: string) => {
    return playerId === 'current-user' || playerId === user?.id;
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardPlayer }) => {
    const isUser = isCurrentUser(item.id);

    return (
      <View
        style={[
          styles.playerItem,
          {
            backgroundColor: isUser ? theme.primary + '15' : theme.surface,
            borderColor: isUser ? theme.primary : theme.border,
            borderWidth: isUser ? 2 : 1,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.xs,
            // Adjust padding to compensate for thicker border
            padding: isUser ? spacing.md - 1 : spacing.md,
            ...applyThemeShadow('md')
          }
        ]}
      >
        {/* Rank */}
        <View style={[styles.rankContainer, { backgroundColor: getRankColor(item.rank) + '20' }]}>
          <Ionicons
            name={getRankIcon(item.rank) as any}
            size={20}
            color={getRankColor(item.rank)}
          />
          <Text
            variant="heading"
            size={typography.fontSizes.sm}
            color={getRankColor(item.rank)}
            style={{ marginTop: spacing.xxs / 2 }}
          >
            #{item.rank}
          </Text>
        </View>

        {/* Player Avatar - only show for current user with custom avatar */}
        {isUser ? (
          <UserAvatar
            avatarData={profile?.avatar || undefined}
            size={40}
            style={{ marginRight: spacing.md }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}
          />
        )}

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <View style={styles.nameContainer}>
            <Text
              variant="heading"
              size={typography.fontSizes.md}
              color={isUser ? theme.primary : theme.text}
              bold={isUser}
            >
              {item.name}
              {isUser && (
                <Text
                  variant="body"
                  size={typography.fontSizes.sm}
                  color={theme.primary}
                  bold={false}
                >
                  {' '}(You)
                </Text>
              )}
            </Text>
            <Text
              variant="body"
              size={typography.fontSizes.xs}
              color={theme.textSecondary}
            >
              {item.gamesPlayed} games • {item.winRate}% win rate
            </Text>
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text
            variant="heading"
            size={typography.fontSizes.lg}
            color={isUser ? theme.primary : theme.text}
          >
            {item.score.toLocaleString()}
          </Text>
          <Text
            variant="body"
            size={typography.fontSizes.xs}
            color={theme.textSecondary}
          >
            points
          </Text>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.round / 2,
      backgroundColor: theme.backgroundAlt,
      justifyContent: 'center',
      alignItems: 'center',
      ...applyThemeShadow('sm'),
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    playerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      // Padding is set dynamically based on border width
    },
    rankContainer: {
      width: 60,
      alignItems: 'center',
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginRight: spacing.md,
    },
    playerInfo: {
      flex: 1,
    },
    nameContainer: {
      flex: 1,
    },
    scoreContainer: {
      alignItems: 'flex-end',
    },
  });

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text
          variant="heading"
          size={typography.fontSizes.xl}
        >
          Leaderboard
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          variant="body"
          color={theme.textSecondary}
          style={{ textAlign: 'center', marginBottom: spacing.lg }}
        >
          Top players ranked by Drawing Battle points
        </Text>

        <FlatList
          data={leaderboardData}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        />
      </View>
    </SafeAreaContainer>
  );
};

export default LeaderboardScreen;
