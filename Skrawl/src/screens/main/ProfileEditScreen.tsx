import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { Text, SafeAreaContainer, CustomIcon } from '../../components/ui';
import { ProfileService } from '../../services/profileService';
import { UsernameValidationResult } from '../../types/profile';
import { ProfileValidation } from '../../utils/profileValidation';

type ProfileEditScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'ProfileEdit'>;

const ProfileEditScreen = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<ProfileEditScreenNavigationProp>();
  const { user, profile, updateProfile } = useAuthStore();

  // State
  const [newUsername, setNewUsername] = useState(profile?.displayName || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationResult, setValidationResult] = useState<UsernameValidationResult | null>(null);
  const [showUsernameWarning, setShowUsernameWarning] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Check if user can change username
  const canChangeUsername = profile && profile.usernameChangesRemaining > 0 && !profile.displayNameLocked;

  useEffect(() => {
    // Validate username as user types (with debounce)
    if (!canChangeUsername || !newUsername.trim() || newUsername === profile?.displayName) {
      setValidationResult(null);
      setSuggestions([]);
      setNetworkError(false);
      return;
    }

    // Client-side validation first
    const formatValidation = ProfileValidation.validateUsernameFormat(newUsername);
    if (!formatValidation.isValid) {
      setValidationResult({
        isValid: false,
        error: formatValidation.error
      });
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (user?.id) {
        setIsValidating(true);
        setNetworkError(false);

        try {
          // Check network connectivity
          const hasNetwork = await ProfileValidation.checkNetworkConnectivity();
          if (!hasNetwork) {
            setNetworkError(true);
            setValidationResult({
              isValid: false,
              error: 'No internet connection. Please check your network and try again.'
            });
            setIsValidating(false);
            return;
          }

          const result = await ProfileService.validateUsernameChange(user.id, newUsername);
          setValidationResult(result);

          // Generate suggestions if username is taken
          if (!result.isValid && result.error?.includes('already taken')) {
            const suggestions = ProfileValidation.generateSuggestions(newUsername);
            setSuggestions(suggestions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Validation error:', error);
          setValidationResult({
            isValid: false,
            error: 'Unable to validate username. Please try again.'
          });
          setNetworkError(true);
        } finally {
          setIsValidating(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newUsername, user?.id, canChangeUsername, profile?.displayName]);

  const handleUsernameChange = async () => {
    if (!user?.id || !canChangeUsername) return;

    // Show warning for first-time username change
    if (profile?.usernameChangesRemaining === 1 && !showUsernameWarning) {
      setShowUsernameWarning(true);
      Alert.alert(
        'Username Change Warning',
        `You can only change your username once. After this change, your username will be permanently locked.\n\nCurrent: ${profile.displayName}\nNew: ${newUsername}\n\nAre you sure you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setShowUsernameWarning(false) },
          { 
            text: 'Change Username', 
            style: 'destructive',
            onPress: () => performUsernameChange()
          }
        ]
      );
      return;
    }

    await performUsernameChange();
  };

  const performUsernameChange = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      // Check network connectivity before attempting change
      const hasNetwork = await ProfileValidation.checkNetworkConnectivity();
      if (!hasNetwork) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ProfileService.changeUsername(user.id, { newDisplayName: newUsername });

      if (result.success) {
        Alert.alert(
          'Username Changed Successfully! 🎉',
          `Your username has been changed from "${result.oldName}" to "${result.newName}".${
            result.locked ? '\n\n🔒 Your username is now permanently locked to maintain leaderboard integrity.' : ''
          }`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Failed to change username';
        let errorTitle = 'Username Change Failed';

        if (result.error?.includes('already taken')) {
          errorTitle = 'Username Not Available';
          errorMessage = `"${newUsername}" is already taken. Please try a different username.`;
        } else if (result.error?.includes('locked')) {
          errorTitle = 'Username Locked';
          errorMessage = 'Your username is permanently locked and cannot be changed.';
        } else if (result.error?.includes('no changes remaining')) {
          errorTitle = 'No Changes Remaining';
          errorMessage = 'You have used all your username changes.';
        }

        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error) {
      console.error('Username change error:', error);
      Alert.alert(
        'Unexpected Error',
        'Something went wrong while changing your username. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdating(false);
      setShowUsernameWarning(false);
    }
  };

  const handleAvatarChange = () => {
    // Navigate to avatar selection screen with profile edit flag
    navigation.navigate('AvatarSelection', { fromProfileEdit: true });
  };

  const renderUsernameSection = () => (
    <View style={styles.section}>
      <Text variant="heading" size={typography.fontSizes.lg} style={{ marginBottom: spacing.sm }}>
        Username
      </Text>
      
      {canChangeUsername ? (
        <>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { fontFamily: typography.fontFamily.primary, color: theme.text }]}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              placeholderTextColor={theme.textDisabled}
              maxLength={20}
              autoCapitalize="none"
            />
            {isValidating && (
              <CustomIcon name="refresh" size={20} color={theme.textSecondary} />
            )}
          </View>

          {validationResult && (
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={validationResult.isValid ? theme.success : theme.error}
              style={{ marginTop: spacing.xs }}
            >
              {validationResult.isValid ? '✓ Username available' : validationResult.error}
            </Text>
          )}

          <Text
            variant="body"
            size={typography.fontSizes.sm}
            color={theme.warning}
            style={{ marginTop: spacing.sm }}
          >
            ⚠️ You have {profile?.usernameChangesRemaining} username change remaining. This action cannot be undone.
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: validationResult?.isValid ? theme.primary : theme.backgroundAlt,
                opacity: validationResult?.isValid && !isUpdating ? 1 : 0.5,
              }
            ]}
            onPress={handleUsernameChange}
            disabled={!validationResult?.isValid || isUpdating}
          >
            <Text
              variant="body"
              bold
              color={validationResult?.isValid ? '#FFFFFF' : theme.textDisabled}
            >
              {isUpdating ? 'Changing...' : 'Change Username'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.lockedContainer, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
          <CustomIcon name="lock-closed" size={24} color={theme.textSecondary} />
          <Text variant="body" color={theme.textSecondary} style={{ marginLeft: spacing.sm }}>
            Username is permanently locked: {profile?.displayName}
          </Text>
        </View>
      )}
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.section}>
      <Text variant="heading" size={typography.fontSizes.lg} style={{ marginBottom: spacing.sm }}>
        Avatar
      </Text>
      
      <TouchableOpacity
        style={[styles.avatarButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handleAvatarChange}
      >
        <Text variant="body" size={typography.fontSizes.lg}>
          {profile?.avatar || '🎨'}
        </Text>
        <Text variant="body" color={theme.textSecondary} style={{ marginLeft: spacing.sm }}>
          Tap to change avatar
        </Text>
        <CustomIcon name="chevron-forward" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      <Text
        variant="body"
        size={typography.fontSizes.sm}
        color={theme.textSecondary}
        style={{ marginTop: spacing.xs }}
      >
        You can change your avatar unlimited times
      </Text>
    </View>
  );

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
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
            onPress={() => navigation.goBack()}
          >
            <CustomIcon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text variant="heading" size={typography.fontSizes.xl}>
            Edit Profile
          </Text>

          <View style={{ width: 44 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={{ padding: spacing.lg }}>
          {renderUsernameSection()}
          {renderAvatarSection()}
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
});

export default ProfileEditScreen;
