import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../../components/ui';

const LoginScreen = () => {
  const { theme, typography, spacing, borderRadius, shadows } = useTheme();
  const { signInWithEmail, signInWithGoogle, skipAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signInWithEmail(email);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  const handleSkip = () => {
    skipAuth();
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text
              variant="heading"
              size={typography.fontSizes.xxxl}
              color={theme.primary}
              style={styles.appTitle}
            >
              Skrawl
            </Text>
            <Text
              variant="body"
              color={theme.textSecondary}
              style={styles.appSubtitle}
            >
              Draw, Battle, Create!
            </Text>
          </View>

          {magicLinkSent ? (
            <View style={styles.magicLinkSentContainer}>
              <Ionicons name="mail" size={60} color={theme.primary} />
              <Text style={[styles.magicLinkTitle, { fontFamily: typography.fontFamily.primaryBold, color: theme.text }]}>
                Check your email
              </Text>
              <Text style={[styles.magicLinkText, { fontFamily: typography.fontFamily.primary, color: theme.textSecondary }]}>
                We've sent a magic link to {email}. Click the link in the email to sign in.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => setMagicLinkSent(false)}
              >
                <Text style={[styles.buttonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.formContainer}>
                <Text
                  variant="title"
                  bold
                  style={styles.sectionTitle}
                >
                  Sign in with email
                </Text>

                <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { fontFamily: typography.fontFamily.primary, color: theme.text }]}
                    placeholder="Email address"
                    placeholderTextColor={theme.textDisabled}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={handleEmailLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.buttonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                      Send Magic Link
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: theme.divider }]}>
                  <Text style={[styles.dividerText, { fontFamily: typography.fontFamily.primary, color: theme.textSecondary, backgroundColor: theme.background }]}>
                    or
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={handleGoogleLogin}
                >
                  <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
                  <Text style={[styles.socialButtonText, { fontFamily: typography.fontFamily.primary, color: theme.text }]}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.skipContainer}>
                <TouchableOpacity onPress={handleSkip}>
                  <Text style={[styles.skipText, { fontFamily: typography.fontFamily.primary, color: theme.textSecondary }]}>
                    Skip for now
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.skipNote, { fontFamily: typography.fontFamily.primary, color: theme.textDisabled }]}>
                  You can access the whiteboard without an account
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 42,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 24,
    position: 'relative',
  },
  dividerText: {
    position: 'absolute',
    top: -10,
    left: '50%',
    paddingHorizontal: 16,
    transform: [{ translateX: -20 }],
  },
  socialButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
  },
  skipContainer: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  skipNote: {
    fontSize: 14,
    textAlign: 'center',
  },
  magicLinkSentContainer: {
    alignItems: 'center',
    padding: 24,
  },
  magicLinkTitle: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  magicLinkText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default LoginScreen;
