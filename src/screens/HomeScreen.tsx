import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Amazonian</Text>
          <Text style={styles.subtitle}>Explore the Amazon through art!</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Drawing' as never)}
          >
            <View style={styles.cardContent}>
              <Ionicons name="brush" size={40} color="#6A8D73" />
              <Text style={styles.cardTitle}>Start Drawing</Text>
              <Text style={styles.cardDescription}>Create your own Amazonian artwork</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Gallery' as never)}
          >
            <View style={styles.cardContent}>
              <Ionicons name="images" size={40} color="#6A8D73" />
              <Text style={styles.cardTitle}>Gallery</Text>
              <Text style={styles.cardDescription}>View your saved creations</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Amazonian</Text>
          <Text style={styles.infoText}>
            Amazonian is a drawing app that lets you create beautiful artwork inspired by the Amazon rainforest.
            Explore different drawing tools and save your creations to your gallery.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1DE',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 36,
    color: '#3D405B',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#3D405B',
    textAlign: 'center',
    marginTop: 5,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#3D405B',
    marginTop: 10,
    marginBottom: 5,
  },
  cardDescription: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#3D405B',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: '#3D405B',
    marginBottom: 10,
  },
  infoText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#3D405B',
    lineHeight: 24,
  },
});

export default HomeScreen;
