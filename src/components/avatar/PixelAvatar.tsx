import React, { useEffect } from 'react';
import { Svg, Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';

// Create animated versions of SVG components
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Define pixel art face shapes
const PIXEL_FACES = [
  // Basic round face
  [
    [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
    [3, 4], [12, 4],
    [3, 5], [12, 5],
    [3, 6], [12, 6],
    [3, 7], [12, 7],
    [3, 8], [12, 8],
    [3, 9], [12, 9],
    [3, 10], [12, 10],
    [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11],
  ],
  // Square face
  [
    [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
    [3, 4], [12, 4],
    [3, 5], [12, 5],
    [3, 6], [12, 6],
    [3, 7], [12, 7],
    [3, 8], [12, 8],
    [3, 9], [12, 9],
    [3, 10], [12, 10],
    [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11],
  ],
  // Triangle face
  [
    [7, 3], [8, 3],
    [6, 4], [7, 4], [8, 4], [9, 4],
    [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5],
    [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
    [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
    [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8],
    [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9],
    [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [12, 10],
    [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11],
  ],
];

// Define pixel art eyes
const PIXEL_EYES = [
  // Normal eyes
  [
    [5, 6], [6, 6], [9, 6], [10, 6]
  ],
  // Dot eyes
  [
    [5, 6], [10, 6]
  ],
  // X eyes
  [
    [5, 5], [6, 6], [5, 6], [6, 5], [9, 5], [10, 6], [9, 6], [10, 5]
  ],
  // Line eyes
  [
    [5, 5], [6, 5], [9, 5], [10, 5]
  ],
  // Eyepatch
  [
    [5, 5], [6, 5], [7, 5], [5, 6], [6, 6], [7, 6], [10, 6]
  ],
];

// Define pixel art mouths
const PIXEL_MOUTHS = [
  // Smile
  [
    [6, 8], [7, 9], [8, 9], [9, 8]
  ],
  // Straight
  [
    [6, 8], [7, 8], [8, 8], [9, 8]
  ],
  // Frown
  [
    [6, 9], [7, 8], [8, 8], [9, 9]
  ],
  // O mouth
  [
    [6, 8], [7, 8], [8, 8], [9, 8], [6, 9], [9, 9], [7, 9], [8, 9]
  ],
  // Tongue out
  [
    [6, 8], [7, 8], [8, 8], [9, 8], [7, 9], [8, 9], [7, 10]
  ],
];

// Define colors (skribbl.io style)
const COLORS = [
  '#FF6B6B', // Red
  '#4361EE', // Blue
  '#4CAF50', // Green
  '#FFC107', // Yellow
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#E91E63', // Pink
  '#00BCD4', // Cyan
];

interface PixelAvatarProps {
  size?: number;
  faceIndex?: number;
  eyesIndex?: number;
  mouthIndex?: number;
  colorIndex?: number;
  pixelSize?: number;
  animationIntensity?: number;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({
  size = 100,
  faceIndex = 0,
  eyesIndex = 0,
  mouthIndex = 0,
  colorIndex = 0,
  pixelSize = 1,
  animationIntensity = 1,
}) => {
  // Get the selected parts
  const facePixels = PIXEL_FACES[faceIndex % PIXEL_FACES.length];
  const eyesPixels = PIXEL_EYES[eyesIndex % PIXEL_EYES.length];
  const mouthPixels = PIXEL_MOUTHS[mouthIndex % PIXEL_MOUTHS.length];
  const color = COLORS[colorIndex % COLORS.length];

  // Create shared values for jiggle animation
  const jiggleX = useSharedValue(0);
  const jiggleY = useSharedValue(0);

  // Set up continuous jiggle animation
  useEffect(() => {
    // Only run animation if intensity is greater than 0
    if (animationIntensity <= 0) {
      jiggleX.value = 0;
      jiggleY.value = 0;
      return;
    }

    // Create random jiggle patterns with different durations
    const jiggleAmount = 0.3 * animationIntensity;

    // X-axis jiggle - continuous random movement
    jiggleX.value = withRepeat(
      withSequence(
        withTiming(jiggleAmount, { duration: 150 }),
        withTiming(-jiggleAmount, { duration: 220 }),
        withTiming(jiggleAmount * 0.5, { duration: 180 }),
        withTiming(-jiggleAmount * 0.7, { duration: 200 }),
        withTiming(0, { duration: 150 })
      ),
      -1, // Infinite repetitions
      true // Reverse on each repeat
    );

    // Y-axis jiggle - slightly different pattern for more randomness
    jiggleY.value = withRepeat(
      withSequence(
        withTiming(-jiggleAmount * 0.8, { duration: 200 }),
        withTiming(jiggleAmount * 0.6, { duration: 180 }),
        withTiming(-jiggleAmount * 0.4, { duration: 160 }),
        withTiming(jiggleAmount, { duration: 240 }),
        withTiming(0, { duration: 120 })
      ),
      -1, // Infinite repetitions
      true // Reverse on each repeat
    );

    return () => {
      // Reset values when component unmounts or animation intensity changes
      jiggleX.value = 0;
      jiggleY.value = 0;
    };
  }, [animationIntensity]);

  // Create animated props for the container
  const animatedProps = useAnimatedProps(() => {
    return {
      transform: `translate(${jiggleX.value}, ${jiggleY.value})`,
    };
  });

  // Calculate grid size
  const gridSize = 16;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
    >
      <AnimatedG animatedProps={animatedProps}>
        {/* Render face pixels */}
        {facePixels.map((pixel, index) => (
          <Rect
            key={`face-${index}`}
            x={pixel[0]}
            y={pixel[1]}
            width={pixelSize}
            height={pixelSize}
            fill={color}
          />
        ))}

        {/* Render eyes pixels */}
        {eyesPixels.map((pixel, index) => (
          <Rect
            key={`eyes-${index}`}
            x={pixel[0]}
            y={pixel[1]}
            width={pixelSize}
            height={pixelSize}
            fill="#000000"
          />
        ))}

        {/* Render mouth pixels */}
        {mouthPixels.map((pixel, index) => (
          <Rect
            key={`mouth-${index}`}
            x={pixel[0]}
            y={pixel[1]}
            width={pixelSize}
            height={pixelSize}
            fill="#000000"
          />
        ))}
      </AnimatedG>
    </Svg>
  );
};

export default PixelAvatar;
