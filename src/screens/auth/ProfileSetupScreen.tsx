import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  useWindowDimensions,
  ScrollView,
  PanResponder,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer, CustomIcon } from '../../components/ui';
import GifAvatar from '../../components/avatar/GifAvatar';
import AndroidGifAvatar from '../../components/avatar/AndroidGifAvatar';

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Avatar options using custom images and fallback icons
const avatarOptions = [
  // Custom GIF avatars (your actual files)
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
  { id: '23', icon: 'brush', color: '#4CAF50', name: 'Artist' },
  { id: '24', icon: 'flash', color: '#FFC107', name: 'Lightning' },
];

/**
 * A fun, engaging profile setup screen with combined avatar and username selection
 * featuring a compact design with swipeable avatar selection
 */
const ProfileSetupScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { user, updateUserProfile, signOut } = useAuthStore();
  const { width, height } = useWindowDimensions();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const avatarSwipeAnim = useRef(new Animated.Value(0)).current;
  const avatarScaleAnim = useRef(new Animated.Value(1)).current;

  // State for form
  const [username, setUsername] = useState('');
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSwipingAvatar, setIsSwipingAvatar] = useState(false);

  // Get the currently selected avatar
  const selectedAvatar = avatarOptions[selectedAvatarIndex];



  // Configure pan responder for main avatar swipe gestures
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



  // Pre-fill username if user has an email
  useEffect(() => {
    if (user?.email) {
      // Extract username from email (part before @)
      const emailUsername = user.email.split('@')[0];
      setUsername(emailUsername);
    }

    // Start entrance animation
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
  }, [user, fadeAnim, slideAnim]);

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



  // Validate username
  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError('Username cannot be empty');
      return false;
    }

    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }

    if (value.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }

    // Check for valid characters (letters, numbers, underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    setUsernameError(null);
    return true;
  };

  // Handle complete profile setup
  const handleCompleteSetup = () => {
    if (validateUsername(username)) {
      // Create comprehensive avatar data
      const avatarData = {
        type: selectedAvatar.image ? 'custom' : 'icon',
        value: selectedAvatar.icon || selectedAvatar.name,
        color: selectedAvatar.color,
        ...(selectedAvatar.image && { imagePath: selectedAvatar.name })
      };

      // Update user profile with selected username and avatar
      updateUserProfile({
        displayName: username,
        avatar: selectedAvatar.icon || selectedAvatar.name, // Keep simple for backward compatibility
        avatarData: JSON.stringify(avatarData), // Store detailed avatar info
        hasCompletedProfileSetup: true,
      });

      // Log to confirm profile setup is complete
      console.log('Profile setup complete:', {
        username,
        avatar: selectedAvatar.icon || selectedAvatar.name,
        avatarData,
        hasCompletedProfileSetup: true
      });
    }
  };

  // Handle back button press (sign out)
  const handleBack = () => {
    // Show sign out confirmation
    handleSignOut();
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => {
            signOut();
          }
        },
      ]
    );
  };



  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
            onPress={handleBack}
          >
            <CustomIcon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text
            variant="heading"
            size={typography.fontSizes.xxl}
          >
            Profile Setup
          </Text>

          <View style={{ width: 44 }} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              padding: spacing.md,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Compact Profile Setup UI */}
          <View style={styles.compactContainer}>
            <View style={styles.welcomeSection}>
              <Text
                variant="title"
                size={typography.fontSizes.lg}
                style={{ marginBottom: spacing.xxs, textAlign: 'center' }}
              >
                Welcome to Amazonian!
              </Text>

              <Text
                variant="body"
                color={theme.textSecondary}
                style={{ marginBottom: spacing.xs, textAlign: 'center' }}
              >
                Let's personalize your profile with an avatar and username.
              </Text>
            </View>

            {/* Avatar Selection Section */}
            <View style={styles.avatarSelectionSection}>
              <Text
                variant="subtitle"
                size={typography.fontSizes.md}
                style={{ marginBottom: spacing.xxs, textAlign: 'center' }}
              >
                Choose your avatar
              </Text>

              {/* Swipeable Avatar Selection */}
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
                      <CustomIcon name="person" size={60} color="#FFFFFF" />
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


            </View>

            {/* Username Input Section */}
            <View style={[styles.usernameSection, { marginTop: spacing.sm }]}>
              <Text
                variant="subtitle"
                size={typography.fontSizes.md}
                style={{ marginBottom: spacing.xxs }}
              >
                Choose your username
              </Text>

              <TextInput
                style={[
                  styles.usernameInput,
                  {
                    backgroundColor: theme.backgroundAlt,
                    borderColor: usernameError ? theme.error : theme.border,
                    borderRadius: borderRadius.md,
                    color: theme.text,
                    fontFamily: typography.fontFamily.primary,
                  }
                ]}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  validateUsername(text);
                }}
                placeholder="Enter a username"
                placeholderTextColor={theme.textDisabled}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {usernameError && (
                <Text
                  variant="caption"
                  color={theme.error}
                  style={{ marginTop: spacing.xxs, fontSize: typography.fontSizes.xs }}
                >
                  {usernameError}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: theme.primary,
                  borderRadius: borderRadius.md,
                  ...applyThemeShadow('md'),
                  marginTop: spacing.md
                }
              ]}
              onPress={handleCompleteSetup}
            >
              <Text
                variant="body"
                bold
                color="#FFFFFF"
                size={typography.fontSizes.md}
              >
                Complete Setup
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  compactContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarSelectionSection: {
    width: '100%',
    alignItems: 'center',
  },
  avatarSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  arrowButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectedAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  usernameSection: {
    width: '100%',
  },
  usernameInput: {
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  continueButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default ProfileSetupScreen;