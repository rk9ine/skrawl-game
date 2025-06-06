import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Text, SafeAreaContainer } from '../../components/ui';

type AuthPromptScreenRouteProp = RouteProp<RootStackParamList, 'AuthPrompt'>;
type AuthPromptScreenNavigationProp = NativeStackNavigationProp<RootStackParamList & MainStackParamList>;

const AuthPromptScreen = () => {
  const { theme, typography, spacing, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<AuthPromptScreenNavigationProp>();
  const route = useRoute<AuthPromptScreenRouteProp>();
  const { signOut } = useAuthStore();

  const { redirectTo } = route.params;

  const handleLogin = () => {
    // Sign out the skipped user first, which will trigger the navigation condition
    // in AppNavigator to show the Auth screen
    signOut();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaContainer style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={80} color={theme.primary} style={styles.icon} />

        <Text
          variant="heading"
          size={typography.fontSizes.xxxl}
          style={styles.title}
        >
          Login Required
        </Text>

        <Text
          variant="body"
          color={theme.textSecondary}
          style={styles.message}
        >
          You need to be logged in to access this feature. Sign in with your email to continue.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
        >
          <Text
            variant="body"
            bold
            color="#FFFFFF"
            style={styles.buttonText}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={handleCancel}
        >
          <Text
            variant="body"
            color={theme.textSecondary}
            style={styles.cancelButtonText}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});

export default AuthPromptScreen;
