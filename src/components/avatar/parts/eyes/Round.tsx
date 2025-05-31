import React from 'react';
import { Path } from 'react-native-svg';
import AvatarPart from '../../AvatarPart';

interface RoundEyesProps {
  color?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

/**
 * Round eyes for avatar
 */
const RoundEyes: React.FC<RoundEyesProps> = ({
  color = '#2C3E50', // Default eye color
  ...props
}) => {
  return (
    <AvatarPart {...props}>
      {/* Left eye */}
      <Path
        d="M96 120C103.732 120 110 113.732 110 106C110 98.268 103.732 92 96 92C88.268 92 82 98.268 82 106C82 113.732 88.268 120 96 120Z"
        fill={color}
      />
      {/* Right eye */}
      <Path
        d="M160 120C167.732 120 174 113.732 174 106C174 98.268 167.732 92 160 92C152.268 92 146 98.268 146 106C146 113.732 152.268 120 160 120Z"
        fill={color}
      />
    </AvatarPart>
  );
};

export default RoundEyes;
