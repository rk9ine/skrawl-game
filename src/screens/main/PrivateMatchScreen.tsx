import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeContext';

type PrivateMatchScreenRouteProp = RouteProp<MainStackParamList, 'PrivateMatch'>;

const PrivateMatchScreen = () => {
  const { theme, typography, spacing, borderRadius, shadows } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<PrivateMatchScreenRouteProp>();
  
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  const handleCreateGame = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    // In a real app, this would create a new private game and generate a code
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    Alert.alert(
      'Game Created',
      `Share this code with your friends: ${generatedCode}`,
      [
        { text: 'Copy Code', onPress: () => console.log('Copy code') },
        { text: 'OK' },
      ]
    );
  };
  
  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      Alert.alert('Error', 'Please enter a game code');
      return;
    }
    
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    // In a real app, this would validate the code and join the game
    console.log('Join game with code:', gameCode);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.backgroundAlt }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { fontFamily: typography.fontFamily.secondary, color: theme.text }]}>
          Private Match
        </Text>
        
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamily.primaryBold, color: theme.text }]}>
              Your Name
            </Text>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { fontFamily: typography.fontFamily.primary, color: theme.text }]}
                placeholder="Enter your name"
                placeholderTextColor={theme.textDisabled}
                value={playerName}
                onChangeText={setPlayerName}
              />
            </View>
          </View>
          
          <View style={[styles.optionsContainer, { borderColor: theme.divider }]}>
            <View style={styles.option}>
              <View style={styles.optionContent}>
                <View style={[styles.optionIconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="create-outline" size={24} color={theme.primary} />
                </View>
                
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { fontFamily: typography.fontFamily.primaryBold, color: theme.text }]}>
                    Create a Game
                  </Text>
                  
                  <Text style={[styles.optionDescription, { fontFamily: typography.fontFamily.primary, color: theme.textSecondary }]}>
                    Start a new private game and invite friends
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateGame}
              >
                <Text style={[styles.actionButtonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            
            <View style={styles.option}>
              <View style={styles.optionContent}>
                <View style={[styles.optionIconContainer, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons name="enter-outline" size={24} color={theme.secondary} />
                </View>
                
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { fontFamily: typography.fontFamily.primaryBold, color: theme.text }]}>
                    Join a Game
                  </Text>
                  
                  <Text style={[styles.optionDescription, { fontFamily: typography.fontFamily.primary, color: theme.textSecondary }]}>
                    Enter a code to join an existing game
                  </Text>
                </View>
              </View>
              
              <View style={styles.joinGameContainer}>
                <View style={[styles.codeInputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.codeInput, { fontFamily: typography.fontFamily.primary, color: theme.text }]}
                    placeholder="Enter code"
                    placeholderTextColor={theme.textDisabled}
                    value={gameCode}
                    onChangeText={setGameCode}
                    autoCapitalize="characters"
                    maxLength={6}
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                  onPress={handleJoinGame}
                >
                  <Text style={[styles.actionButtonText, { fontFamily: typography.fontFamily.primaryBold, color: '#FFFFFF' }]}>
                    Join
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  inputContainer: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
  },
  optionsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  actionButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
  },
  joinGameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInputContainer: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginRight: 12,
  },
  codeInput: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PrivateMatchScreen;
