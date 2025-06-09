import React, { useState } from 'react';
import { Image, View, Platform, StyleSheet } from 'react-native';

interface GifAvatarProps {
  source: any;
  size: number;
  style?: any;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

/**
 * Simple GIF Avatar component that lets React Native handle GIF animations naturally
 * Removed aggressive refresh strategies that were interrupting animations
 */
const GifAvatar: React.FC<GifAvatarProps> = ({
  source,
  size,
  style,
  onLoad,
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setHasError(true);
    setImageLoaded(false);
    onError?.(error);
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...style,
  };

  // Platform-specific optimizations for GIF animation
  const imageProps = Platform.select({
    ios: {
      // iOS handles GIFs well by default
      resizeMode: 'cover' as const,
    },
    android: {
      // Android specific optimizations for GIF performance
      resizeMode: 'cover' as const,
      // Ensure GIF animations are not paused
      fadeDuration: 0,
    },
    default: {
      resizeMode: 'cover' as const,
    },
  });

  return (
    <View style={[imageStyle, { overflow: 'hidden', backgroundColor: 'transparent' }]}>
      <Image
        source={source}
        style={[imageStyle, { backgroundColor: 'transparent' }]}
        onLoad={handleLoad}
        onError={handleError}
        {...imageProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default GifAvatar;
