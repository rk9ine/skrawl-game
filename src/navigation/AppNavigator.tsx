import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store';
import { RootStackParamList, MainStackParamList } from '../types/navigation';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AuthPromptScreen from '../screens/auth/AuthPromptScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import WhiteboardScreen from '../screens/main/WhiteboardScreen';
import DrawingBattleScreen from '../screens/main/DrawingBattleScreen';
import PrivateMatchScreen from '../screens/main/PrivateMatchScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import SkiaCanvasTestScreen from '../screens/main/SkiaCanvasTestScreen';
import AvatarSelectionScreen from '../screens/main/AvatarSelectionScreen';

// Loading Screen
import LoadingScreen from '../screens/LoadingScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AppNavigator = () => {
  const { isLoading, checkSession, user, isSkipped, hasCompletedProfileSetup } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user && !isSkipped ? (
          // Not logged in - show auth flow
          <RootStack.Group>
            <RootStack.Screen name="Auth" component={LoginScreen} />
          </RootStack.Group>
        ) : user && (hasCompletedProfileSetup() === false) ? (
          // Logged in but profile not set up - show profile setup
          // The explicit comparison to false is important to handle both:
          // 1. New users where hasCompletedProfileSetup is explicitly false
          // 2. First-time users where hasCompletedProfileSetup is undefined
          <RootStack.Group>
            <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </RootStack.Group>
        ) : (
          // Logged in with profile or skipped auth - show main app
          <RootStack.Group>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="AuthPrompt" component={AuthPromptScreen} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// Main Navigator (after authentication or skipping)
const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Dashboard" component={DashboardScreen} />
      <MainStack.Screen name="Whiteboard" component={WhiteboardScreen} />
      <MainStack.Screen name="DrawingBattle" component={DrawingBattleScreen} />
      <MainStack.Screen name="PrivateMatch" component={PrivateMatchScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="SkiaCanvasTest" component={SkiaCanvasTestScreen} />
      <MainStack.Screen name="AvatarSelection" component={AvatarSelectionScreen} />
    </MainStack.Navigator>
  );
};

export default AppNavigator;
