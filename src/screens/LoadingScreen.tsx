import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6A8D73" />
      <Text style={styles.text}>Loading Skrawl...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F1DE',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: 'PatrickHand_400Regular',
    color: '#3D405B',
  },
});

export default LoadingScreen;
