import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlayerListPosition = 'left' | 'right'; // Kept for type compatibility
export type ChatInputPosition = 'top' | 'bottom';

interface LayoutState {
  // Drawing Battle layout preferences
  chatInputPosition: ChatInputPosition;

  // Actions
  setChatInputPosition: (position: ChatInputPosition) => void;
  resetLayoutPreferences: () => void;
}

// Default layout preferences
const DEFAULT_CHAT_INPUT_POSITION: ChatInputPosition = 'bottom';

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Initial state
      chatInputPosition: DEFAULT_CHAT_INPUT_POSITION,

      // Actions
      setChatInputPosition: (position) => set({ chatInputPosition: position }),
      resetLayoutPreferences: () => set({
        chatInputPosition: DEFAULT_CHAT_INPUT_POSITION,
      }),
    }),
    {
      name: 'amazonian-layout-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
