import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Illustration */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/illustration.png')}
          style={styles.image}
        />
      </View>

      {/* Bottom Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to WanderNav</Text>
        <Text style={styles.description}>
          Your journey starts here. WanderNav offers real-time traffic updates, offline maps,
          and route planning to get you where you need to go.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/RegisterScreen')}
        >
          <Text style={[styles.buttonText, { color: '#007BFF' }]}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

