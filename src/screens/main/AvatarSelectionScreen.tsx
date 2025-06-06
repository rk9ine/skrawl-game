import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList, RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer, CustomIcon } from '../../components/ui';
import GifAvatar from '../../components/avatar/GifAvatar';
import AndroidGifAvatar from '../../components/avatar/AndroidGifAvatar';

type AvatarSelectionScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList & RootStackParamList
>;

type AvatarSelectionScreenRouteProp = RouteProp<MainStackParamList, 'AvatarSelection'>;

// Avatar options using custom images and fallback icons (only existing files)
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

const AvatarSelectionScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<AvatarSelectionScreenNavigationProp>();
  const route = useRoute<AvatarSelectionScreenRouteProp>();
  const { profile, updateProfile } = useAuthStore();

  // Determine if this is accessed from profile editing (should only show avatar selection)
  const isProfileEdit = route.params?.fromProfileEdit === true;

  // State for carousel-based avatar selection
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [isSwipingAvatar, setIsSwipingAvatar] = useState(false);

  // Animation values for carousel
  const avatarSwipeAnim = useRef(new Animated.Value(0)).current;
  const avatarScaleAnim = useRef(new Animated.Value(1)).current;

  // Get the currently selected avatar
  const selectedAvatar = avatarOptions[selectedAvatarIndex];

  // Configure pan responder for avatar swipe gestures
  const avatarPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSwipingAvatar(true);
        avatarSwipeAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        avatarSwipeAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwipingAvatar(false);

        // Determine if swipe was significant enough to change avatar
        if (Math.abs(gestureState.dx) > 50) {
          const direction = gestureState.dx > 0 ? -1 : 1; // Swipe left means next avatar (right)
          changeAvatar(direction);
        } else {
          // Reset position if swipe wasn't significant
          Animated.spring(avatarSwipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  // Change avatar with animation
  const changeAvatar = (direction: number) => {
    // Calculate new index with wrapping
    const newIndex = (selectedAvatarIndex + direction + avatarOptions.length) % avatarOptions.length;

    // Animate the swipe
    const toValue = direction * -200; // Swipe distance

    // First animate the swipe out
    Animated.timing(avatarSwipeAnim, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Update the selected avatar
      setSelectedAvatarIndex(newIndex);

      // Reset the animation value
      avatarSwipeAnim.setValue(-toValue);

      // Then animate the swipe in
      Animated.spring(avatarSwipeAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    // Animate the scale for a bounce effect
    Animated.sequence([
      Animated.timing(avatarScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle next avatar button press
  const handleNextAvatar = () => {
    changeAvatar(1);
  };

  // Handle previous avatar button press
  const handlePrevAvatar = () => {
    changeAvatar(-1);
  };

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
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.xl,
    },
    content: {
      flex: 1,
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },

    avatarIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Carousel-specific styles
    avatarSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    arrowButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: spacing.md,
    },
    selectedAvatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    selectedAvatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
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

  const handleSaveAvatar = async () => {
    try {
      // Save the selected avatar to the user's profile
      const avatarData = selectedAvatar.icon || selectedAvatar.name;
      await updateProfile({
        displayName: profile?.displayName || '',
        avatar: avatarData,
      });

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  const handleNavigateToDrawingBattle = async () => {
    // Save avatar first, then navigate
    await handleSaveAvatar();
    navigation.navigate('DrawingBattle');
  };

  const handleNavigateToPrivateMatch = async () => {
    // Save avatar first, then navigate
    await handleSaveAvatar();
    navigation.navigate('PrivateMatch', {});
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
          Choose Your Avatar
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleSection}>
          <Text
            variant="subtitle"
            size={typography.fontSizes.lg}
            color={theme.textSecondary}
          >
            Select an avatar to represent you in the game
          </Text>
        </View>

        {/* Carousel Avatar Selection */}
        <View style={styles.avatarSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.arrowButton,
              {
                backgroundColor: theme.backgroundAlt,
                borderRadius: borderRadius.round,
                ...applyThemeShadow('sm')
              }
            ]}
            onPress={handlePrevAvatar}
          >
            <CustomIcon name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.selectedAvatarContainer,
              {
                transform: [
                  { translateX: avatarSwipeAnim },
                  { scale: avatarScaleAnim }
                ]
              }
            ]}
            {...avatarPanResponder.panHandlers}
          >
            {selectedAvatar.image ? (
              // Custom image avatar with platform-specific GIF support
              <View style={[{ backgroundColor: 'transparent', ...applyThemeShadow('md') }]}>
                {Platform.OS === 'android' ? (
                  <AndroidGifAvatar
                    source={selectedAvatar.image}
                    size={100}
                  />
                ) : (
                  <GifAvatar
                    source={selectedAvatar.image}
                    size={100}
                  />
                )}
              </View>
            ) : selectedAvatar.icon ? (
              Platform.OS === 'android' ? (
                // Android-specific implementation for icon fallback
                <View style={{ width: 100, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: selectedAvatar.color,
                      justifyContent: 'center',
                      alignItems: 'center',
                      elevation: 4,
                    }}
                  >
                    <CustomIcon name={selectedAvatar.icon as any} size={60} color="#FFFFFF" />
                  </View>
                </View>
              ) : (
                // iOS implementation for icon fallback
                <View
                  style={[
                    styles.selectedAvatarCircle,
                    {
                      backgroundColor: selectedAvatar.color,
                      overflow: 'hidden',
                      ...applyThemeShadow('md')
                    }
                  ]}
                >
                  <CustomIcon name={selectedAvatar.icon as any} size={60} color="#FFFFFF" />
                </View>
              )
            ) : (
              // Fallback for avatars without image or icon
              <View
                style={[
                  styles.selectedAvatarCircle,
                  {
                    backgroundColor: '#CCCCCC',
                    overflow: 'hidden',
                    ...applyThemeShadow('md')
                  }
                ]}
              >
                <CustomIcon name="people" size={60} color="#FFFFFF" />
              </View>
            )}
          </Animated.View>

          <TouchableOpacity
            style={[
              styles.arrowButton,
              {
                backgroundColor: theme.backgroundAlt,
                borderRadius: borderRadius.round,
                ...applyThemeShadow('sm')
              }
            ]}
            onPress={handleNextAvatar}
          >
            <CustomIcon name="chevron-forward" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Avatar Name Display */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text
            variant="body"
            size={typography.fontSizes.lg}
            color={theme.text}
            style={{ fontWeight: '600' }}
          >
            {selectedAvatar.name}
          </Text>
          <Text
            variant="body"
            size={typography.fontSizes.sm}
            color={theme.textSecondary}
            style={{ marginTop: spacing.xxs }}
          >
            Swipe or use arrows to browse
          </Text>
        </View>

        <View style={styles.gameOptionsContainer}>
          {/* Save Avatar Button */}
          <TouchableOpacity
            style={[
              styles.gameOptionCard,
              {
                backgroundColor: theme.success,
                ...applyThemeShadow('md'),
                marginBottom: isProfileEdit ? 0 : spacing.lg
              }
            ]}
            onPress={handleSaveAvatar}
          >
            <Ionicons
              name="checkmark-circle"
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
                Save Avatar
              </Text>
              <Text
                variant="body"
                size={typography.fontSizes.sm}
                color="#FFFFFF"
                style={styles.gameOptionDescription}
              >
                Update your profile avatar
              </Text>
            </View>
          </TouchableOpacity>

          {/* Only show game mode options when NOT from profile edit */}
          {!isProfileEdit && (
            <>
              <Text
                variant="heading"
                size={typography.fontSizes.xl}
                style={{ marginBottom: spacing.md }}
              >
                Or Choose Game Mode
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default AvatarSelectionScreen;
