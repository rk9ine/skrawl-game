import React, { useEffect } from 'react';
import { Svg } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { G } from 'react-native-svg';

// Import all parts
import CircleHead from './parts/heads/Circle';
import SquareHead from './parts/heads/Square';
import RoundEyes from './parts/eyes/Round';
import HappyEyes from './parts/eyes/Happy';
import SmileMouth from './parts/mouths/Smile';
import GrinMouth from './parts/mouths/Grin';
import Glasses from './parts/accessories/Glasses';
import Hat from './parts/accessories/Hat';

// Import types from Avatar component
import { 
  HeadType, 
  EyesType, 
  MouthType, 
  AccessoryType,
  AvatarProps
} from './Avatar';

// Create animated versions of SVG components
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedG = Animated.createAnimatedComponent(G);

interface AnimatedAvatarProps extends AvatarProps {
  breathingIntensity?: number; // 0 = no breathing, 1 = normal, 2 = exaggerated
  breathingSpeed?: number; // 1 = normal speed, 0.5 = slower, 2 = faster
}

/**
 * Animated SVG Avatar component with breathing animation
 */
const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  size = 100,
  headType = 'circle',
  headColor = '#F5D0C5',
  eyesType = 'round',
  eyesColor = '#2C3E50',
  mouthType = 'smile',
  mouthColor = '#E74C3C',
  accessoryType = 'none',
  accessoryColor = '#3498DB',
  accessorySecondaryColor = '#2980B9',
  breathingIntensity = 1,
  breathingSpeed = 1,
}) => {
  // Animation values
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Set up continuous animation
  useEffect(() => {
    // Only animate if breathing intensity is greater than 0
    if (breathingIntensity > 0) {
      // Calculate animation parameters based on intensity and speed
      const yMovement = 3 * breathingIntensity; // Max vertical movement
      const scaleChange = 0.02 * breathingIntensity; // Max scale change
      const duration = 2000 / breathingSpeed; // Duration in ms
      
      // Breathing animation - vertical movement
      translateY.value = withRepeat(
        withTiming(-yMovement, { 
          duration: duration, 
          easing: Easing.inOut(Easing.sin) 
        }),
        -1, // -1 for infinite repeats
        true // reverse on each repeat
      );
      
      // Subtle scaling animation
      scale.value = withRepeat(
        withTiming(1 + scaleChange, { 
          duration: duration, 
          easing: Easing.inOut(Easing.sin) 
        }),
        -1,
        true
      );
    } else {
      // Reset to default values if animation is disabled
      translateY.value = 0;
      scale.value = 1;
    }
  }, [breathingIntensity, breathingSpeed]);
  
  // Create animated props for the container group
  const animatedProps = useAnimatedProps(() => {
    return {
      transform: `translate(0, ${translateY.value}) scale(${scale.value})`,
    };
  });

  // Render the appropriate head component based on type
  const renderHead = () => {
    switch (headType) {
      case 'square':
        return <SquareHead color={headColor} />;
      case 'circle':
      default:
        return <CircleHead color={headColor} />;
    }
  };

  // Render the appropriate eyes component based on type
  const renderEyes = () => {
    switch (eyesType) {
      case 'happy':
        return <HappyEyes color={eyesColor} />;
      case 'round':
      default:
        return <RoundEyes color={eyesColor} />;
    }
  };

  // Render the appropriate mouth component based on type
  const renderMouth = () => {
    switch (mouthType) {
      case 'grin':
        return <GrinMouth color={mouthColor} />;
      case 'smile':
      default:
        return <SmileMouth color={mouthColor} />;
    }
  };

  // Render accessories based on selection
  const renderAccessories = () => {
    switch (accessoryType) {
      case 'glasses':
        return <Glasses color={accessoryColor} />;
      case 'hat':
        return <Hat color={accessoryColor} secondaryColor={accessorySecondaryColor} />;
      case 'both':
        return (
          <>
            <Glasses color={accessoryColor} />
            <Hat color={accessoryColor} secondaryColor={accessorySecondaryColor} />
          </>
        );
      case 'none':
      default:
        return null;
    }
  };

  return (
    <AnimatedSvg width={size} height={size} viewBox="0 0 256 256">
      <AnimatedG animatedProps={animatedProps} origin="128, 128">
        {renderHead()}
        {renderEyes()}
        {renderMouth()}
        {renderAccessories()}
      </AnimatedG>
    </AnimatedSvg>
  );
};

export default AnimatedAvatar;
