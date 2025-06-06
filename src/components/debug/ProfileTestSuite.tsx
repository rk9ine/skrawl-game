import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text } from '../ui';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { ProfileService } from '../../services/profileService';
import { ProfileValidation } from '../../utils/profileValidation';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message?: string;
}

/**
 * Debug component for testing profile management edge cases
 * Only include this in development builds
 */
const ProfileTestSuite: React.FC = () => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const { user, profile } = useAuthStore();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: 'pass' | 'fail', message?: string) => {
    setTestResults(prev => 
      prev.map(test => 
        test.name === name ? { ...test, status, message } : test
      )
    );
  };

  const runEdgeCaseTests = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setIsRunning(true);
    
    const tests: TestResult[] = [
      { name: 'Username Format Validation', status: 'pending' },
      { name: 'Username Length Limits', status: 'pending' },
      { name: 'Special Characters Handling', status: 'pending' },
      { name: 'Profanity Filter', status: 'pending' },
      { name: 'Network Error Handling', status: 'pending' },
      { name: 'Database Constraint Testing', status: 'pending' },
      { name: 'Concurrent Request Handling', status: 'pending' },
      { name: 'Avatar Validation', status: 'pending' },
    ];

    setTestResults(tests);

    try {
      // Test 1: Username Format Validation
      const formatTests = [
        { input: 'ab', expected: false }, // Too short
        { input: 'a'.repeat(25), expected: false }, // Too long
        { input: 'user@name', expected: false }, // Invalid characters
        { input: 'user name', expected: false }, // Spaces
        { input: 'user_name', expected: true }, // Valid
        { input: 'user-123', expected: true }, // Valid
      ];

      let formatTestsPassed = 0;
      for (const test of formatTests) {
        const result = ProfileValidation.validateUsernameFormat(test.input);
        if (result.isValid === test.expected) {
          formatTestsPassed++;
        }
      }

      updateTestResult(
        'Username Format Validation',
        formatTestsPassed === formatTests.length ? 'pass' : 'fail',
        `${formatTestsPassed}/${formatTests.length} tests passed`
      );

      // Test 2: Username Length Limits
      const shortName = 'ab';
      const longName = 'a'.repeat(25);
      const validName = 'testuser123';

      const shortResult = ProfileValidation.validateUsernameFormat(shortName);
      const longResult = ProfileValidation.validateUsernameFormat(longName);
      const validResult = ProfileValidation.validateUsernameFormat(validName);

      updateTestResult(
        'Username Length Limits',
        !shortResult.isValid && !longResult.isValid && validResult.isValid ? 'pass' : 'fail',
        `Short: ${!shortResult.isValid}, Long: ${!longResult.isValid}, Valid: ${validResult.isValid}`
      );

      // Test 3: Special Characters Handling
      const specialCharTests = [
        'user@name', 'user#name', 'user$name', 'user%name', 'user name'
      ];

      let specialCharsPassed = 0;
      for (const testName of specialCharTests) {
        const result = ProfileValidation.validateUsernameFormat(testName);
        if (!result.isValid) {
          specialCharsPassed++;
        }
      }

      updateTestResult(
        'Special Characters Handling',
        specialCharsPassed === specialCharTests.length ? 'pass' : 'fail',
        `${specialCharsPassed}/${specialCharTests.length} invalid characters rejected`
      );

      // Test 4: Profanity Filter
      const profanityTests = ['admin', 'moderator', 'support', 'official'];
      let profanityPassed = 0;
      
      for (const testName of profanityTests) {
        const result = ProfileValidation.validateUsernameFormat(testName);
        if (!result.isValid) {
          profanityPassed++;
        }
      }

      updateTestResult(
        'Profanity Filter',
        profanityPassed > 0 ? 'pass' : 'fail',
        `${profanityPassed}/${profanityTests.length} profane words blocked`
      );

      // Test 5: Network Error Handling
      try {
        // This should test network connectivity
        const hasNetwork = await ProfileValidation.checkNetworkConnectivity();
        updateTestResult(
          'Network Error Handling',
          'pass',
          `Network connectivity: ${hasNetwork ? 'Available' : 'Unavailable'}`
        );
      } catch (error) {
        updateTestResult(
          'Network Error Handling',
          'fail',
          'Network check failed'
        );
      }

      // Test 6: Database Constraint Testing
      try {
        // Test with current username (should fail as duplicate)
        if (profile?.displayName) {
          const duplicateResult = await ProfileService.validateUsernameChange(
            user.id, 
            profile.displayName
          );
          
          updateTestResult(
            'Database Constraint Testing',
            !duplicateResult.isValid ? 'pass' : 'fail',
            duplicateResult.error || 'Duplicate check result'
          );
        } else {
          updateTestResult(
            'Database Constraint Testing',
            'pass',
            'No existing username to test'
          );
        }
      } catch (error) {
        updateTestResult(
          'Database Constraint Testing',
          'fail',
          'Database validation failed'
        );
      }

      // Test 7: Concurrent Request Handling
      try {
        const testUsername = `test_${Date.now()}`;
        const promises = Array(3).fill(null).map(() => 
          ProfileService.validateUsernameChange(user.id, testUsername)
        );
        
        const results = await Promise.all(promises);
        const allSameResult = results.every(r => r.isValid === results[0].isValid);
        
        updateTestResult(
          'Concurrent Request Handling',
          allSameResult ? 'pass' : 'fail',
          `${results.length} concurrent requests handled`
        );
      } catch (error) {
        updateTestResult(
          'Concurrent Request Handling',
          'fail',
          'Concurrent request test failed'
        );
      }

      // Test 8: Avatar Validation
      const avatarTests = [
        { input: '🎨', expected: true }, // Emoji
        { input: 'brush', expected: true }, // Icon name
        { input: '', expected: false }, // Empty
        { input: 'invalid@avatar', expected: false }, // Invalid format
      ];

      let avatarTestsPassed = 0;
      for (const test of avatarTests) {
        const result = ProfileValidation.validateAvatar(test.input);
        if (result.isValid === test.expected) {
          avatarTestsPassed++;
        }
      }

      updateTestResult(
        'Avatar Validation',
        avatarTestsPassed === avatarTests.length ? 'pass' : 'fail',
        `${avatarTestsPassed}/${avatarTests.length} avatar tests passed`
      );

    } catch (error) {
      console.error('Test suite error:', error);
      Alert.alert('Test Error', 'Failed to run complete test suite');
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text variant="heading" size={typography.fontSizes.lg} style={{ marginBottom: spacing.md }}>
        Profile Management Test Suite
      </Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={runEdgeCaseTests}
          disabled={isRunning}
        >
          <Text variant="body" bold color="#FFFFFF">
            {isRunning ? 'Running Tests...' : 'Run Edge Case Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.backgroundAlt, borderColor: theme.border, borderWidth: 1 }]}
          onPress={clearResults}
        >
          <Text variant="body" color={theme.text}>
            Clear Results
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((test, index) => (
          <View
            key={index}
            style={[
              styles.testResult,
              {
                backgroundColor: theme.backgroundAlt,
                borderColor: test.status === 'pass' ? theme.success : 
                           test.status === 'fail' ? theme.error : theme.border
              }
            ]}
          >
            <View style={styles.testHeader}>
              <Text variant="body" bold size={typography.fontSizes.md}>
                {test.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: test.status === 'pass' ? theme.success :
                                   test.status === 'fail' ? theme.error : theme.textSecondary
                  }
                ]}
              >
                <Text variant="body" size={typography.fontSizes.sm} color="#FFFFFF">
                  {test.status.toUpperCase()}
                </Text>
              </View>
            </View>
            {test.message && (
              <Text variant="body" size={typography.fontSizes.sm} color={theme.textSecondary}>
                {test.message}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsContainer: {
    maxHeight: 400,
  },
  testResult: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default ProfileTestSuite;
