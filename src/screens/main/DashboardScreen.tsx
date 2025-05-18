import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
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

const DashboardScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, isSkipped } = useAuthStore();

  // Create basic styles without theme values
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {},
    settingsButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
    },
    welcomeSection: {
      alignItems: 'center',
    },
    welcomeText: {},
    sectionTitle: {
      width: '100%',
      marginBottom: 16,
    },
    cardsContainer: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      width: '48%',
      marginBottom: 16,
      overflow: 'hidden',
    },
    cardContent: {
      alignItems: 'center',
      padding: 16,
    },
    cardIcon: {
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      textAlign: 'center',
      marginBottom: 4,
    },
    cardDescription: {
      textAlign: 'center',
    },
  });

  // Navigation handlers
  const handleNavigateToWhiteboard = () => {
    navigation.navigate('Whiteboard');
  };

  const handleNavigateToClassicGame = () => {
    if (isSkipped) {
      navigation.navigate('AuthPrompt', { redirectTo: 'DrawingBattle' });
    } else {
      navigation.navigate('DrawingBattle');
    }
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNavigateToSkiaCanvasTest = () => {
    navigation.navigate('SkiaCanvasTest');
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

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
        <View style={[styles.welcomeSection, { marginBottom: spacing.xl }]}>
          <Text
            variant="subtitle"
            size={typography.fontSizes.xl}
            color={theme.textSecondary}
            style={{ marginBottom: spacing.xxs }}
          >
            {isSkipped ? 'Welcome back, Player! (Not Signed In)' : `Welcome back, ${user?.email?.split('@')[0] || 'Player'}!`}
          </Text>
        </View>

        {/* Play a Game section */}
        <View style={styles.sectionTitle}>
          <Text
            variant="heading"
            size={typography.fontSizes.xl}
          >
            Play a Game
          </Text>
        </View>

        {/* Game mode cards */}
        <View style={styles.cardsContainer}>
          {/* Classic Game Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderRadius: borderRadius.lg,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToClassicGame}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <Text style={{ fontSize: 40 }}>🎨</Text>
              </View>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                style={styles.cardTitle}
              >
                Classic
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color={theme.textSecondary}
                style={styles.cardDescription}
              >
                Take turns drawing a word
              </Text>
            </View>
          </TouchableOpacity>

          {/* Whiteboard Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderRadius: borderRadius.lg,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToWhiteboard}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <Text style={{ fontSize: 40 }}>📝</Text>
              </View>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                style={styles.cardTitle}
              >
                WhiteBoard
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color={theme.textSecondary}
                style={styles.cardDescription}
              >
                Free drawing canvas
              </Text>
            </View>
          </TouchableOpacity>

          {/* Skia Canvas Test Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderRadius: borderRadius.lg,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToSkiaCanvasTest}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <Text style={{ fontSize: 40 }}>🧪</Text>
              </View>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                style={styles.cardTitle}
              >
                Skia Canvas Test
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color={theme.textSecondary}
                style={styles.cardDescription}
              >
                Test new canvas features
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};



export default DashboardScreen;
