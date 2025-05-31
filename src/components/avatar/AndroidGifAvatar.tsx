import React, { useState, useEffect } from 'react';
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
 * Uses aggressive refresh strategy to force animation on Android
 */
const AndroidGifAvatar: React.FC<AndroidGifAvatarProps> = ({
  source,
  size,
  style,
  onLoad,
  onError,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Aggressive refresh strategy for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const interval = setInterval(() => {
        // Force re-render by toggling visibility and changing key
        setIsVisible(false);
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
          setIsVisible(true);
        }, 50);
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...style,
  };

  if (!isVisible) {
    return <View style={[imageStyle, { backgroundColor: 'transparent' }]} />;
  }

  return (
    <View style={[imageStyle, { overflow: 'hidden', backgroundColor: 'transparent' }]}>
      <Image
        source={source}
        style={[imageStyle, { backgroundColor: 'transparent' }]}
        onLoad={onLoad}
        onError={onError}
        resizeMode="cover"
        fadeDuration={0}
        // Android-specific optimizations
        renderToHardwareTextureAndroid={true}
        progressiveRenderingEnabled={true}
        // Force re-render with unique key
        key={`android-gif-${refreshKey}`}
      />


    </View>
  );
};

const styles = StyleSheet.create({});

export default AndroidGifAvatar;
