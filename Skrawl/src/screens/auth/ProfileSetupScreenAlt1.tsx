import React, { useState, useEffect } from 'react';
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
 * Alternative 1: Card-based profile setup screen with side-by-side layout
 * for larger screens and stacked layout for smaller screens
 */
const ProfileSetupScreenAlt1 = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { user, updateUserProfile, signOut } = useAuthStore();
  const { width, height } = useWindowDimensions();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // State for form
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (width < 350) return 3; // Small phones
    if (width < 500) return 4; // Regular phones
    return 5; // Tablets and larger devices
  };

  // Check if we should use horizontal layout (side by side)
  const isHorizontalLayout = width > 600;

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

  // Render avatar item
  const renderAvatarItem = ({ item }: { item: typeof avatarOptions[0] }) => (
    <TouchableOpacity
      style={[
        styles.avatarItem,
        {
          backgroundColor: selectedAvatar.id === item.id ? theme.primary + '30' : theme.backgroundAlt,
          borderRadius: borderRadius.md,
          borderWidth: selectedAvatar.id === item.id ? 2 : 0,
          borderColor: theme.primary,
          ...applyThemeShadow('sm')
        },
      ]}
      onPress={() => setSelectedAvatar(item)}
    >
      <View style={[styles.avatarIconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={32} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

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
                style={{ marginBottom: spacing.sm, textAlign: 'center' }}
              >
                Welcome to Amazonian!
              </Text>

              <Text
                variant="body"
                color={theme.textSecondary}
                style={{ marginBottom: spacing.lg, textAlign: 'center' }}
              >
                Let's personalize your profile with an avatar and username.
              </Text>
            </View>

            <View style={[
              styles.cardsContainer, 
              { flexDirection: isHorizontalLayout ? 'row' : 'column' }
            ]}>
              {/* Avatar Selection Card */}
              <View style={[
                styles.card, 
                {
                  backgroundColor: theme.backgroundAlt,
                  borderRadius: borderRadius.lg,
                  ...applyThemeShadow('md'),
                  flex: isHorizontalLayout ? 1 : undefined,
                  marginRight: isHorizontalLayout ? spacing.md : 0,
                  marginBottom: isHorizontalLayout ? 0 : spacing.xl,
                }
              ]}>
                <Text
                  variant="subtitle"
                  size={typography.fontSizes.lg}
                  style={{ marginBottom: spacing.md, textAlign: 'center' }}
                >
                  Choose your avatar
                </Text>

                <View style={styles.selectedAvatarContainer}>
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
                </View>

                <FlatList
                  data={avatarOptions}
                  renderItem={renderAvatarItem}
                  keyExtractor={(item) => item.id}
                  numColumns={getNumColumns()}
                  scrollEnabled={false}
                  contentContainerStyle={{ alignItems: 'center' }}
                />
              </View>

              {/* Username Input Card */}
              <View style={[
                styles.card, 
                {
                  backgroundColor: theme.backgroundAlt,
                  borderRadius: borderRadius.lg,
                  ...applyThemeShadow('md'),
                  flex: isHorizontalLayout ? 1 : undefined,
                  marginLeft: isHorizontalLayout ? spacing.md : 0,
                }
              ]}>
                <Text
                  variant="subtitle"
                  size={typography.fontSizes.lg}
                  style={{ marginBottom: spacing.md, textAlign: 'center' }}
                >
                  Choose your username
                </Text>

                <View style={styles.usernameInputContainer}>
                  <TextInput
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

                <View style={styles.usernameInfoContainer}>
                  <Ionicons name="information-circle-outline" size={24} color={theme.textSecondary} />
                  <Text
                    variant="caption"
                    color={theme.textSecondary}
                    style={{ marginLeft: spacing.xs, flex: 1 }}
                  >
                    Your username will be visible to other players during games.
                  </Text>
                </View>
              </View>
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
  cardsContainer: {
    width: '100%',
  },
  card: {
    padding: 16,
  },
  selectedAvatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  selectedAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarItem: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  avatarIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameInputContainer: {
    width: '100%',
    marginVertical: 16,
  },
  usernameInput: {
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  usernameInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  continueButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default ProfileSetupScreenAlt1;
