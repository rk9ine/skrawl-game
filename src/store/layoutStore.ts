import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlayerListPosition = 'left' | 'right'; // Kept for type compatibility
export type ChatInputPosition = 'top' | 'bottom';

interface LayoutState {
  // Drawing Battle layout preferences
  chatInputPosition: ChatInputPosition;
  useSystemKeyboard: boolean;

  // Actions
  setChatInputPosition: (position: ChatInputPosition) => void;
  setUseSystemKeyboard: (useSystem: boolean) => void;
  resetLayoutPreferences: () => void;
}

// Default layout preferences
const DEFAULT_CHAT_INPUT_POSITION: ChatInputPosition = 'bottom';
const DEFAULT_USE_SYSTEM_KEYBOARD = false; // Default to virtual keyboard (toggle OFF)

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Initial state
      chatInputPosition: DEFAULT_CHAT_INPUT_POSITION,
      useSystemKeyboard: DEFAULT_USE_SYSTEM_KEYBOARD,

      // Actions
      setChatInputPosition: (position) => set({ chatInputPosition: position }),
      setUseSystemKeyboard: (useSystem) => set({ useSystemKeyboard: useSystem }),
      resetLayoutPreferences: () => set({
        chatInputPosition: DEFAULT_CHAT_INPUT_POSITION,
        useSystemKeyboard: DEFAULT_USE_SYSTEM_KEYBOARD,
      }),
    }),
    {
      name: 'amazonian-layout-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
