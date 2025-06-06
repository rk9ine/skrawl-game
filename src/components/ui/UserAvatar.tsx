import React from 'react';
import { View, Platform } from 'react-native';
import GifAvatar from '../avatar/GifAvatar';
import AndroidGifAvatar from '../avatar/AndroidGifAvatar';
import CustomIcon, { IconName } from './CustomIcon';

interface AvatarData {
  type: 'custom' | 'icon';
  value: string;
  color?: string;
  imagePath?: string;
}

interface UserAvatarProps {
  avatarData?: string; // JSON string containing avatar data
  avatar?: string; // Fallback simple avatar identifier
  size?: number;
  backgroundColor?: string;
  style?: any;
}

// Avatar mapping for custom avatars
const customAvatarMap: { [key: string]: any } = {
  'Pirate': require('../../../assets/avatars/avatar_pirate.gif'),
  'Cat': require('../../../assets/avatars/avatar_cat.gif'),
  'Dog': require('../../../assets/avatars/avatar_dog.gif'),
  'Laugh': require('../../../assets/avatars/avatar_laugh.gif'),
  'Ninja': require('../../../assets/avatars/avatar_ninja.gif'),
  'Sad': require('../../../assets/avatars/avatar_sad.gif'),
  'Shocked': require('../../../assets/avatars/avatar_shocked.gif'),
  'Smile': require('../../../assets/avatars/avatar_smile.gif'),
  'Upset': require('../../../assets/avatars/avatar_upset.gif'),
  'Weird': require('../../../assets/avatars/avatar_weird.gif'),
  'Wizard': require('../../../assets/avatars/avatar_wizard.gif'),
};

// Default background color for custom avatars
const defaultAvatarColor = '#4361EE';

/**
 * UserAvatar component that renders custom GIF avatars
 * Supports both JSON format and simple string avatar names
 * No emoji fallbacks - only custom avatars are supported
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarData,
  avatar,
  size = 32,
  backgroundColor,
  style,
}) => {
  // Parse avatar data - handle both JSON and simple string formats
  let parsedAvatarData: AvatarData | null = null;
  let simpleAvatarName: string | null = null;

  if (avatarData) {
    // Try to parse as JSON first
    try {
      parsedAvatarData = JSON.parse(avatarData);
    } catch (error) {
      // If JSON parsing fails, treat as simple string (avatar name like "Cat", "Pirate", etc.)
      simpleAvatarName = avatarData;
    }
  }

  // Check if this is a custom avatar (either JSON format or simple string)
  const isCustomAvatar = (parsedAvatarData?.type === 'custom' && parsedAvatarData.imagePath) || simpleAvatarName;

  // Get the image path - either from parsed JSON or simple string
  const imagePath = parsedAvatarData?.imagePath || simpleAvatarName;

  // If user has old icon-type avatar data, ignore it (we only support custom avatars now)
  if (parsedAvatarData?.type === 'icon') {
    console.log('UserAvatar: Ignoring old icon-type avatar, only custom avatars are supported');
  }

  // Only render custom GIF avatars
  if (isCustomAvatar && imagePath) {
    const imageSource = customAvatarMap[imagePath];

    if (imageSource) {
      return (
        <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, style]}>
          {Platform.OS === 'android' ? (
            <AndroidGifAvatar
              source={imageSource}
              size={size}
            />
          ) : (
            <GifAvatar
              source={imageSource}
              size={size}
            />
          )}
        </View>
      );
    }
  }

  // No fallback - return empty view if no custom avatar
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: defaultAvatarColor,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    />
  );
};

export default UserAvatar;
