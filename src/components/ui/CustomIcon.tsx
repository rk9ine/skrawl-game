import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type IconName =
  // Navigation & UI
  | 'arrow-back' | 'chevron-back' | 'chevron-forward' | 'settings' | 'checkmark' | 'close' | 'create-outline'
  // Dashboard Features
  | 'people' | 'brush' | 'trophy'
  // Reactions
  | 'thumbs-up' | 'thumbs-down'
  // Alerts & Actions
  | 'warning' | 'trash';

interface CustomIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

/**
 * Custom Icon component using Ionicons for UI elements and text-based icons for avatars
 */
const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 24,
  color = '#000000',
  style,
}) => {
  // Icons that should use Ionicons
  const ioniconMap: Record<string, string> = {
    // Navigation & UI
    'arrow-back': 'arrow-back',
    'chevron-back': 'chevron-back',
    'chevron-forward': 'chevron-forward',
    'settings': 'settings',
    'checkmark': 'checkmark',
    'close': 'close',
    'create-outline': 'create-outline',

    // Dashboard Features
    'people': 'people',
    'brush': 'brush',
    'trophy': 'trophy',

    // Reactions
    'thumbs-up': 'thumbs-up',
    'thumbs-down': 'thumbs-down',

    // Alerts & Actions
    'warning': 'warning',
    'trash': 'trash',
  };

  // Check if this icon should use Ionicons
  if (ioniconMap[name]) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Ionicons
          name={ioniconMap[name] as any}
          size={size}
          color={color}
        />
      </View>
    );
  }

  // No fallback icons - only Ionicons for UI elements
  return null;
};

const styles = StyleSheet.create({});

export default CustomIcon;
