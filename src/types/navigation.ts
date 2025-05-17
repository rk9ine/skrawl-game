export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Whiteboard: undefined;
  DrawingBattle: undefined;
  PrivateMatch: { matchId?: string };
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AuthPrompt: { redirectTo: keyof MainStackParamList };
};
