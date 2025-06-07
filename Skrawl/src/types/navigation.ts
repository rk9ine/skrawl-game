export type AuthStackParamList = {
  Login: undefined;
  ProfileSetup: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  DrawingBattle: { privateMode?: boolean };
  PrivateMatch: { matchId?: string };
  Settings: undefined;
  Whiteboard: undefined;

  Leaderboard: undefined;
  AvatarSelection: { fromProfileEdit?: boolean };
  ProfileEdit: undefined;
  GameModeSelection: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  AuthPrompt: { redirectTo: keyof MainStackParamList };
};
