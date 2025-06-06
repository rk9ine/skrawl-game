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
  const { sendEmailOtp, verifyEmailOtp, signInWithGoogle, lastUsedEmail } = useAuthStore();

  const [email, setEmail] = useState(lastUsedEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await useAuthStore.getState().sendEmailOtp(email);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to send verification code');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setCodeSent(true);
    } catch (error) {
      console.error('Send code error:', error);
      Alert.alert('Error', 'Failed to send verification code');
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await useAuthStore.getState().verifyEmailOtp(email, verificationCode);

      if (error) {
        Alert.alert('Error', error.message || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      // Success - the auth state listener will handle navigation
      setIsLoading(false);
    } catch (error) {
      console.error('Verify code error:', error);
      Alert.alert('Error', 'Failed to verify code');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        if (error.message?.includes('not available') ||
            error.message?.includes('platform')) {
          Alert.alert(
            'Google Sign-in Not Available',
            Platform.OS === 'ios'
              ? 'Google Sign-in on iOS requires a development build. Please use email authentication for now.'
              : 'Google Sign-in requires a development build. Please use email authentication for now, or build the app with expo-dev-client for full Google Sign-in support.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', error.message || 'Google sign-in failed');
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google sign-in failed');
      setIsLoading(false);
    }
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

          {codeSent ? (
            <View style={styles.verificationContainer}>
              <Ionicons name="mail" size={60} color={theme.primary} />
              <Text style={[styles.verificationTitle, { fontFamily: typography.fontFamily.primaryBold, color: theme.text }]}>
                Enter verification code
              </Text>
              <Text style={[styles.verificationText, { fontFamily: typography.fontFamily.primary, color: theme.textSecondary }]}>
                We've sent a 6-digit code to {email}. Enter the code below to sign in.
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="key-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontFamily: typography.fontFamily.primary, color: theme.text }]}
                  placeholder="000000"
                  placeholderTextColor={theme.textDisabled}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.buttonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.secondary, opacity: 0.7 }]}
                onPress={() => setCodeSent(false)}
              >
                <Text style={[styles.buttonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                  Back to Email
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

                {lastUsedEmail && (
                  <Text
                    variant="body"
                    color={theme.textSecondary}
                    style={styles.hintText}
                  >
                    Using your previous email address
                  </Text>
                )}

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
                  {lastUsedEmail && email === lastUsedEmail && (
                    <TouchableOpacity
                      style={styles.clearEmailButton}
                      onPress={() => setEmail('')}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={handleSendCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.buttonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                      Send Verification Code
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
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
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
  clearEmailButton: {
    padding: 4,
    marginLeft: 8,
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

  verificationContainer: {
    alignItems: 'center',
    padding: 24,
  },
  verificationTitle: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default LoginScreen;
