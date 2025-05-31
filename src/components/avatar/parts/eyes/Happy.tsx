import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface HappyEyesProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Happy curved eyes for avatar
 */
const HappyEyes: React.FC<HappyEyesProps> = ({
  color = '#2C3E50', // Default eye color
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      {/* Left eye - curved happy eye */}
      <Path
        d="M82 100C82 100 88 110 96 110C104 110 110 100 110 100"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Right eye - curved happy eye */}
      <Path
        d="M146 100C146 100 152 110 160 110C168 110 174 100 174 100"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </AvatarPart>
  );
};

export default HappyEyes;
