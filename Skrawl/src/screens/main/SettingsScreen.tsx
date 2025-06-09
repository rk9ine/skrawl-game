import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer, CustomIcon, DeleteAccountModal } from '../../components/ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { MainStackParamList } from '../../types/navigation';


type SettingsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const SettingsScreen = () => {
  const { theme, typography, spacing, borderRadius, shadows, isDark, setThemeType, themeType } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, profile, signOut, deleteAccount, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

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
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {},
    content: {},
    section: {},
    sectionTitle: {},
    card: {
      overflow: 'hidden',
    },
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileAvatar: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInitial: {},
    profileDetails: {
      flex: 1,
    },
    profileName: {},
    profileEmail: {},
    signInButton: {
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    signInButtonText: {},
    signOutButton: {
      height: 48,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    signOutButtonText: {},
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {},
    divider: {
      height: 1,
    },
    versionText: {},
  });

  const handleToggleDarkMode = () => {
    setThemeType(isDark ? 'light' : 'dark');
  };

  const handleSystemTheme = () => {
    setThemeType('system');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => signOut() },
      ]
    );
  };



  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      const { error } = await deleteAccount();

      if (error) {
        Alert.alert(
          'Deletion Failed',
          error.message || 'Failed to delete account. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Success - user will be automatically redirected to auth screen
      // due to auth state change
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Deletion Failed',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <View style={[
        styles.header,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm
        }
      ]}>
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

        <Text
          variant="heading"
          size={typography.fontSizes.xl}
        >
          Settings
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Account Section */}
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          <Text
            variant="title"
            bold
            size={typography.fontSizes.lg}
            style={{ marginBottom: spacing.sm }}
          >
            Account
          </Text>

          <View style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.border,
              ...applyThemeShadow('md')
            }
          ]}>
            <View style={[
              styles.profileInfo,
              {
                padding: spacing.md
              }
            ]}>
              <View style={[
                styles.profileAvatar,
                {
                  backgroundColor: theme.primary,
                  borderRadius: borderRadius.round / 2,
                  marginRight: spacing.md
                }
              ]}>
                <Text style={[
                  styles.profileInitial,
                  {
                    fontFamily: typography.fontFamily.primaryBold,
                    color: '#FFFFFF',
                    fontSize: typography.fontSizes.xxl
                  }
                ]}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>

              <View style={styles.profileDetails}>
                <Text style={[
                  styles.profileName,
                  {
                    fontFamily: typography.fontFamily.primaryBold,
                    color: theme.text,
                    fontSize: typography.fontSizes.lg,
                    marginBottom: spacing.xxs
                  }
                ]}>
                  {profile?.displayName || user?.email?.split('@')[0] || 'User'}
                </Text>

                <Text style={[
                  styles.profileEmail,
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.textSecondary,
                    fontSize: typography.fontSizes.sm
                  }
                ]}>
                  {user?.email || 'No email'}
                </Text>
              </View>

              {/* Edit Profile Button */}
              <TouchableOpacity
                style={{
                  padding: spacing.xs,
                  borderRadius: borderRadius.md,
                  backgroundColor: theme.backgroundAlt,
                }}
                onPress={handleEditProfile}
              >
                <CustomIcon name="create-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Edit Profile Row */}
            <View style={[
              styles.divider,
              {
                backgroundColor: theme.divider,
                marginHorizontal: spacing.md
              }
            ]} />

            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  padding: spacing.md
                }
              ]}
              onPress={handleEditProfile}
            >
              <View style={styles.settingInfo}>
                <Text style={[
                  styles.settingTitle,
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.text,
                    fontSize: typography.fontSizes.md
                  }
                ]}>
                  Edit Profile
                </Text>
                <Text style={[
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.textSecondary,
                    fontSize: typography.fontSizes.sm,
                    marginTop: spacing.xxs
                  }
                ]}>
                  {profile?.usernameChangesRemaining && profile.usernameChangesRemaining > 0 && !profile?.displayNameLocked
                    ? `${profile.usernameChangesRemaining} username change remaining`
                    : profile?.displayNameLocked
                      ? 'Username permanently locked'
                      : 'Change avatar anytime'
                  }
                </Text>
              </View>

              <CustomIcon name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>



            {/* Sign Out Button */}
            <TouchableOpacity
              style={[
                styles.signOutButton,
                {
                  borderColor: theme.border,
                  margin: spacing.md,
                  borderRadius: borderRadius.lg
                }
              ]}
              onPress={handleSignOut}
            >
              <Text style={[
                styles.signOutButtonText,
                {
                  fontFamily: typography.fontFamily.primary,
                  color: theme.error,
                  fontSize: typography.fontSizes.md
                }
              ]}>
                Sign Out
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              style={[
                styles.signOutButton,
                {
                  borderColor: '#FF4444',
                  backgroundColor: '#FF4444' + '10',
                  marginHorizontal: spacing.md,
                  marginBottom: spacing.md,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                }
              ]}
              onPress={handleDeleteAccount}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CustomIcon name="trash" size={20} color="#FF4444" style={{ marginRight: spacing.xs }} />
                <Text style={[
                  styles.signOutButtonText,
                  {
                    fontFamily: typography.fontFamily.primaryBold,
                    color: '#FF4444',
                    fontSize: typography.fontSizes.md
                  }
                ]}>
                  Delete Account
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          <Text
            variant="title"
            bold
            size={typography.fontSizes.lg}
            style={{ marginBottom: spacing.sm }}
          >
            Appearance
          </Text>

          <View style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.border,
              ...applyThemeShadow('md')
            }
          ]}>
            <View style={[
              styles.settingRow,
              {
                padding: spacing.md
              }
            ]}>
              <View style={styles.settingInfo}>
                <Text style={[
                  styles.settingTitle,
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.text,
                    fontSize: typography.fontSizes.md
                  }
                ]}>
                  Dark Mode
                </Text>
              </View>

              <Switch
                value={isDark}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                thumbColor={isDark ? theme.primary : '#f4f3f4'}
              />
            </View>

            <View style={[
              styles.divider,
              {
                backgroundColor: theme.divider
              }
            ]} />

            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  padding: spacing.md
                }
              ]}
              onPress={handleSystemTheme}
            >
              <View style={styles.settingInfo}>
                <Text style={[
                  styles.settingTitle,
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.text,
                    fontSize: typography.fontSizes.md
                  }
                ]}>
                  Use System Theme
                </Text>
              </View>

              {themeType === 'system' && (
                <CustomIcon name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Debug Section (Development Only) */}
        {__DEV__ && (
          <View style={[styles.section, { marginBottom: spacing.lg }]}>
            <Text
              variant="title"
              bold
              size={typography.fontSizes.lg}
              style={{ marginBottom: spacing.sm }}
            >
              Debug (Dev Only)
            </Text>

            <View style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.border,
                ...applyThemeShadow('md')
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.settingRow,
                  {
                    padding: spacing.md
                  }
                ]}
                onPress={() => setShowDebugPanel(true)}
              >
                <View style={styles.settingInfo}>
                  <Text style={[
                    styles.settingTitle,
                    {
                      fontFamily: typography.fontFamily.primary,
                      color: theme.text,
                      fontSize: typography.fontSizes.md
                    }
                  ]}>
                    Profile Debug Panel
                  </Text>
                  <Text style={[
                    {
                      fontFamily: typography.fontFamily.primary,
                      color: theme.textSecondary,
                      fontSize: typography.fontSizes.sm,
                      marginTop: spacing.xxs
                    }
                  ]}>
                    Test profile setup functionality
                  </Text>
                </View>

                <CustomIcon name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          <Text
            variant="title"
            bold
            size={typography.fontSizes.lg}
            style={{ marginBottom: spacing.sm }}
          >
            About
          </Text>

          <View style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.border,
              ...applyThemeShadow('md')
            }
          ]}>
            <View style={[
              styles.settingRow,
              {
                padding: spacing.md
              }
            ]}>
              <View style={styles.settingInfo}>
                <Text style={[
                  styles.settingTitle,
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.text,
                    fontSize: typography.fontSizes.md
                  }
                ]}>
                  Version
                </Text>
              </View>

              <Text style={[
                styles.versionText,
                {
                  fontFamily: typography.fontFamily.primary,
                  color: theme.textSecondary,
                  fontSize: typography.fontSizes.sm
                }
              ]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleConfirmDeleteAccount}
        displayName={profile?.displayName || 'Unknown'}
        isDeleting={isLoading}
      />

      {/* Debug Panel Modal */}
      {__DEV__ && showDebugPanel && (
        <View style={{
          position: 'absolute',
          top: insets.top, // Respect safe area top inset
          left: 0,
          right: 0,
          bottom: insets.bottom, // Respect safe area bottom inset
          backgroundColor: theme.background,
          zIndex: 1000,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.md,
            backgroundColor: theme.backgroundAlt,
          }}>
            <Text variant="heading" size={typography.fontSizes.lg}>
              Profile Debug
            </Text>
            <TouchableOpacity
              onPress={() => setShowDebugPanel(false)}
              style={{
                padding: spacing.xs,
                backgroundColor: theme.background,
                borderRadius: borderRadius.md,
              }}
            >
              <CustomIcon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[{
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSizes.md,
            color: theme.textSecondary,
            textAlign: 'center',
            marginTop: 20
          }]}>
            Debug panel removed for production
          </Text>
        </View>
      )}
    </SafeAreaContainer>
  );
};



export default SettingsScreen;
