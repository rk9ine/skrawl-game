import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../../components/ui';
import { applyThemeShadow } from '../../utils/styleUtils';

const SettingsScreen = () => {
  const { theme, typography, spacing, borderRadius, shadows, isDark, setThemeType, themeType } = useTheme();
  const navigation = useNavigation();
  const { user, isSkipped, signOut } = useAuthStore();

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
        { text: 'Sign Out', onPress: signOut },
      ]
    );
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
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text
          variant="heading"
          size={typography.fontSizes.xxl}
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
              borderColor: theme.border,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              ...applyThemeShadow('sm')
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
                  {isSkipped ? 'G' : user?.email?.charAt(0).toUpperCase() || 'U'}
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
                  {isSkipped ? 'Guest User' : user?.email?.split('@')[0] || 'User'}
                </Text>

                <Text style={[
                  styles.profileEmail,
                  {
                    fontFamily: typography.fontFamily.primary,
                    color: theme.textSecondary,
                    fontSize: typography.fontSizes.sm
                  }
                ]}>
                  {isSkipped ? 'Not signed in' : user?.email || ''}
                </Text>
              </View>
            </View>

            {isSkipped ? (
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  {
                    backgroundColor: theme.primary,
                    margin: spacing.md,
                    borderRadius: borderRadius.lg,
                    ...applyThemeShadow('md')
                  }
                ]}
                onPress={() => signOut()} // This will sign out the guest user and show the Auth screen
              >
                <Text style={[
                  styles.signInButtonText,
                  {
                    fontFamily: typography.fontFamily.primaryBold,
                    color: '#FFFFFF',
                    fontSize: typography.fontSizes.md
                  }
                ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            ) : (
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
            )}
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
              borderColor: theme.border,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              ...applyThemeShadow('sm')
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
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

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
              borderColor: theme.border,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              ...applyThemeShadow('sm')
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
    </SafeAreaContainer>
  );
};



export default SettingsScreen;
