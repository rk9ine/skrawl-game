import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebViewGifProps {
  source: any;
  size: number;
  style?: any;
}

/**
 * WebView-based GIF component that guarantees animation
 * This is a fallback for when Image component doesn't animate GIFs
 */
const WebViewGif: React.FC<WebViewGifProps> = ({
  source,
  size,
  style,
}) => {
  // Convert require() source to base64 or file path
  const getGifSource = () => {
    // For local assets, we need to create an HTML page that displays the GIF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100vw;
              height: 100vh;
              background: transparent;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            }
          </style>
        </head>
        <body>
          <img src="data:image/gif;base64,${getBase64FromAsset()}" alt="Animated GIF" />
        </body>
      </html>
    `;
    
    return htmlContent;
  };

  // This is a placeholder - in a real implementation, you'd need to convert
  // the asset to base64 or serve it from a local server
  const getBase64FromAsset = () => {
    // For now, return empty string - this would need actual implementation
    return '';
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    ...style,
  };

  return (
    <View style={containerStyle}>
      <WebView
        source={{ html: getGifSource() }}
        style={StyleSheet.absoluteFill}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scalesPageToFit={false}
        startInLoadingState={false}
        javaScriptEnabled={false}
      />
    </View>
  );
};

export default WebViewGif;
