import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const SplashScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.appName}>WanderNav</Text>
      </View>

      {/* Next Button */}
      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          pressed && styles.nextButtonPressed,
        ]}
        onPress={() => router.push('/WelcomeScreen')}
      >
        <Text style={[styles.nextText, { color: '#007BFF' }]}>Next</Text>
      </Pressable>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
  },
  nextButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  nextButtonPressed: {
    backgroundColor: '#007BFF',
  },
  nextText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
