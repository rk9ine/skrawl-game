import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface SquareHeadProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Square head shape for avatar with rounded corners
 */
const SquareHead: React.FC<SquareHeadProps> = ({
  color = '#F5D0C5', // Default skin tone
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      <Path
        d="M60 80C60 68.9543 68.9543 60 80 60H176C187.046 60 196 68.9543 196 80V176C196 187.046 187.046 196 176 196H80C68.9543 196 60 187.046 60 176V80Z"
        fill={color}
      />
    </AvatarPart>
  );
};

export default SquareHead;
