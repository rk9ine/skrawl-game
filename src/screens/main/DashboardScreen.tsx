import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  useWindowDimensions,
  Platform,
  LayoutChangeEvent,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer, CustomIcon, UserAvatar } from '../../components/ui';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList & RootStackParamList
>;

// Define feature card data structure
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  navigateTo: string;
  requiresAuth?: boolean;
}

/**
 * Dashboard Screen with feature cards for navigation options
 */
const DashboardScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, profile, isSkipped } = useAuthStore();
  const { width, height } = useWindowDimensions();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Individual animation values for each card
  const cardAnimations = useRef<{ [key: string]: Animated.Value }>({
    'drawing-battle': new Animated.Value(1),
    'whiteboard': new Animated.Value(1),
  }).current;

  // State for layout
  const [contentHeight, setContentHeight] = useState(0);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Use single column layout for consistency with GameModeSelectionScreen
  const getNumColumns = () => {
    return 1; // Always use single column for better consistency
  };

  // Handle content layout to ensure it fits on screen
  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
    setIsLayoutReady(true);
  }, []);

  // Start entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Define feature cards data
  const featureCards: FeatureCard[] = [
    {
      id: 'drawing-battle',
      title: 'Drawing Battle',
      description: 'Compete with other players in real-time drawing games',
      icon: 'people',
      iconColor: '#FFFFFF',
      iconBgColor: theme.primary,
      navigateTo: 'GameModeSelection',
      requiresAuth: true,
    },
    {
      id: 'whiteboard',
      title: 'Whiteboard',
      description: 'Free drawing canvas for creative expression',
      icon: 'brush',
      iconColor: '#FFFFFF',
      iconBgColor: theme.secondary,
      navigateTo: 'Whiteboard',
    },
  ];

  // Animate card when pressed
  const animateCardPress = (cardId: string, callback: () => void) => {
    const animation = cardAnimations[cardId];
    if (!animation) return callback();

    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  // Handle card navigation
  const handleCardPress = (card: FeatureCard) => {
    animateCardPress(card.id, () => {
      if (card.requiresAuth && isSkipped) {
        navigation.navigate('AuthPrompt', { redirectTo: card.navigateTo });
      } else {
        navigation.navigate(card.navigateTo as any);
      }
    });
  };

  // Handle settings navigation
  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Render feature card item
  const renderFeatureCard = ({ item }: { item: FeatureCard }) => {
    const cardAnimation = cardAnimations[item.id];

    return (
      <Animated.View
        style={{
          transform: [{ scale: cardAnimation }]
        }}
      >
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: item.iconBgColor,
              borderRadius: borderRadius.lg,
              ...applyThemeShadow('md')
            }
          ]}
          onPress={() => handleCardPress(item)}
          activeOpacity={0.7}
        >
          <CustomIcon
            name={item.icon as any}
            size={32}
            color={item.iconColor}
            style={styles.cardIcon}
          />
          <View style={styles.cardContent}>
            <Text
              variant="heading"
              size={typography.fontSizes.lg}
              color={item.iconColor}
              style={styles.cardTitle}
            >
              {item.title}
            </Text>
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={item.iconColor}
              style={styles.cardDescription}
            >
              {item.description}
            </Text>
          </View>
          <CustomIcon name="chevron-forward" size={24} color={item.iconColor} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }]}>
        <View style={styles.headerLeft}>
          <Text
            variant="heading"
            size={typography.fontSizes.xxxl}
            style={{ marginBottom: spacing.xxs }}
          >
            Skrawl
          </Text>
          <Text
            variant="body"
            size={typography.fontSizes.md}
            color={theme.textSecondary}
          >
            Welcome back, {profile?.displayName || 'Player'}!
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.settingsButton,
            {
              backgroundColor: 'transparent',
              borderRadius: borderRadius.round / 2,
            }
          ]}
          onPress={handleNavigateToSettings}
        >
          <UserAvatar
            avatarData={profile?.avatar}
            size={48}
            style={{
              borderRadius: 24,
              ...applyThemeShadow('md')
            }}
          />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            padding: spacing.lg,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        onLayout={handleContentLayout}
      >
        {/* Game Modes Section */}
        <View style={styles.gameModesSection}>
          <Text
            variant="heading"
            size={typography.fontSizes.xl}
            style={{ textAlign: 'center', marginBottom: spacing.xl }}
          >
            Choose Your Adventure
          </Text>
        </View>

        {/* Grid layout for feature cards */}
        <FlatList
          data={featureCards}
          renderItem={renderFeatureCard}
          keyExtractor={(item) => item.id}
          numColumns={getNumColumns()}
          key={`grid-${getNumColumns()}`} // Force re-render when columns change
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={true} // Enable scrolling as fallback for small screens
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={getNumColumns() > 1 ? styles.row : undefined}
        />
      </Animated.View>
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
    alignItems: 'flex-start',
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  gameModesSection: {
    marginBottom: 24,
  },
  gridContainer: {
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingVertical: 4, // Add padding to ensure consistent spacing
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
    marginBottom: 16,
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

export default DashboardScreen;
