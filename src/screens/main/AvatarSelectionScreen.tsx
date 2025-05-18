import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList, RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer } from '../../components/ui';

type AvatarSelectionScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList & RootStackParamList
>;

type AvatarSelectionScreenRouteProp = RouteProp<MainStackParamList, 'AvatarSelection'>;

// Common emoji categories for avatars
const emojiAvatars = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
  '😋', '😎', '😍', '🥰', '😘', '🤔', '🤨', '😐', '😑', '😶',
  '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱',
  '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕',
  '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢',
  '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵',
  '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺', '🤠', '🤡', '🤥',
  '🤫', '🤭', '🧐', '🤓', '😈', '👻', '👽', '🤖', '💩', '😺',
  '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐶', '🐱',
  '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
];

const AvatarSelectionScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<AvatarSelectionScreenNavigationProp>();
  const route = useRoute<AvatarSelectionScreenRouteProp>();
  const { user, isSkipped } = useAuthStore();

  const [selectedAvatar, setSelectedAvatar] = useState<string>('😀');

  // Create styles
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
    content: {
      flex: 1,
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    avatarGridContainer: {
      marginBottom: spacing.xl,
      width: '100%',
    },
    avatarGrid: {
      flex: 1,
    },
    avatarItem: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      margin: spacing.xs,
    },
    avatarText: {
      fontSize: 32,
    },
    selectedAvatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    selectedAvatar: {
      fontSize: 64,
      marginBottom: spacing.md,
    },
    gameOptionsContainer: {
      width: '100%',
      paddingHorizontal: spacing.lg,
    },
    gameOptionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    gameOptionIcon: {
      marginRight: spacing.md,
    },
    gameOptionContent: {
      flex: 1,
    },
    gameOptionTitle: {
      marginBottom: spacing.xxs,
    },
    gameOptionDescription: {},
  });

  // Navigation handlers
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigateToDrawingBattle = () => {
    if (isSkipped) {
      navigation.navigate('AuthPrompt', { redirectTo: 'DrawingBattle' });
    } else {
      // In a real app, you would save the selected avatar to a store or pass it to the game screen
      navigation.navigate('DrawingBattle');
    }
  };

  const handleNavigateToPrivateMatch = () => {
    if (isSkipped) {
      navigation.navigate('AuthPrompt', { redirectTo: 'PrivateMatch' });
    } else {
      // In a real app, you would save the selected avatar to a store or pass it to the game screen
      navigation.navigate('PrivateMatch', {});
    }
  };

  const renderAvatarItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.avatarItem,
        {
          backgroundColor: selectedAvatar === item ? theme.primary + '30' : 'transparent',
          borderRadius: borderRadius.md,
          borderWidth: selectedAvatar === item ? 2 : 0,
          borderColor: theme.primary,
        },
      ]}
      onPress={() => setSelectedAvatar(item)}
    >
      <Text style={styles.avatarText}>{item}</Text>
    </TouchableOpacity>
  );

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
          Choose Your Avatar
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.content, { padding: spacing.lg }]}>
        <View style={styles.titleSection}>
          <Text
            variant="subtitle"
            size={typography.fontSizes.lg}
            color={theme.textSecondary}
          >
            Select an emoji to represent you in the game
          </Text>
        </View>

        <View style={styles.selectedAvatarContainer}>
          <Text style={styles.selectedAvatar}>{selectedAvatar}</Text>
          <Text
            variant="body"
            size={typography.fontSizes.md}
            color={theme.textSecondary}
          >
            Your selected avatar
          </Text>
        </View>

        {/* Avatar grid section - limited height with scrolling */}
        <View style={[styles.avatarGridContainer, { height: 220 }]}>
          <FlatList
            data={emojiAvatars}
            renderItem={renderAvatarItem}
            keyExtractor={(item) => item}
            numColumns={5}
            style={styles.avatarGrid}
            contentContainerStyle={{ alignItems: 'center' }}
          />
        </View>

        <View style={styles.gameOptionsContainer}>
          <Text
            variant="heading"
            size={typography.fontSizes.xl}
            style={{ marginBottom: spacing.md }}
          >
            Game Mode
          </Text>

          <TouchableOpacity
            style={[
              styles.gameOptionCard,
              {
                backgroundColor: theme.primary,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToDrawingBattle}
          >
            <Ionicons
              name="people"
              size={32}
              color="#FFFFFF"
              style={styles.gameOptionIcon}
            />
            <View style={styles.gameOptionContent}>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                color="#FFFFFF"
                style={styles.gameOptionTitle}
              >
                Drawing Battle
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color="#FFFFFF"
                style={styles.gameOptionDescription}
              >
                Compete with other players in real-time
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gameOptionCard,
              {
                backgroundColor: theme.secondary,
                ...applyThemeShadow('md')
              }
            ]}
            onPress={handleNavigateToPrivateMatch}
          >
            <Ionicons
              name="game-controller"
              size={32}
              color="#FFFFFF"
              style={styles.gameOptionIcon}
            />
            <View style={styles.gameOptionContent}>
              <Text
                variant="heading"
                size={typography.fontSizes.lg}
                color="#FFFFFF"
                style={styles.gameOptionTitle}
              >
                Private Match
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color="#FFFFFF"
                style={styles.gameOptionDescription}
              >
                Play with friends in a private game
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default AvatarSelectionScreen;
