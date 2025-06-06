/**
 * Profile Debug Panel
 * A debug component to test and verify profile setup functionality
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { Text, SafeAreaContainer } from '../ui';
import { TouchableOpacity } from 'react-native';
import { runAllProfileTests, testUserProfileExists, testCompleteProfileFlow } from '../../utils/profileTestUtils';

/**
 * Debug panel for testing profile setup functionality
 */
const ProfileDebugPanel: React.FC = () => {
  const { theme, typography, spacing } = useTheme();
  const { 
    user, 
    session, 
    profile, 
    needsProfileSetup, 
    isLoading,
    checkProfileStatus,
    updateProfile,
    resetUserProfile
  } = useAuthStore();

  const [testResults, setTestResults] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test current user profile
  const testCurrentUserProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setIsRunningTests(true);
    setTestResults('Testing current user profile...\n');

    try {
      const result = await testUserProfileExists(user.id);
      const resultText = `Profile Test Result:\n${JSON.stringify(result, null, 2)}\n\n`;
      setTestResults(prev => prev + resultText);
    } catch (error) {
      setTestResults(prev => prev + `Error: ${error}\n\n`);
    }

    setIsRunningTests(false);
  };

  // Test complete profile flow
  const testProfileFlow = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setIsRunningTests(true);
    setTestResults('Testing complete profile flow...\n');

    try {
      const result = await testCompleteProfileFlow(
        user.id,
        user.email || '',
        'TestUser',
        'test-avatar'
      );
      const resultText = `Flow Test Result:\n${JSON.stringify(result, null, 2)}\n\n`;
      setTestResults(prev => prev + resultText);
    } catch (error) {
      setTestResults(prev => prev + `Error: ${error}\n\n`);
    }

    setIsRunningTests(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults('Running all profile tests...\n');

    try {
      // Capture console logs
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      await runAllProfileTests(user?.id, user?.email);

      // Restore console.log
      console.log = originalLog;

      setTestResults(prev => prev + logs.join('\n') + '\n\n');
    } catch (error) {
      setTestResults(prev => prev + `Error: ${error}\n\n`);
    }

    setIsRunningTests(false);
  };

  // Refresh profile status
  const refreshProfileStatus = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setTestResults('Refreshing profile status...\n');
    try {
      await checkProfileStatus(user);
      setTestResults(prev => prev + 'Profile status refreshed\n\n');
    } catch (error) {
      setTestResults(prev => prev + `Error refreshing: ${error}\n\n`);
    }
  };

  // Test profile update
  const testProfileUpdate = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setTestResults('Testing profile update...\n');
    try {
      const result = await updateProfile({
        displayName: 'DebugUser',
        avatar: 'debug-avatar'
      });
      
      const resultText = `Update Result:\n${JSON.stringify(result, null, 2)}\n\n`;
      setTestResults(prev => prev + resultText);
    } catch (error) {
      setTestResults(prev => prev + `Error updating: ${error}\n\n`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ padding: spacing.md }}>
        {/* Current State */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt, borderRadius: 8, padding: spacing.md }]}>
          <Text variant="subtitle" size={typography.fontSizes.lg} style={{ marginBottom: spacing.sm }}>
            Current State
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            User ID: {user?.id || 'None'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Email: {user?.email || 'None'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Has Session: {session ? 'Yes' : 'No'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Has Profile: {profile ? 'Yes' : 'No'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Profile Completed: {profile?.hasCompletedProfileSetup ? 'Yes' : 'No'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Display Name: {profile?.displayName || 'None'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Needs Setup: {needsProfileSetup ? 'Yes' : 'No'}
          </Text>
          <Text variant="body" color={theme.textSecondary}>
            Loading: {isLoading ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Test Buttons */}
        <View style={[styles.section, { marginTop: spacing.md }]}>
          <Text variant="subtitle" size={typography.fontSizes.lg} style={{ marginBottom: spacing.sm }}>
            Tests
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary, marginBottom: spacing.sm }]}
            onPress={testCurrentUserProfile}
            disabled={isRunningTests || !user}
          >
            <Text variant="body" color="#FFFFFF" bold>
              Test Current User Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.secondary, marginBottom: spacing.sm }]}
            onPress={testProfileFlow}
            disabled={isRunningTests || !user}
          >
            <Text variant="body" color="#FFFFFF" bold>
              Test Profile Flow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent, marginBottom: spacing.sm }]}
            onPress={runAllTests}
            disabled={isRunningTests}
          >
            <Text variant="body" color="#FFFFFF" bold>
              Run All Tests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.warning, marginBottom: spacing.sm }]}
            onPress={refreshProfileStatus}
            disabled={isRunningTests || !user}
          >
            <Text variant="body" color="#FFFFFF" bold>
              Refresh Profile Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.success, marginBottom: spacing.sm }]}
            onPress={testProfileUpdate}
            disabled={isRunningTests || !user}
          >
            <Text variant="body" color="#FFFFFF" bold>
              Test Profile Update
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        <View style={[styles.section, { marginTop: spacing.md }]}>
          <Text variant="subtitle" size={typography.fontSizes.lg} style={{ marginBottom: spacing.sm }}>
            Test Results
          </Text>
          <ScrollView 
            style={[styles.resultsContainer, { backgroundColor: theme.backgroundAlt }]}
            nestedScrollEnabled
          >
            <Text variant="body" color={theme.textSecondary} style={{ fontFamily: 'monospace' }}>
              {testResults || 'No tests run yet...'}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    height: 200,
    borderRadius: 8,
    padding: 12,
  },
});

export default ProfileDebugPanel;
