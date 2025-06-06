import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../ui';
import { TouchableOpacity, TextInput } from 'react-native';

/**
 * Test component for Supabase authentication
 * This component helps verify that the authentication setup is working correctly
 */
const AuthTest: React.FC = () => {
  const { theme, typography, spacing } = useTheme();
  const { 
    user, 
    isLoading, 
    sendEmailOtp, 
    verifyEmailOtp, 
    signInWithGoogle, 
    signOut 
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'authenticated'>('email');

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const { error } = await sendEmailOtp(email);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to send verification code');
      } else {
        Alert.alert('Success', 'Verification code sent to your email');
        setStep('otp');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      const { error } = await verifyEmailOtp(email, otp);
      if (error) {
        Alert.alert('Error', error.message || 'Invalid verification code');
      } else {
        Alert.alert('Success', 'Email verified successfully!');
        setStep('authenticated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Error', error.message || 'Google sign-in failed');
      } else {
        Alert.alert('Success', 'Google sign-in successful!');
        setStep('authenticated');
      }
    } catch (error) {
      Alert.alert('Error', 'Google sign-in failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setStep('email');
      setEmail('');
      setOtp('');
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fontFamily.primary,
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.md,
      fontSize: typography.sizes.md,
      color: theme.text,
      backgroundColor: theme.backgroundAlt,
    },
    button: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    buttonSecondary: {
      backgroundColor: theme.secondary,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    buttonText: {
      color: theme.background,
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.primary,
    },
    userInfo: {
      backgroundColor: theme.backgroundAlt,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.md,
    },
    userText: {
      fontSize: typography.sizes.sm,
      color: theme.text,
      marginBottom: spacing.xs,
    },
    loadingText: {
      fontSize: typography.sizes.md,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
  });

  if (user) {
    return (
      <SafeAreaContainer style={styles.container}>
        <Text style={styles.title}>Authentication Test - Success! ✅</Text>
        
        <View style={styles.userInfo}>
          <Text style={styles.userText}>User ID: {user.id}</Text>
          <Text style={styles.userText}>Email: {user.email}</Text>
          <Text style={styles.userText}>Display Name: {user.displayName || 'Not set'}</Text>
          <Text style={styles.userText}>
            Profile Complete: {user.hasCompletedProfileSetup ? 'Yes' : 'No'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.buttonSecondary} 
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer style={styles.container}>
      <Text style={styles.title}>Authentication Test</Text>
      
      {isLoading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}

      {step === 'email' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Sign In with Google'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'otp' && (
        <>
          <Text style={styles.userText}>
            Verification code sent to: {email}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            placeholderTextColor={theme.textSecondary}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => setStep('email')}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaContainer>
  );
};

export default AuthTest;
