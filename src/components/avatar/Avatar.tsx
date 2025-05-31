import React from 'react';
import { Svg } from 'react-native-svg';

// Import all parts
import CircleHead from './parts/heads/Circle';
import SquareHead from './parts/heads/Square';
import RoundEyes from './parts/eyes/Round';
import HappyEyes from './parts/eyes/Happy';
import SmileMouth from './parts/mouths/Smile';
import GrinMouth from './parts/mouths/Grin';
import Glasses from './parts/accessories/Glasses';
import Hat from './parts/accessories/Hat';

// Define types for avatar customization
export type HeadType = 'circle' | 'square';
export type EyesType = 'round' | 'happy';
export type MouthType = 'smile' | 'grin';
export type AccessoryType = 'none' | 'glasses' | 'hat' | 'both';

export interface AvatarProps {
  size?: number;
  headType?: HeadType;
  headColor?: string;
  eyesType?: EyesType;
  eyesColor?: string;
  mouthType?: MouthType;
  mouthColor?: string;
  accessoryType?: AccessoryType;
  accessoryColor?: string;
  accessorySecondaryColor?: string;
}

/**
 * Composable SVG Avatar component
 */
const Avatar: React.FC<AvatarProps> = ({
  size = 100,
  headType = 'circle',
  headColor = '#F5D0C5',
  eyesType = 'round',
  eyesColor = '#2C3E50',
  mouthType = 'smile',
  mouthColor = '#E74C3C',
  accessoryType = 'none',
  accessoryColor = '#3498DB',
  accessorySecondaryColor = '#2980B9',
}) => {
  // Render the appropriate head component based on type
  const renderHead = () => {
    switch (headType) {
      case 'square':
        return <SquareHead color={headColor} />;
      case 'circle':
      default:
        return <CircleHead color={headColor} />;
    }
  };

  // Render the appropriate eyes component based on type
  const renderEyes = () => {
    switch (eyesType) {
      case 'happy':
        return <HappyEyes color={eyesColor} />;
      case 'round':
      default:
        return <RoundEyes color={eyesColor} />;
    }
  };

  // Render the appropriate mouth component based on type
  const renderMouth = () => {
    switch (mouthType) {
      case 'grin':
        return <GrinMouth color={mouthColor} />;
      case 'smile':
      default:
        return <SmileMouth color={mouthColor} />;
    }
  };

  // Render accessories based on selection
  const renderAccessories = () => {
    switch (accessoryType) {
      case 'glasses':
        return <Glasses color={accessoryColor} />;
      case 'hat':
        return <Hat color={accessoryColor} secondaryColor={accessorySecondaryColor} />;
      case 'both':
        return (
          <>
            <Glasses color={accessoryColor} />
            <Hat color={accessoryColor} secondaryColor={accessorySecondaryColor} />
          </>
        );
      case 'none':
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {renderHead()}
      {renderEyes()}
      {renderMouth()}
      {renderAccessories()}
    </Svg>
  );
};

export default Avatar;
