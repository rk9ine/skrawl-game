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
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList, RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer } from '../../components/ui';

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
  const { user, isSkipped } = useAuthStore();
  const { width, height } = useWindowDimensions();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Individual animation values for each card
  const cardAnimations = useRef<{ [key: string]: Animated.Value }>({
    'drawing-battle': new Animated.Value(1),
    'whiteboard': new Animated.Value(1),
    'skia-canvas': new Animated.Value(1),
    'html5-canvas': new Animated.Value(1),
  }).current;

  // State for layout
  const [contentHeight, setContentHeight] = useState(0);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Determine grid layout based on screen width
  const getNumColumns = () => {
    if (width > 900) return 3; // Large tablets/desktop: 3 columns
    if (width > 600) return 2; // Medium tablets: 2 columns
    return 1; // Phones: 1 column
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
      iconColor: theme.primary,
      iconBgColor: theme.primary + '20',
      navigateTo: 'DrawingBattle',
      requiresAuth: true,
    },
    {
      id: 'whiteboard',
      title: 'Whiteboard',
      description: 'Free-form drawing canvas for creative expression',
      icon: 'brush',
      iconColor: theme.secondary,
      iconBgColor: theme.secondary + '20',
      navigateTo: 'Whiteboard',
    },
    {
      id: 'skia-canvas',
      title: 'Skia Canvas Test',
      description: 'Experimental drawing features with Skia',
      icon: 'code-working',
      iconColor: theme.info,
      iconBgColor: theme.info + '20',
      navigateTo: 'SkiaCanvasTest',
    },
    {
      id: 'html5-canvas',
      title: 'HTML5 Canvas Test',
      description: 'High-performance drawing with HTML5 Canvas',
      icon: 'globe-outline',
      iconColor: theme.success,
      iconBgColor: theme.success + '20',
      navigateTo: 'HTML5CanvasTest',
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
          flex: 1,
          margin: spacing.xs,
          transform: [{ scale: cardAnimation }]
        }}
      >
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              borderColor: theme.border,
              borderWidth: 1,
              ...Platform.select({
                ios: applyThemeShadow('md'),
                android: applyThemeShadow('md')
              })
            }
          ]}
          onPress={() => handleCardPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: item.iconBgColor }]}>
            <Ionicons name={item.icon as any} size={32} color={item.iconColor} />
          </View>
          <View style={styles.cardContent}>
            <Text
              variant="heading"
              size={typography.fontSizes.lg}
              style={{ marginBottom: spacing.xxs }}
            >
              {item.title}
            </Text>
            <Text
              variant="body"
              color={theme.textSecondary}
              size={typography.fontSizes.sm}
            >
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text
          variant="heading"
          size={typography.fontSizes.xxxl}
        >
          Amazonian
        </Text>

        <TouchableOpacity
          style={[
            styles.settingsButton,
            {
              backgroundColor: theme.backgroundAlt,
              borderRadius: borderRadius.round / 2,
              ...applyThemeShadow('sm')
            }
          ]}
          onPress={handleNavigateToSettings}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
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
        <View style={styles.welcomeContainer}>
          <Text
            variant="heading"
            size={typography.fontSizes.xl}
            style={{ marginBottom: spacing.xs, textAlign: 'center' }}
          >
            Welcome to Amazonian
          </Text>

          <Text
            variant="body"
            color={theme.textSecondary}
            style={{ textAlign: 'center', marginBottom: spacing.lg }}
          >
            Choose a mode to start drawing
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
          scrollEnabled={false}
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
    alignItems: 'center',
    width: '100%',
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    padding: 16,
    flex: 1,
    alignItems: 'center',
    minHeight: 100,
    overflow: 'hidden', // Ensures content doesn't overflow rounded corners
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default DashboardScreen;
