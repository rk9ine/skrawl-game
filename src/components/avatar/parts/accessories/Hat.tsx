import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface HatProps {
  color?: string;
  secondaryColor?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Simple hat accessory for avatar
 */
const Hat: React.FC<HatProps> = ({
  color = '#3498DB', // Default hat color
  secondaryColor = '#2980B9', // Default hat band color
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      {/* Hat top */}
      <Path
        d="M80 70C80 70 90 40 128 40C166 40 176 70 176 70V90H80V70Z"
        fill={color}
      />
      
      {/* Hat brim */}
      <Path
        d="M70 90C70 90 80 100 128 100C176 100 186 90 186 90H70Z"
        fill={color}
      />
      
      {/* Hat band */}
      <Path
        d="M80 85H176"
        stroke={secondaryColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </AvatarPart>
  );
};

export default Hat;
