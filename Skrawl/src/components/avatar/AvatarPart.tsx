import React from 'react';
import { G } from 'react-native-svg';

interface AvatarPartProps {
  color?: string;
  secondaryColor?: string;
  size?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  children?: React.ReactNode;
}

/**
 * Base component for all avatar parts
 * Provides positioning, scaling, and rotation capabilities
 */
const AvatarPart: React.FC<AvatarPartProps> = ({
  children,
  x = 0,
  y = 0,
  scale = 1,
  rotation = 0,
}) => {
  return (
    <G
      x={x}
      y={y}
      scale={scale}
      rotation={rotation}
      origin="128, 128" // Assuming 256x256 viewBox
    >
      {children}
    </G>
  );
};

export default AvatarPart;
