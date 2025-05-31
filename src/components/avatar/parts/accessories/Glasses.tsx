import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface GlassesProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Glasses accessory for avatar
 */
const Glasses: React.FC<GlassesProps> = ({
  color = '#34495E', // Default glasses color
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      {/* Left lens */}
      <Path
        d="M96 126C107.046 126 116 117.046 116 106C116 94.9543 107.046 86 96 86C84.9543 86 76 94.9543 76 106C76 117.046 84.9543 126 96 126Z"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Right lens */}
      <Path
        d="M160 126C171.046 126 180 117.046 180 106C180 94.9543 171.046 86 160 86C148.954 86 140 94.9543 140 106C140 117.046 148.954 126 160 126Z"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Bridge */}
      <Path
        d="M116 106H140"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Temple arms */}
      <Path
        d="M76 106H60"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      <Path
        d="M180 106H196"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </AvatarPart>
  );
};

export default Glasses;
