import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80%',
    },
    buttonText: {},
  });

  // Simple navigation handlers
  const handleNavigateToWhiteboard = () => {
    navigation.navigate('Whiteboard');
  };

  const handleNavigateToMultiplayerBattle = () => {
    if (isSkipped) {
      navigation.navigate('AuthPrompt', { redirectTo: 'DrawingBattle' });
    } else {
      navigation.navigate('DrawingBattle');
    }
  };

  const handleNavigateToPrivateMatch = () => {
    if (isSkipped) {
      navigation.navigate('AuthPrompt', { redirectTo: 'PrivateMatch' });
    } else {
      navigation.navigate('PrivateMatch', {});
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
            {isSkipped ? 'Welcome, Guest' : `Welcome, ${user?.email?.split('@')[0] || 'Artist'}`}
          </Text>
        </View>

        {/* Simple placeholder navigation buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.primary,
                padding: spacing.md,
                borderRadius: borderRadius.lg,
                marginBottom: spacing.md,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToWhiteboard}
          >
            <Ionicons name="brush" size={24} color="#FFFFFF" />
            <Text
              variant="body"
              size={typography.fontSizes.lg}
              color="#FFFFFF"
              style={{ marginLeft: spacing.sm }}
            >
              Whiteboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.secondary,
                padding: spacing.md,
                borderRadius: borderRadius.lg,
                marginBottom: spacing.md,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToMultiplayerBattle}
          >
            <Ionicons name="people" size={24} color="#FFFFFF" />
            <Text
              variant="body"
              size={typography.fontSizes.lg}
              color="#FFFFFF"
              style={{ marginLeft: spacing.sm }}
            >
              Drawing Battle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.info,
                padding: spacing.md,
                borderRadius: borderRadius.lg,
                marginBottom: spacing.md,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToPrivateMatch}
          >
            <Ionicons name="game-controller" size={24} color="#FFFFFF" />
            <Text
              variant="body"
              size={typography.fontSizes.lg}
              color="#FFFFFF"
              style={{ marginLeft: spacing.sm }}
            >
              Private Match
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.success,
                padding: spacing.md,
                borderRadius: borderRadius.lg,
                marginBottom: spacing.md,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToSkiaCanvasTest}
          >
            <Ionicons name="code-working" size={24} color="#FFFFFF" />
            <Text
              variant="body"
              size={typography.fontSizes.lg}
              color="#FFFFFF"
              style={{ marginLeft: spacing.sm }}
            >
              Skia Canvas Test
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};



export default DashboardScreen;
