import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { THEME } from '../constants/theme'; // Assuming this path is correct

// Import the Provider HERE
// If your 'contexts' folder is at the project root:
import { SavedDestinationsProvider } from '../contexts/SavedDestinationsContext';
// If your 'contexts' folder is directly inside 'app/':
// import { SavedDestinationsProvider } from './contexts/SavedDestinationsContext';


// --- Mock Auth Hook (Keep this or your actual auth logic) ---
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false
  // In a real app, this would be updated by SignIn/SignUp screens
  // For testing, you might want a way to toggle this, e.g.:
  // useEffect(() => {
  //  setTimeout(() => setIsAuthenticated(true), 5000); // Auto-login after 5s for testing
  // }, []);
  return { isAuthenticated, setIsAuthenticated };
};
// ---

export default function RootLayout() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentRouteName = segments[segments.length - 1] || (segments[0] === '(tabs)' ? '(tabs)' : segments[0] || 'index');
    const preAuthScreens = ['index', 'WelcomeScreen', 'SignIn', 'SignUp'];
    const isOnPreAuthScreen = preAuthScreens.includes(currentRouteName);

    console.log(`RootLayout Effect: Auth=${isAuthenticated}, CurrentRoute=${currentRouteName}, Segments=${segments.join('/')}, IsOnPreAuthScreen=${isOnPreAuthScreen}`);

    if (isAuthenticated && isOnPreAuthScreen) {
      console.log('RootLayout: Authenticated, on pre-auth screen. Redirecting to main app.');
      router.replace('/(tabs)/homeScreen');
    } else if (!isAuthenticated && currentRouteName !== 'index' && !isOnPreAuthScreen && currentRouteName !== '(tabs)') {
      // If not authenticated and NOT on a pre-auth screen (and not already on index or trying to access tabs directly)
      // This condition might need refinement based on your exact desired flow for unauthenticated users
      // For instance, if they try to deep link to a protected route.
      // console.log('RootLayout: Not authenticated, not on pre-auth. Redirecting to index.');
      // router.replace('/index'); // Or '/WelcomeScreen'
    } else if (!isAuthenticated && currentRouteName === '(tabs)') {
       console.log('RootLayout: Not authenticated, but router is at (tabs). Redirecting to index.');
       router.replace('/index');
    }
  }, [isAuthenticated, segments, router]);

  const globalScreenOptions = {
    headerStyle: { backgroundColor: THEME.BACKGROUND_LIGHT, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: THEME.BORDER_COLOR },
    headerTintColor: THEME.PRIMARY_BRAND_COLOR,
    headerTitleStyle: { fontWeight: '600', fontSize: 18, color: THEME.TEXT_PRIMARY },
    headerBackTitleVisible: false,
  };

  return (
    // Wrap the ENTIRE Stack with the Provider
    <SavedDestinationsProvider>
      <Stack screenOptions={globalScreenOptions}>
        {isAuthenticated ? (
          // Authenticated Stack
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          // Unauthenticated Stack
          <>
            <Stack.Screen
              name="index" // Your InitialSplashScreen (app/index.tsx)
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WelcomeScreen" // app/WelcomeScreen.tsx
              options={{ title: "Get Started" }}
            />
            <Stack.Screen
              name="SignIn" // app/SignIn.tsx
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen
              name="SignUp" // app/SignUp.tsx
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack>
    </SavedDestinationsProvider>
  );
}