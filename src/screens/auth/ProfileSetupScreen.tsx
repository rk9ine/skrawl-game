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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer } from '../../components/ui';

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Avatar options using Ionicons
const avatarOptions = [
  { id: '1', icon: 'person', color: '#FF5733' },
  { id: '2', icon: 'happy', color: '#33FF57' },
  { id: '3', icon: 'rocket', color: '#3357FF' },
  { id: '4', icon: 'planet', color: '#FF33E6' },
  { id: '5', icon: 'star', color: '#FFD700' },
  { id: '6', icon: 'heart', color: '#FF4081' },
  { id: '7', icon: 'paw', color: '#795548' },
  { id: '8', icon: 'football', color: '#8D6E63' },
  { id: '9', icon: 'basketball', color: '#FF9800' },
  { id: '10', icon: 'baseball', color: '#FFEB3B' },
  { id: '11', icon: 'tennisball', color: '#CDDC39' },
  { id: '12', icon: 'american-football', color: '#9C27B0' },
  { id: '13', icon: 'musical-notes', color: '#2196F3' },
  { id: '14', icon: 'game-controller', color: '#673AB7' },
  { id: '15', icon: 'brush', color: '#4CAF50' },
  { id: '16', icon: 'camera', color: '#607D8B' },
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
  const previewRowSwipeAnim = useRef(new Animated.Value(0)).current;

  // State for form
  const [username, setUsername] = useState('');
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [visibleAvatars, setVisibleAvatars] = useState<typeof avatarOptions>([]);
  const [isSwipingAvatar, setIsSwipingAvatar] = useState(false);
  const [isSwipingPreviewRow, setIsSwipingPreviewRow] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);

  // Get the currently selected avatar
  const selectedAvatar = avatarOptions[selectedAvatarIndex];

  // Calculate how many avatars to show in the preview row
  const getPreviewCount = () => {
    if (width < 350) return 3; // Small phones
    if (width < 500) return 5; // Regular phones
    return 7; // Tablets and larger devices
  };

  // Update visible avatars when selected avatar changes or preview start index changes
  useEffect(() => {
    updateVisibleAvatars();
  }, [selectedAvatarIndex, previewStartIndex, width]);

  // Update the visible avatars in the preview row
  const updateVisibleAvatars = () => {
    const previewCount = getPreviewCount();

    const newVisibleAvatars = [];
    for (let i = 0; i < previewCount; i++) {
      const index = (previewStartIndex + i) % avatarOptions.length;
      newVisibleAvatars.push(avatarOptions[index]);
    }

    setVisibleAvatars(newVisibleAvatars);
  };

  // Shift the preview row to show the next/previous set of avatars
  const shiftPreviewRow = (direction: number) => {
    // Calculate new start index with wrapping
    const previewCount = getPreviewCount();
    let newStartIndex = (previewStartIndex + direction) % avatarOptions.length;
    if (newStartIndex < 0) newStartIndex += avatarOptions.length;

    // Animate the shift
    const toValue = direction * -100; // Swipe distance

    // First animate the swipe out
    Animated.timing(previewRowSwipeAnim, {
      toValue: toValue,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Update the start index
      setPreviewStartIndex(newStartIndex);

      // Reset the animation value
      previewRowSwipeAnim.setValue(-toValue);

      // Then animate the swipe in
      Animated.spring(previewRowSwipeAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  };

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

  // Configure pan responder for preview row swipe gestures
  const previewRowPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSwipingPreviewRow(true);
        previewRowSwipeAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        previewRowSwipeAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwipingPreviewRow(false);

        // Determine if swipe was significant enough to shift preview row
        if (Math.abs(gestureState.dx) > 50) {
          const direction = gestureState.dx > 0 ? -1 : 1; // Swipe left means next set (right)
          shiftPreviewRow(direction);
        } else {
          // Reset position if swipe wasn't significant
          Animated.spring(previewRowSwipeAnim, {
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

    // Initialize visible avatars
    updateVisibleAvatars();
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

      // Also update the preview row to center on the selected avatar
      const previewCount = getPreviewCount();
      const halfCount = Math.floor(previewCount / 2);
      let newStartIndex = newIndex - halfCount;
      if (newStartIndex < 0) newStartIndex += avatarOptions.length;
      setPreviewStartIndex(newStartIndex);

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

  // Handle avatar selection from preview row
  const handleSelectAvatar = (avatar: typeof avatarOptions[0]) => {
    const index = avatarOptions.findIndex(a => a.id === avatar.id);
    if (index !== -1 && index !== selectedAvatarIndex) {
      // Determine direction for animation
      const direction = index > selectedAvatarIndex ? 1 : -1;

      // Set the new index directly
      setSelectedAvatarIndex(index);

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
    }
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
      // Update user profile with selected username and avatar
      updateUserProfile({
        displayName: username,
        avatar: selectedAvatar.icon, // Store the icon name
        hasCompletedProfileSetup: true,
      });

      // Log to confirm profile setup is complete
      console.log('Profile setup complete:', {
        username,
        avatar: selectedAvatar.icon,
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

  // Render preview avatar item
  const renderPreviewAvatarItem = (item: typeof avatarOptions[0], index: number) => {
    const isSelected = item.id === selectedAvatar.id;
    const previewSize = 42;
    const iconSize = 24;

    if (Platform.OS === 'android') {
      // Android-specific implementation to fix background issues
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.previewAvatarItem,
            {
              width: previewSize,
              height: previewSize,
              margin: spacing.xxs,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }
          ]}
          onPress={() => handleSelectAvatar(item)}
        >
          <View
            style={{
              position: 'absolute',
              width: previewSize,
              height: previewSize,
              borderRadius: borderRadius.md,
              borderWidth: isSelected ? 2 : 0,
              borderColor: theme.primary,
              backgroundColor: isSelected ? theme.primary + '30' : 'transparent',
            }}
          />
          <View
            style={{
              width: previewSize * 0.8,
              height: previewSize * 0.8,
              borderRadius: previewSize * 0.4,
              backgroundColor: item.color,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <Ionicons name={item.icon as any} size={iconSize} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      );
    } else {
      // iOS implementation
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.previewAvatarItem,
            {
              backgroundColor: isSelected ? theme.primary + '30' : 'transparent',
              borderRadius: borderRadius.md,
              borderWidth: isSelected ? 2 : 0,
              borderColor: theme.primary,
              width: previewSize,
              height: previewSize,
              margin: spacing.xxs,
              overflow: 'hidden',
              ...applyThemeShadow('sm')
            },
          ]}
          onPress={() => handleSelectAvatar(item)}
        >
          <View
            style={[
              styles.avatarIconContainer,
              {
                backgroundColor: item.color,
                width: previewSize * 0.8,
                height: previewSize * 0.8,
                borderRadius: previewSize * 0.4,
              }
            ]}
          >
            <Ionicons name={item.icon as any} size={iconSize} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      );
    }
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
            <Ionicons name="arrow-back" size={24} color={theme.text} />
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
                  <Ionicons name="chevron-back" size={22} color={theme.text} />
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
                  {Platform.OS === 'android' ? (
                    // Android-specific implementation
                    <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          backgroundColor: selectedAvatar.color,
                          justifyContent: 'center',
                          alignItems: 'center',
                          elevation: 4,
                        }}
                      >
                        <Ionicons name={selectedAvatar.icon as any} size={50} color="#FFFFFF" />
                      </View>
                    </View>
                  ) : (
                    // iOS implementation
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
                      <Ionicons name={selectedAvatar.icon as any} size={50} color="#FFFFFF" />
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
                  <Ionicons name="chevron-forward" size={22} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Avatar Preview Row - Swipeable */}
              <Animated.View
                style={[
                  styles.previewRowContainer,
                  {
                    transform: [{ translateX: previewRowSwipeAnim }]
                  }
                ]}
                {...previewRowPanResponder.panHandlers}
              >
                {visibleAvatars.map((item, index) => renderPreviewAvatarItem(item, index))}
              </Animated.View>

              <View style={styles.previewRowIndicators}>
                <TouchableOpacity
                  style={styles.previewArrowButton}
                  onPress={() => shiftPreviewRow(-1)}
                >
                  <Ionicons name="chevron-back" size={16} color={theme.textSecondary} />
                </TouchableOpacity>

                <Text
                  variant="caption"
                  color={theme.textSecondary}
                  style={{ textAlign: 'center', fontSize: typography.fontSizes.xs }}
                >
                  Swipe to browse more avatars
                </Text>

                <TouchableOpacity
                  style={styles.previewArrowButton}
                  onPress={() => shiftPreviewRow(1)}
                >
                  <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  previewRowIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  previewArrowButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  previewAvatarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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