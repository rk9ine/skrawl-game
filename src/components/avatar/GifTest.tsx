import React from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import AndroidGifAvatar from './AndroidGifAvatar';

/**
 * Simple GIF test component to verify GIF animation works
 * Add this to any screen to test your GIF file
 */
const GifTest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GIF Animation Test</Text>

      {/* Test 1: Direct Image component */}
      <View style={styles.testContainer}>
        <Text style={styles.testLabel}>Test 1: Direct Image</Text>
        <Image
          source={require('../../../assets/avatars/avatar_pirate.gif')}
          style={[styles.testImage, { backgroundColor: 'transparent' }]}
          resizeMode="cover"
          onLoad={() => console.log('✅ Direct Image: GIF loaded successfully')}
          onError={(error) => console.log('❌ Direct Image: GIF failed to load', error.nativeEvent.error)}
        />
      </View>

      {/* Test 2: With border radius */}
      <View style={styles.testContainer}>
        <Text style={styles.testLabel}>Test 2: With Border Radius</Text>
        <View style={[styles.circularContainer, { backgroundColor: 'transparent' }]}>
          <Image
            source={require('../../../assets/avatars/avatar_pirate.gif')}
            style={[styles.circularImage, { backgroundColor: 'transparent' }]}
            resizeMode="cover"
            onLoad={() => console.log('✅ Circular Image: GIF loaded successfully')}
            onError={(error) => console.log('❌ Circular Image: GIF failed to load', error.nativeEvent.error)}
          />
        </View>
      </View>

      {/* Test 3: Small size (like preview) */}
      <View style={styles.testContainer}>
        <Text style={styles.testLabel}>Test 3: Small Size</Text>
        <Image
          source={require('../../../assets/avatars/avatar_pirate.gif')}
          style={styles.smallImage}
          resizeMode="cover"
          onLoad={() => console.log('✅ Small Image: GIF loaded successfully')}
          onError={(error) => console.log('❌ Small Image: GIF failed to load', error.nativeEvent.error)}
        />
      </View>

      {/* Test 4: Force refresh approach */}
      <View style={styles.testContainer}>
        <Text style={styles.testLabel}>Test 4: Force Refresh</Text>
        <Image
          source={require('../../../assets/avatars/avatar_pirate.gif')}
          style={styles.testImage}
          resizeMode="cover"
          key={Date.now()} // Force re-render
          fadeDuration={0} // Disable fade for immediate display
          onLoad={() => console.log('✅ Force Refresh: GIF loaded successfully')}
          onError={(error) => console.log('❌ Force Refresh: GIF failed to load', error.nativeEvent.error)}
        />
      </View>

      {/* Test 5: Android Optimized */}
      {Platform.OS === 'android' && (
        <View style={styles.testContainer}>
          <Text style={styles.testLabel}>Test 5: Android Optimized</Text>
          <AndroidGifAvatar
            source={require('../../../assets/avatars/avatar_pirate.gif')}
            size={80}
            onLoad={() => console.log('✅ Android Optimized: GIF loaded successfully')}
            onError={(error) => console.log('❌ Android Optimized: GIF failed to load', error)}
          />
        </View>
      )}

      {/* Test 6: Platform Check */}
      <View style={styles.testContainer}>
        <Text style={styles.testLabel}>Test 6: Platform Info</Text>
        <Text style={styles.platformText}>
          Platform: {Platform.OS} {Platform.Version}
        </Text>
        <Text style={styles.platformText}>
          {Platform.OS === 'android' ? 'Using Android-optimized GIF component with aggressive refresh' : 'iOS should support GIF animation natively'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  testContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  testLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  testImage: {
    width: 100,
    height: 100,
  },
  circularContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  circularImage: {
    width: 80,
    height: 80,
  },
  smallImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  platformText: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 2,
    color: '#666',
  },
});

export default GifTest;
