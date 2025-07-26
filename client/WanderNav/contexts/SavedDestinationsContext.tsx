// contexts/SavedDestinationsContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Or your preferred icons

// Define the shape of a destination
export interface Destination {
  id: string;
  name: string;
  // You might want to store more details like coordinates, full address, etc.
  // For simplicity, we'll just use name and a default icon.
}

// Define the shape of a pre-defined saved place (like Home, Gym)
export interface PredefinedPlace {
  id: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap; // Allow icons from different sets
  iconType: typeof MaterialIcons | typeof Ionicons; // Specify which icon set
}

interface SavedDestinationsContextType {
  savedDestinations: Destination[];
  predefinedPlaces: PredefinedPlace[];
  addDestination: (name: string) => void;
  // You might add removeDestination, editDestination later
}

const SavedDestinationsContext = createContext<SavedDestinationsContextType | undefined>(undefined);

export const SavedDestinationsProvider = ({ children }: { children: ReactNode }) => {
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);

  // These are the buttons like Home, Gym, Add that appear on both screens
  const [predefinedPlaces] = useState<PredefinedPlace[]>([
    { id: 'home', name: 'Home', icon: 'home', iconType: MaterialIcons },
    { id: 'gym', name: 'Gym', icon: 'fitness-center', iconType: MaterialIcons },
  ]);

  const addDestination = (name: string) => {
    if (name.trim() === "") return; // Don't add empty destinations
    const newDestination: Destination = {
      id: Date.now().toString(), // Simple unique ID
      name: name.trim(),
    };
    setSavedDestinations(prevDestinations => [...prevDestinations, newDestination]);
  };

  return (
    <SavedDestinationsContext.Provider value={{ savedDestinations, predefinedPlaces, addDestination }}>
      {children}
    </SavedDestinationsContext.Provider>
  );
};

export const useSavedDestinations = () => {
  const context = useContext(SavedDestinationsContext);
  if (context === undefined) {
    throw new Error('useSavedDestinations must be used within a SavedDestinationsProvider');
  }
  return context;
};