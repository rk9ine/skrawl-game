import React from 'react';
import { Svg } from 'react-native-svg';

// Import all parts - DISABLED: Parts not implemented yet
// import CircleHead from './parts/heads/Circle';
// import SquareHead from './parts/heads/Square';
// import RoundEyes from './parts/eyes/Round';
// import HappyEyes from './parts/eyes/Happy';
// import SmileMouth from './parts/mouths/Smile';
// import GrinMouth from './parts/mouths/Grin';
// import Glasses from './parts/accessories/Glasses';
// import Hat from './parts/accessories/Hat';

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
  // TODO: Implement avatar parts when needed
  // For now, return a simple placeholder circle
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      <circle
        cx="128"
        cy="128"
        r="100"
        fill={headColor}
        stroke="#000"
        strokeWidth="2"
      />
      {/* Simple eyes */}
      <circle cx="100" cy="110" r="8" fill={eyesColor} />
      <circle cx="156" cy="110" r="8" fill={eyesColor} />
      {/* Simple mouth */}
      <path
        d="M 100 150 Q 128 170 156 150"
        stroke={mouthColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default Avatar;
