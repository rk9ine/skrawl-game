import React, { useState } from 'react';
import { Image, View, Platform, StyleSheet } from 'react-native';

interface AndroidGifAvatarProps {
  source: any;
  size: number;
  style?: any;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

/**
 * Android-optimized GIF Avatar component
 * Simplified to let React Native handle GIF animations naturally
 */
const AndroidGifAvatar: React.FC<AndroidGifAvatarProps> = ({
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

  return (
    <View style={[imageStyle, { overflow: 'hidden', backgroundColor: 'transparent' }]}>
      <Image
        source={source}
        style={[imageStyle, { backgroundColor: 'transparent' }]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
        fadeDuration={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default AndroidGifAvatar;
