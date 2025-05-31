import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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
  animationIntensity?: number;
}

const PixelAvatarV2: React.FC<PixelAvatarProps> = ({
  size = 100,
  faceIndex = 0,
  eyesIndex = 0,
  mouthIndex = 0,
  colorIndex = 0,
  animationIntensity = 1,
}) => {
  // Get the selected parts
  const facePixels = PIXEL_FACES[faceIndex % PIXEL_FACES.length];
  const eyesPixels = PIXEL_EYES[eyesIndex % PIXEL_EYES.length];
  const mouthPixels = PIXEL_MOUTHS[mouthIndex % PIXEL_MOUTHS.length];
  const color = COLORS[colorIndex % COLORS.length];
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Set up animation
  useEffect(() => {
    // Only animate if intensity > 0
    if (animationIntensity <= 0) {
      translateX.value = 0;
      translateY.value = 0;
      return;
    }
    
    // Calculate jiggle amount based on intensity and size
    const jiggleAmount = (size / 100) * animationIntensity;
    
    // Create jiggle animation for X axis
    translateX.value = withRepeat(
      withSequence(
        withTiming(jiggleAmount * 0.5, { duration: 150 }),
        withTiming(-jiggleAmount * 0.7, { duration: 220 }),
        withTiming(jiggleAmount * 0.3, { duration: 180 }),
        withTiming(-jiggleAmount * 0.5, { duration: 200 }),
        withTiming(0, { duration: 150 })
      ),
      -1, // Infinite repetitions
      true // Reverse on each repeat
    );
    
    // Create jiggle animation for Y axis with different timing
    translateY.value = withRepeat(
      withSequence(
        withTiming(-jiggleAmount * 0.6, { duration: 200 }),
        withTiming(jiggleAmount * 0.4, { duration: 180 }),
        withTiming(-jiggleAmount * 0.2, { duration: 160 }),
        withTiming(jiggleAmount * 0.8, { duration: 240 }),
        withTiming(0, { duration: 120 })
      ),
      -1, // Infinite repetitions
      true // Reverse on each repeat
    );
    
    return () => {
      // Reset values when component unmounts
      translateX.value = 0;
      translateY.value = 0;
    };
  }, [size, animationIntensity]);
  
  // Create animated style for container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ]
    };
  });
  
  // Calculate pixel size based on container size
  const gridSize = 16;
  const pixelSize = size / gridSize;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.pixelContainer, animatedStyle]}>
        {/* Face pixels */}
        {facePixels.map((pixel, index) => (
          <View
            key={`face-${index}`}
            style={[
              styles.pixel,
              {
                backgroundColor: color,
                width: pixelSize,
                height: pixelSize,
                left: pixel[0] * pixelSize,
                top: pixel[1] * pixelSize,
              }
            ]}
          />
        ))}
        
        {/* Eyes pixels */}
        {eyesPixels.map((pixel, index) => (
          <View
            key={`eyes-${index}`}
            style={[
              styles.pixel,
              {
                backgroundColor: '#000000',
                width: pixelSize,
                height: pixelSize,
                left: pixel[0] * pixelSize,
                top: pixel[1] * pixelSize,
              }
            ]}
          />
        ))}
        
        {/* Mouth pixels */}
        {mouthPixels.map((pixel, index) => (
          <View
            key={`mouth-${index}`}
            style={[
              styles.pixel,
              {
                backgroundColor: '#000000',
                width: pixelSize,
                height: pixelSize,
                left: pixel[0] * pixelSize,
                top: pixel[1] * pixelSize,
              }
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  pixelContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pixel: {
    position: 'absolute',
  },
});

export default PixelAvatarV2;
