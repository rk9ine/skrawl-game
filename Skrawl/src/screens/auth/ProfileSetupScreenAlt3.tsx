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
  useWindowDimensions,
  ScrollView,
  Pressable,
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
 * Alternative 3: Compact, playful profile setup screen with a focus on mobile
 * featuring a single-page layout with dynamic grid sizing
 */
const ProfileSetupScreenAlt3 = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { user, updateUserProfile, signOut } = useAuthStore();
  const { width, height } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const avatarScaleAnim = useState(new Animated.Value(1))[0];

  // State for form
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (width < 350) return 3; // Small phones
    if (width < 500) return 4; // Regular phones
    return 5; // Tablets and larger devices
  };

  // Calculate avatar item size based on screen width
  const getAvatarItemSize = () => {
    const numColumns = getNumColumns();
    const margins = 16; // 8px margin on each side
    const availableWidth = width - (spacing.lg * 2); // Account for container padding
    return Math.min(70, (availableWidth / numColumns) - margins);
  };

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

  // Animate avatar selection
  const animateAvatarSelection = () => {
    Animated.sequence([
      Animated.timing(avatarScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(avatarScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
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
  const handleCompleteSetup = async () => {
    if (validateUsername(username)) {
      // Update user profile with selected username and avatar
      await updateUserProfile({
        displayName: username,
        avatar: selectedAvatar.icon, // Store the icon name
      });

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

  // Handle avatar selection
  const handleAvatarSelect = (avatar: typeof avatarOptions[0]) => {
    setSelectedAvatar(avatar);
    animateAvatarSelection();
  };

  // Render avatar item
  const renderAvatarItem = ({ item }: { item: typeof avatarOptions[0] }) => {
    const itemSize = getAvatarItemSize();
    const iconSize = Math.max(24, Math.min(32, itemSize * 0.6));
    
    return (
      <TouchableOpacity
        style={[
          styles.avatarItem,
          {
            backgroundColor: selectedAvatar.id === item.id ? theme.primary + '30' : 'transparent',
            borderRadius: borderRadius.md,
            borderWidth: selectedAvatar.id === item.id ? 2 : 0,
            borderColor: theme.primary,
            width: itemSize,
            height: itemSize,
          },
        ]}
        onPress={() => handleAvatarSelect(item)}
      >
        <View 
          style={[
            styles.avatarIconContainer, 
            { 
              backgroundColor: item.color,
              width: itemSize * 0.8,
              height: itemSize * 0.8,
              borderRadius: itemSize * 0.4,
            }
          ]}
        >
          <Ionicons name={item.icon as any} size={iconSize} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
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
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text
            variant="heading"
            size={typography.fontSizes.xxl}
            style={{ fontFamily: typography.fontFamily.secondary }}
          >
            Your Profile
          </Text>

          <View style={{ width: 44 }} />
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
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.welcomeSection}>
              <Text
                variant="title"
                size={typography.fontSizes.xl}
                style={{ marginBottom: spacing.sm, textAlign: 'center', fontFamily: typography.fontFamily.secondary }}
              >
                Welcome to Amazonian!
              </Text>

              <Text
                variant="body"
                color={theme.textSecondary}
                style={{ marginBottom: spacing.lg, textAlign: 'center' }}
              >
                Let's set up your profile in one quick step.
              </Text>
            </View>

            {/* Combined Profile Setup UI */}
            <Pressable 
              style={styles.mainContainer}
              onPress={() => {
                if (isKeyboardVisible) {
                  inputRef.current?.blur();
                  setIsKeyboardVisible(false);
                }
              }}
            >
              {/* Avatar Selection */}
              <Animated.View 
                style={[
                  styles.selectedAvatarContainer,
                  { transform: [{ scale: avatarScaleAnim }] }
                ]}
              >
                <View
                  style={[
                    styles.selectedAvatarCircle,
                    {
                      backgroundColor: selectedAvatar.color,
                      ...applyThemeShadow('md')
                    }
                  ]}
                >
                  <Ionicons name={selectedAvatar.icon as any} size={64} color="#FFFFFF" />
                </View>
              </Animated.View>

              {/* Username Input */}
              <View style={[
                styles.usernameContainer,
                {
                  backgroundColor: theme.backgroundAlt,
                  borderRadius: borderRadius.lg,
                  ...applyThemeShadow('sm'),
                  marginTop: spacing.md,
                  marginBottom: spacing.lg,
                }
              ]}>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.usernameInput,
                    {
                      backgroundColor: theme.background,
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
                  onFocus={() => setIsKeyboardVisible(true)}
                  onBlur={() => setIsKeyboardVisible(false)}
                />

                {usernameError && (
                  <Text
                    variant="caption"
                    color={theme.error}
                    style={{ marginTop: spacing.xxs }}
                  >
                    {usernameError}
                  </Text>
                )}
              </View>

              {/* Avatar Grid */}
              <View style={[
                styles.avatarGridContainer,
                {
                  backgroundColor: theme.backgroundAlt,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  ...applyThemeShadow('sm'),
                }
              ]}>
                <Text
                  variant="subtitle"
                  size={typography.fontSizes.lg}
                  style={{ marginBottom: spacing.sm, textAlign: 'center', fontFamily: typography.fontFamily.secondary }}
                >
                  Choose your avatar
                </Text>

                <FlatList
                  data={avatarOptions}
                  renderItem={renderAvatarItem}
                  keyExtractor={(item) => item.id}
                  numColumns={getNumColumns()}
                  scrollEnabled={false}
                  contentContainerStyle={{ alignItems: 'center' }}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  {
                    backgroundColor: theme.primary,
                    borderRadius: borderRadius.md,
                    ...applyThemeShadow('md'),
                    marginTop: spacing.xl
                  }
                ]}
                onPress={handleCompleteSetup}
              >
                <Text
                  variant="body"
                  bold
                  color="#FFFFFF"
                  size={typography.fontSizes.lg}
                >
                  Complete Setup
                </Text>
              </TouchableOpacity>
            </Pressable>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainContainer: {
    width: '100%',
  },
  selectedAvatarContainer: {
    alignItems: 'center',
  },
  selectedAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameContainer: {
    width: '100%',
    padding: 16,
  },
  avatarGridContainer: {
    width: '100%',
  },
  avatarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  avatarIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameInput: {
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  continueButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default ProfileSetupScreenAlt3;
