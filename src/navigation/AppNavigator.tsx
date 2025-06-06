import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, MainStackParamList } from '../types/navigation';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import DrawingBattleScreen from '../screens/main/DrawingBattleScreen';
import PrivateMatchScreen from '../screens/main/PrivateMatchScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import SkiaCanvasTestScreen from '../screens/main/SkiaCanvasTestScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import AvatarSelectionScreen from '../screens/main/AvatarSelectionScreen';
import ProfileEditScreen from '../screens/main/ProfileEditScreen';
import GameModeSelectionScreen from '../screens/main/GameModeSelectionScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AppNavigator = () => {
  // Use more specific selectors to avoid unnecessary re-renders
  const session = useAuthStore((state) => state.session);
  const needsProfileSetup = useAuthStore((state) => state.needsProfileSetup);
  const profile = useAuthStore((state) => state.profile);

  // Debug logging to see what's happening
  React.useEffect(() => {
    console.log('🧭 AppNavigator - Auth State:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      needsProfileSetup,
      hasProfile: !!profile,
      profileCompleted: profile?.hasCompletedProfileSetup,
      displayName: profile?.displayName,
    });
  }, [session, needsProfileSetup, profile]);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          // Not logged in - show auth flow
          <RootStack.Group>
            <RootStack.Screen name="Auth" component={LoginScreen} />
          </RootStack.Group>
        ) : needsProfileSetup ? (
          // Logged in but profile not set up - show profile setup
          <RootStack.Group>
            <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </RootStack.Group>
        ) : (
          // Logged in with profile - show main app
          <RootStack.Group>
            <RootStack.Screen name="Main" component={MainNavigator} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// Main Navigator (after authentication)
const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Dashboard" component={DashboardScreen} />
      <MainStack.Screen name="DrawingBattle" component={DrawingBattleScreen} />
      <MainStack.Screen name="PrivateMatch" component={PrivateMatchScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="SkiaCanvasTest" component={SkiaCanvasTestScreen} />
      <MainStack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <MainStack.Screen name="AvatarSelection" component={AvatarSelectionScreen} />
      <MainStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <MainStack.Screen name="GameModeSelection" component={GameModeSelectionScreen} />
    </MainStack.Navigator>
  );
};

export default AppNavigator;
