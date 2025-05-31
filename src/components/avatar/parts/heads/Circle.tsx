import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface CircleHeadProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Circle head shape for avatar
 */
const CircleHead: React.FC<CircleHeadProps> = ({
  color = '#F5D0C5', // Default skin tone
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      <Path
        d="M128 216C176.601 216 216 176.601 216 128C216 79.3989 176.601 40 128 40C79.3989 40 40 79.3989 40 128C40 176.601 79.3989 216 128 216Z"
        fill={color}
      />
    </AvatarPart>
  );
};

export default CircleHead;
