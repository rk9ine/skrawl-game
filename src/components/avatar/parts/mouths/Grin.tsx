import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface GrinMouthProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Grin mouth with teeth for avatar
 */
const GrinMouth: React.FC<GrinMouthProps> = ({
  color = '#E74C3C', // Default mouth color
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      {/* Outer mouth shape */}
      <Path
        d="M90 140C90 140 108 170 128 170C148 170 166 140 166 140"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Teeth */}
      <Path
        d="M100 140H156V150C156 150 142 160 128 160C114 160 100 150 100 150V140Z"
        fill="#FFFFFF"
      />
    </AvatarPart>
  );
};

export default GrinMouth;
