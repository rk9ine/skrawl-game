export type AuthStackParamList = {
  Login: undefined;
  ProfileSetup: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  DrawingBattle: undefined;
  PrivateMatch: { matchId?: string };
  Settings: undefined;
  SkiaCanvasTest: undefined;
  Leaderboard: undefined;
  AvatarSelection: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  AuthPrompt: { redirectTo: keyof MainStackParamList };
};
