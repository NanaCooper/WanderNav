import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { authApiService } from '../src/services/api';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await authApiService.login(email, password);
      const token = response.token;

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        Alert.alert('Success', 'Logged in successfully!');
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', 'Unexpected response from server.');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);

      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Unable to login. Please check your credentials or server.';

      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your journey</Text>
      </View>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/SignUp')}>
        <Text style={styles.signInLink}>
          Don’t have an account? <Text style={styles.linkText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    height: 50,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  signInLink: {
    textAlign: 'center',
    color: '#444',
    fontSize: 14,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
