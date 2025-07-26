import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/bg-map.png')}
      style={styles.background}
    >
      {/* Title at the top */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>WanderNav</Text>
      </View>

      <View style={styles.overlay}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/SignIn')}
        >
          <Text style={[styles.buttonText, { color: '#007BFF' }]}>Sign In</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/SignUp')}
        >
          <Text style={[styles.buttonText, { color: '#007BFF' }]}>Sign Up</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 60, // adjust as needed
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,

  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 100,
    marginBottom: 18,
  },
  buttonPressed: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});