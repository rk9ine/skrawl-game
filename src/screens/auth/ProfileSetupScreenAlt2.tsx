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
 * Alternative 2: Compact profile setup screen with a playful design
 * featuring a split-view layout for avatar and username
 */
const ProfileSetupScreenAlt2 = () => {
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
        onPress={() => setSelectedAvatar(item)}
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
            Create Your Profile
          </Text>

          <View style={{ width: 44 }} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.mainContainer}>
            {/* Left Side - Avatar Selection */}
            <View style={[
              styles.avatarSection, 
              { 
                backgroundColor: theme.primary + '10',
                borderTopLeftRadius: borderRadius.xl,
                borderBottomLeftRadius: borderRadius.xl,
                padding: spacing.lg,
              }
            ]}>
              <Text
                variant="subtitle"
                size={typography.fontSizes.lg}
                style={{ marginBottom: spacing.md, textAlign: 'center' }}
              >
                Choose Avatar
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

              <ScrollView style={styles.avatarGridContainer}>
                <FlatList
                  data={avatarOptions}
                  renderItem={renderAvatarItem}
                  keyExtractor={(item) => item.id}
                  numColumns={getNumColumns()}
                  scrollEnabled={false}
                  contentContainerStyle={{ alignItems: 'center' }}
                />
              </ScrollView>
            </View>

            {/* Right Side - Username Input */}
            <View style={[
              styles.usernameSection, 
              { 
                backgroundColor: theme.backgroundAlt,
                borderTopRightRadius: borderRadius.xl,
                borderBottomRightRadius: borderRadius.xl,
                padding: spacing.lg,
              }
            ]}>
              <Text
                variant="subtitle"
                size={typography.fontSizes.lg}
                style={{ marginBottom: spacing.md, textAlign: 'center' }}
              >
                Choose Username
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

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  {
                    backgroundColor: theme.primary,
                    borderRadius: borderRadius.md,
                    ...applyThemeShadow('md'),
                    marginTop: 'auto'
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
            </View>
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
    padding: 16,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarSection: {
    flex: 1,
    flexDirection: 'column',
  },
  usernameSection: {
    flex: 1,
    flexDirection: 'column',
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
  avatarGridContainer: {
    flex: 1,
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

export default ProfileSetupScreenAlt2;
