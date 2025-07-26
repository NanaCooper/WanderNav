import React from 'react';
import { Tabs, useRouter } from 'expo-router';
// ... other imports like icons, THEME ...



export default function TabLayout() {
  const router = useRouter();

  return (
    // NO PROVIDER WRAPPER HERE ANYMORE
    <Tabs
      screenOptions={{
        // ... your screenOptions
      }}
    >
      {/* Your <Tabs.Screen ... /> definitions */}
      <Tabs.Screen
        name="homeScreen"
        // ... options
      />
      <Tabs.Screen
        name="searchScreen"
        // ... options
      />
      <Tabs.Screen
        name="savedDestinationsScreen" // This screen uses useSavedDestinations()
        // ... options - it will now get context from the provider in app/_layout.tsx
      />
      {/* ... other tabs and non-tab screens ... */}
    </Tabs>
    // NO PROVIDER WRAPPER HERE ANYMORE
  );
}