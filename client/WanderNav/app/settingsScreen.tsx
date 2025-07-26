import React from 'react';
import {

  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SettingsScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      Alert.alert('Success', 'You have been logged out.');
      router.replace('/SignIn'); // Adjust route name if necessary
    } catch (error) {
      if (error instanceof Error) {
        console.error('Logout error:', error.message);
        Alert.alert('Error', error.message);
      } else {
        console.error('Unknown error during logout:', error);
        Alert.alert('Error', 'Something went wrong.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
