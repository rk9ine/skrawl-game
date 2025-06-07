import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList, RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
// Game store removed - will be reimplemented with new backend
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer, CustomIcon } from '../../components/ui';
import GifAvatar from '../../components/avatar/GifAvatar';
import AndroidGifAvatar from '../../components/avatar/AndroidGifAvatar';

type GameModeSelectionScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList & RootStackParamList
>;

// Avatar options for display (same as AvatarSelectionScreen)
const avatarOptions = [
  // Custom GIF avatars (actual files that exist)
  { id: '1', name: 'Pirate', image: require('../../../assets/avatars/avatar_pirate.gif') },
  { id: '2', name: 'Cat', image: require('../../../assets/avatars/avatar_cat.gif') },
  { id: '3', name: 'Dog', image: require('../../../assets/avatars/avatar_dog.gif') },
  { id: '4', name: 'Laugh', image: require('../../../assets/avatars/avatar_laugh.gif') },
  { id: '5', name: 'Ninja', image: require('../../../assets/avatars/avatar_ninja.gif') },
  { id: '6', name: 'Sad', image: require('../../../assets/avatars/avatar_sad.gif') },
  { id: '7', name: 'Shocked', image: require('../../../assets/avatars/avatar_shocked.gif') },
  { id: '8', name: 'Smile', image: require('../../../assets/avatars/avatar_smile.gif') },
  { id: '9', name: 'Upset', image: require('../../../assets/avatars/avatar_upset.gif') },
  { id: '10', name: 'Weird', image: require('../../../assets/avatars/avatar_weird.gif') },
  { id: '11', name: 'Wizard', image: require('../../../assets/avatars/avatar_wizard.gif') },

  // Fallback icon avatars for additional variety
  { id: '12', icon: 'person', color: '#FF5733', name: 'Person' },
  { id: '13', icon: 'happy', color: '#33FF57', name: 'Happy' },
  { id: '14', icon: 'rocket', color: '#3357FF', name: 'Rocket' },
  { id: '15', icon: 'planet', color: '#FF33E6', name: 'Planet' },
  { id: '16', icon: 'star', color: '#FFD700', name: 'Star' },
  { id: '17', icon: 'heart', color: '#FF4081', name: 'Heart' },
  { id: '18', icon: 'paw', color: '#795548', name: 'Paw' },
  { id: '19', icon: 'football', color: '#8D6E63', name: 'Football' },
  { id: '20', icon: 'basketball', color: '#FF9800', name: 'Basketball' },
  { id: '21', icon: 'musical-notes', color: '#2196F3', name: 'Music' },
  { id: '22', icon: 'game-controller', color: '#673AB7', name: 'Gaming' },
  { id: '23', icon: 'brush', color: '#E91E63', name: 'Art' },
  { id: '24', icon: 'camera', color: '#009688', name: 'Photo' },
];

const GameModeSelectionScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<GameModeSelectionScreenNavigationProp>();
  const { profile, user } = useAuthStore();
  // Game functionality removed - will be reimplemented with new backend
  const isLoading = false;

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Find current user's avatar for display
  const getCurrentAvatar = () => {
    if (!profile?.avatar) return avatarOptions[0]; // Default to first avatar
    
    // Try to find by name first (for GIF avatars)
    const foundByName = avatarOptions.find(avatar => avatar.name === profile.avatar);
    if (foundByName) return foundByName;
    
    // Try to find by icon (for icon avatars)
    const foundByIcon = avatarOptions.find(avatar => avatar.icon === profile.avatar);
    if (foundByIcon) return foundByIcon;
    
    // Default fallback
    return avatarOptions[0];
  };

  const currentAvatar = getCurrentAvatar();

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Game loading removed - will be reimplemented with new backend

  // Navigation handlers
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleQuickPlay = async () => {
    // Navigate to Drawing Battle screen for UI testing (backend will be implemented later)
    navigation.navigate('DrawingBattle');
  };

  const handleCustomGame = () => {
    // Navigate to Drawing Battle with Private Mode for UI testing (backend will be implemented later)
    navigation.navigate('DrawingBattle', { privateMode: true });
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2,
              ...applyThemeShadow('sm')
            }
          ]}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text
          variant="heading"
          size={typography.fontSizes.xl}
        >
          Drawing Battle
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
        {/* Current User Info Section */}
        <View style={styles.userInfoSection}>
          <Text
            variant="subtitle"
            size={typography.fontSizes.lg}
            color={theme.textSecondary}
            style={{ textAlign: 'center', marginBottom: spacing.md }}
          >
            Ready to play as:
          </Text>

          {/* User Avatar Display */}
          <View style={styles.avatarContainer}>
            {currentAvatar.image ? (
              // Custom GIF avatar
              <View style={[{ backgroundColor: 'transparent', ...applyThemeShadow('md') }]}>
                {Platform.OS === 'android' ? (
                  <AndroidGifAvatar
                    source={currentAvatar.image}
                    size={100}
                  />
                ) : (
                  <GifAvatar
                    source={currentAvatar.image}
                    size={100}
                  />
                )}
              </View>
            ) : currentAvatar.icon ? (
              // Icon avatar
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: currentAvatar.color,
                    ...applyThemeShadow('md')
                  }
                ]}
              >
                <CustomIcon name={currentAvatar.icon as any} size={60} color="#FFFFFF" />
              </View>
            ) : (
              // Fallback
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: '#CCCCCC',
                    ...applyThemeShadow('md')
                  }
                ]}
              >
                <CustomIcon name="people" size={60} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* User Name */}
          <Text
            variant="heading"
            size={typography.fontSizes.xxl}
            style={{ textAlign: 'center', marginTop: spacing.md }}
          >
            {profile?.displayName || 'Player'}
          </Text>
        </View>

        {/* Game Mode Cards */}
        <View style={styles.gameModeSection}>
          <Text
            variant="heading"
            size={typography.fontSizes.xl}
            style={{ marginBottom: spacing.lg, textAlign: 'center' }}
          >
            Choose Your Game Mode
          </Text>

          {/* Quick Play Card */}
          <TouchableOpacity
            style={[
              styles.gameModeCard,
              {
                backgroundColor: isLoading ? theme.textDisabled : theme.primary,
                borderRadius: borderRadius.lg,
                ...applyThemeShadow('md'),
                marginBottom: spacing.md
              }
            ]}
            onPress={handleQuickPlay}
            disabled={isLoading}
          >
            <Ionicons
              name={isLoading ? "hourglass" : "flash"}
              size={32}
              color="#FFFFFF"
              style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                color="#FFFFFF"
                style={styles.cardTitle}
              >
                {isLoading ? 'Finding Game...' : 'Quick Play'}
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color="#FFFFFF"
                style={styles.cardDescription}
              >
                {isLoading
                  ? 'Looking for available games or creating new one...'
                  : 'Jump straight into a game with your current avatar'
                }
              </Text>
            </View>
            <CustomIcon name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Custom Game Card */}
          <TouchableOpacity
            style={[
              styles.gameModeCard,
              {
                backgroundColor: theme.secondary,
                borderRadius: borderRadius.lg,
                ...applyThemeShadow('md'),
                marginBottom: spacing.md
              }
            ]}
            onPress={handleCustomGame}
          >
            <Ionicons
              name="options"
              size={32}
              color="#FFFFFF"
              style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                color="#FFFFFF"
                style={styles.cardTitle}
              >
                Custom Game
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color="#FFFFFF"
                style={styles.cardDescription}
              >
                Set up a private match with custom settings
              </Text>
            </View>
            <CustomIcon name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Leaderboard Card */}
          <TouchableOpacity
            style={[
              styles.gameModeCard,
              {
                backgroundColor: theme.warning,
                borderRadius: borderRadius.lg,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleLeaderboard}
          >
            <Ionicons
              name="trophy"
              size={32}
              color="#FFFFFF"
              style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                color="#FFFFFF"
                style={styles.cardTitle}
              >
                Leaderboard
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color="#FFFFFF"
                style={styles.cardDescription}
              >
                View top players and your ranking
              </Text>
            </View>
            <CustomIcon name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameModeSection: {
    flex: 1,
  },
  gameModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDescription: {
    opacity: 0.9,
  },
});

export default GameModeSelectionScreen;
