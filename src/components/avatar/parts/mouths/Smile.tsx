import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface SmileMouthProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Simple smile mouth for avatar
 */
const SmileMouth: React.FC<SmileMouthProps> = ({
  color = '#E74C3C', // Default mouth color
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      <Path
        d="M100 140C100 140 114 160 128 160C142 160 156 140 156 140"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </AvatarPart>
  );
};

export default SmileMouth;
