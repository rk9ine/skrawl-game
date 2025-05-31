import React, { useState, useEffect } from 'react';
import { Image, View, Platform, StyleSheet } from 'react-native';

interface GifAvatarProps {
  source: any;
  size: number;
  style?: any;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

/**
 * Enhanced Avatar component specifically for GIF animation support
 * Handles platform-specific GIF rendering issues
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh every few seconds to restart GIF animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
      // Force hardware acceleration for better GIF performance
      renderToHardwareTextureAndroid: true,
      // Ensure GIF animations are not paused
      fadeDuration: 0,
      // Additional Android GIF fixes
      progressiveRenderingEnabled: true,
      shouldRasterizeIOS: false,
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
        // Simplified props for better GIF compatibility
        resizeMode="cover"
        fadeDuration={0}
        // Force re-render to help with animation
        key={`gif-${refreshKey}-${source}`}
      />


    </View>
  );
};

const styles = StyleSheet.create({});

export default GifAvatar;
