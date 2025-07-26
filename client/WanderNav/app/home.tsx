// WanderNav/app/home.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from 'src/services/api';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  UIManager,
  StatusBar,
  Keyboard,
  Alert,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
// Import Stack from expo-router
import { useRouter, useFocusEffect, Stack } from 'expo-router'; // <--- MODIFIED
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

// --- THEME and Constants ---
// ... (your existing theme and constants code remains unchanged)
const THEME = {
  PRIMARY_BRAND_COLOR: '#3498DB',
  ACCENT_COLOR: '#2ECC71',
  BACKGROUND_LIGHT: '#ECF0F1',
  BACKGROUND_WHITE: '#FFFFFF',
  TEXT_PRIMARY: '#2C3E50',
  TEXT_SECONDARY: '#7F8C8D',
  TEXT_ON_PRIMARY_BRAND: '#FFFFFF',
  BORDER_COLOR: '#BDC3C7',
  SHADOW_COLOR: 'rgba(44, 62, 80, 0.15)',
  MAP_CONTROL_BACKGROUND: 'rgba(255, 255, 255, 0.98)',
  SUCCESS_COLOR: '#2ECC71',
  ERROR_COLOR: '#E74C3C',
  TEXT_PLACEHOLDER: '#95A5A6',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE_DELTA_DEFAULT = 0.0922;
const LONGITUDE_DELTA_DEFAULT = LATITUDE_DELTA_DEFAULT * ASPECT_RATIO;
const USER_LOCATION_LATITUDE_DELTA = 0.02;
const USER_LOCATION_LONGITUDE_DELTA = USER_LOCATION_LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_FALLBACK_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: LATITUDE_DELTA_DEFAULT,
  longitudeDelta: LONGITUDE_DELTA_DEFAULT,
};
const ICON_SIZE_STANDARD = 24;
const ICON_SIZE_LARGE = 30;
const PRESSED_SCALE_VALUE = 0.95;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try { UIManager.setLayoutAnimationEnabledExperimental(true); } catch (e) { /* ignore */ }
}

// --- Reusable Animated Pressable Component ---
// ... (your AnimatedPressable component remains unchanged)
interface AnimatedPressableProps {
  onPress?: () => void;
  style?: any;
  children: React.ReactNode;
  pressableStyle?: any;
  scaleTo?: number;
  friction?: number;
  tension?: number;
}
const AnimatedPressable: React.FC<AnimatedPressableProps> = ({ onPress, style, children, pressableStyle, scaleTo = PRESSED_SCALE_VALUE, friction = 7, tension = 40, }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => { Animated.spring(scaleValue, { toValue: scaleTo, friction, useNativeDriver: true, }).start(); };
  const handlePressOut = () => { Animated.spring(scaleValue, { toValue: 1, friction, tension, useNativeDriver: true, }).start(); };
  return (
    <Pressable
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        onPress={onPress}
        style={pressableStyle}
        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false, radius: 30 }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// --- FadeInView Component ---
// ... (your FadeInView component remains unchanged)
interface FadeInViewProps {
    children: React.ReactNode;
    duration?: number;
    delay?: number;
    style?: any;
    yOffset?: number;
}
const FadeInView: React.FC<FadeInViewProps> = ({ children, duration = 400, delay = 0, style, yOffset = 10 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(yOffset)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true, }),
      Animated.timing(translateY, { toValue: 0, duration: duration * 1.2, delay, useNativeDriver: true, }),
    ]).start();
  }, [opacity, translateY, duration, delay, yOffset]);
  return ( <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}> {children} </Animated.View> );
};


const HomeScreen: React.FC = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // ... (your existing state, refs, and other hooks remain unchanged)
  const [elementsVisible, setElementsVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('Map');
  const [searchText, setSearchText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [hasVoicePermission, setHasVoicePermission] = useState<boolean | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(INITIAL_FALLBACK_REGION);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFetchingInitialLocation, setIsFetchingInitialLocation] = useState(true);

  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // ... (all your existing functions: clearVoiceErrorTimeout, setAndClearVoiceError, onSpeechStart, etc. remain unchanged)
  const clearVoiceErrorTimeout = useCallback(() => {
    if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
    }
  }, []);

  const setAndClearVoiceError = useCallback((message: string | null, duration: number = 5000) => {
    setVoiceError(message);
    clearVoiceErrorTimeout();
    if (message) {
      voiceTimeoutRef.current = setTimeout(() => setVoiceError(null), duration);
    }
  }, [clearVoiceErrorTimeout]);

  const onSpeechStart = useCallback((e?: SpeechStartEvent) => { setIsListening(true); setVoiceError(null); }, []);
  const onSpeechEnd = useCallback((e?: SpeechEndEvent) => { setIsListening(false); }, []);
  const onSpeechError = useCallback((e: SpeechErrorEvent) => {
    console.error("Voice Error:", e.error);
    let errorMessage = "Voice recognition error.";
    if (e.error?.message) {
        if (e.error.message.includes("No match")) errorMessage = "Didn't catch that. Try again?";
        else if (e.error.message.includes("permissions")) errorMessage = "Voice permission needed.";
        else if (e.error.message.includes("busy")) errorMessage = "Voice service is busy.";
        else if (e.error.message.includes("unavailable")) errorMessage = "Voice service unavailable.";
    }
    setAndClearVoiceError(errorMessage);
    setIsListening(false);
  }, [setAndClearVoiceError]);


  const handleZoom = useCallback((factor: number) => {
    if (!mapRef.current || !isMapReady) return;
    mapRef.current?.getCamera().then((camera) => {
      if (camera) {
        const newZoom = Math.max(1, Math.min(20, camera.zoom * (factor > 1 ? 1.5 : 0.75)));
        mapRef.current?.animateCamera({ ...camera, zoom: newZoom }, { duration: 400 });
      }
    });
  }, [isMapReady]);

  const fetchAndCenterMapOnUserLocation = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsFetchingInitialLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      if (isInitialLoad) {
        Alert.alert(
          "Location Permission",
          "WanderNav uses your location to center the map. You can grant this in settings.",
          [{ text: "OK" }]
        );
        setMapRegion(INITIAL_FALLBACK_REGION);
      } else {
        setAndClearVoiceError('Location permission needed.');
        Alert.alert("Permission Denied", "Location access is required to center the map.");
      }
      if (isInitialLoad) setIsFetchingInitialLocation(false);
      return;
    }

    try {
      setAndClearVoiceError(null);
      const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Location request timed out")), 8000));
      const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;

      if (location?.coords && mapRef.current && isMapReady) {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: USER_LOCATION_LATITUDE_DELTA,
          longitudeDelta: USER_LOCATION_LONGITUDE_DELTA,
        };
        mapRef.current.animateToRegion(newRegion, 1000);
        setMapRegion(newRegion);
      } else {
        if (!isMapReady && isInitialLoad) console.log("Map not ready yet for animation during initial load.");
        else if (!mapRef.current && isInitialLoad) console.log("Map ref not available yet during initial load.");
        else throw new Error("Failed to get location coordinates or map not ready.");
      }
    } catch (error: any) {
      console.error("Error fetching/centering location:", error);
      if (isInitialLoad) {
         Alert.alert("Location Error", "Could not get your current location. Displaying default map area.");
         setMapRegion(INITIAL_FALLBACK_REGION);
      } else {
        setAndClearVoiceError("Could not get current location.");
        Alert.alert("Error", "Unable to fetch your location.");
      }
    } finally {
      if (isInitialLoad) setIsFetchingInitialLocation(false);
    }
  }, [isMapReady, setAndClearVoiceError]);

  const handleDeviceNavigation = useCallback(() => {
    fetchAndCenterMapOnUserLocation(false);
  }, [fetchAndCenterMapOnUserLocation]);


  const handleHazardReport = useCallback(() => router.push('/hazardReportScreen'), [router]);

  const performSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/searchResultsScreen?query=${encodeURIComponent(trimmedQuery)}`);
      Keyboard.dismiss();
    }
  }, [router]);

  const onSpeechResults = useCallback((e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0 && e.value[0]) {
      const recognizedText = e.value[0].toLowerCase().trim();
      setSearchText(e.value[0]);

      if (recognizedText.includes("zoom in")) { handleZoom(1.5); Alert.alert("Voice Command", "Zooming in..."); }
      else if (recognizedText.includes("zoom out")) { handleZoom(0.5); Alert.alert("Voice Command", "Zooming out..."); }
      else if (recognizedText.includes("center map") || recognizedText.includes("show my location")) { handleDeviceNavigation(); }
      else if (recognizedText.includes("report hazard")) { handleHazardReport(); Alert.alert("Voice Command", "Opening hazard report..."); }
      else if (recognizedText.startsWith("search for ") || recognizedText.startsWith("find ")) {
        const query = recognizedText.replace(/^(search for|find)\s*/, '');
        if (query) { setSearchText(query); performSearch(query); Alert.alert("Voice Search", `Searching for: ${query}`);}
      } else {
        performSearch(recognizedText);
      }
    }
    setIsListening(false);
  }, [handleZoom, handleDeviceNavigation, handleHazardReport, performSearch]);

  const onSpeechPartialResults = useCallback((e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setSearchText(e.value[0]);
      }
  }, []);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    return () => {
        Voice.destroy?.().then(Voice.removeAllListeners).catch(err => console.error("Error destroying voice listeners:", err));
        clearVoiceErrorTimeout();
    };
  }, [onSpeechStart, onSpeechEnd, onSpeechError, onSpeechResults, onSpeechPartialResults, clearVoiceErrorTimeout]);

  useFocusEffect(
    useCallback(() => {
      setElementsVisible(true);
      if (isMapReady) {
        fetchAndCenterMapOnUserLocation(true);
      }

      (async () => {
        if (hasVoicePermission === null) {
          const { status } = await Audio.requestPermissionsAsync();
          setHasVoicePermission(status === 'granted');
        }
      })();

      return () => {
        setElementsVisible(false);
        if (isListening) Voice.stop?.().catch(err => console.error("Error stopping voice on blur:", err));
        clearVoiceErrorTimeout();
      };
    }, [isMapReady, hasVoicePermission, fetchAndCenterMapOnUserLocation, isListening, clearVoiceErrorTimeout])
  );

  const onMapReadyCallback = useCallback(() => {
    setIsMapReady(true);
    if (!isFetchingInitialLocation && mapRegion.latitude === INITIAL_FALLBACK_REGION.latitude) {
        fetchAndCenterMapOnUserLocation(true);
    }
  }, [isFetchingInitialLocation, mapRegion, fetchAndCenterMapOnUserLocation]);


  const requestVoicePermissionAndStart = useCallback(async (): Promise<boolean> => {
    let currentPermission = hasVoicePermission;
    if (currentPermission === null || !currentPermission) {
        const { status } = await Audio.requestPermissionsAsync();
        currentPermission = status === 'granted';
        setHasVoicePermission(currentPermission);
    }
    if (!currentPermission) {
        setAndClearVoiceError("Microphone permission needed for voice search.");
        Alert.alert("Permission Denied", "Microphone access is required for voice search. Please enable it in your device settings.");
        return false;
    }
    return true;
  }, [hasVoicePermission, setAndClearVoiceError]);

  const startListening = useCallback(async () => {
    if (isListening) return;
    const hasPermission = await requestVoicePermissionAndStart();
    if (!hasPermission) return;

    setVoiceError(null);
    setSearchText('');
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error("Voice start error:", e);
      setAndClearVoiceError("Could not start voice recognition.");
      setIsListening(false);
    }
  }, [isListening, requestVoicePermissionAndStart, setAndClearVoiceError]);

  const stopListeningUserInitiated = useCallback(async () => {
    if (!isListening) return;
    try {
      await Voice.stop();
    } catch (e) {
      console.error("Voice stop error:", e);
      setAndClearVoiceError("Error stopping voice recognition.");
    } finally {
      setIsListening(false);
    }
  }, [isListening, setAndClearVoiceError]);

  const toggleVoiceSearch = useCallback(() => {
    Keyboard.dismiss();
    if (isListening) {
      stopListeningUserInitiated();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListeningUserInitiated]);

  const clearSearch = () => { setSearchText(''); Keyboard.dismiss(); };
  const navigateToSearchScreen = () => router.push('/searchScreen');

  const onRegionChangeComplete = (newRegion: Region) => {
    // setMapRegion(newRegion);
  };

  const bottomNavItems = [
    { name: 'Map', icon: 'map-outline' as const, type: Ionicons, key: 'map_nav' },
    { name: 'Saved', icon: 'heart-outline' as const, type: Ionicons, key: 'saved_nav' },
    { name: 'Menu', icon: 'menu-outline' as const, type: Ionicons, key: 'menu_nav' },
  ];

  const handleBottomNavPress = (screenName: string) => {
    setActiveBottomTab(screenName);
    Keyboard.dismiss();
    if (screenName === 'Map') { if (router.pathname !== '/' && router.pathname !== '/home') router.replace('/'); }
    else if (screenName === 'Saved') router.push('/savedDestinationsScreen');
    else if (screenName === 'Menu') router.push('/menuScreen');
  };


  return (
    // Wrap your existing content with a React.Fragment or View if needed,
    // and place Stack.Screen at the top level of the returned JSX.
    <>
      <Stack.Screen
        options={{
          headerShown: false, // This will hide the header
          // Alternatively, if you want a different title (e.g., your app name):
          // title: 'WanderNav',
          // Or if you want the header bar but no title text:
          // title: '',
        }}
      />
      <View style={styles.container}>
        <StatusBar barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} backgroundColor={THEME.PRIMARY_BRAND_COLOR} />
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={mapRegion}
          onRegionChangeComplete={onRegionChangeComplete}
          onMapReady={onMapReadyCallback}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          zoomControlEnabled={false}
        />

        {isFetchingInitialLocation && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME.PRIMARY_BRAND_COLOR} />
            <Text style={styles.loadingText}>Finding your location...</Text>
          </View>
        )}

        {elementsVisible && !isFetchingInitialLocation && (
          <>
            <FadeInView delay={100} style={styles.searchAreaWrapper} yOffset={-30}>
              <Pressable style={styles.searchBarContainer} onPress={navigateToSearchScreen} >
                  <Ionicons name="search-outline" size={ICON_SIZE_STANDARD * 0.9} color={THEME.TEXT_PLACEHOLDER} style={styles.searchIcon} />
                  <Text style={styles.searchPlaceholderText} numberOfLines={1}>
                    {searchText ? searchText : "Where to?"}
                  </Text>
                  {searchText ? (
                      <AnimatedPressable onPress={clearSearch} style={styles.clearSearchButton}>
                          <Ionicons name="close-circle" size={ICON_SIZE_STANDARD * 0.9} color={THEME.TEXT_SECONDARY} />
                      </AnimatedPressable>
                  ) : (
                      <AnimatedPressable onPress={toggleVoiceSearch} style={styles.voiceSearchButton}>
                          <MaterialCommunityIcons name={isListening ? "microphone-off" : "microphone-outline"} size={ICON_SIZE_STANDARD} color={isListening ? THEME.ACCENT_COLOR : THEME.PRIMARY_BRAND_COLOR} />
                      </AnimatedPressable>
                  )}
              </Pressable>
              {voiceError && (
                  <View style={styles.voiceStatusContainer}>
                      <Text style={styles.voiceErrorText}>{voiceError}</Text>
                  </View>
              )}
            </FadeInView>

            <View style={styles.rightControlsContainer}>
              {[
                { key: 'ZoomIn', icon: 'add-circle-outline' as const, action: () => handleZoom(1.5), delay: 200, size: ICON_SIZE_LARGE },
                { key: 'ZoomOut', icon: 'remove-circle-outline' as const, action: () => handleZoom(0.5), delay: 250, size: ICON_SIZE_LARGE },
                { key: 'Navigate', icon: 'navigate-circle-outline' as const, action: handleDeviceNavigation, delay: 300, size: ICON_SIZE_LARGE + 2 },
                { key: 'ReportHazard', icon: 'warning-outline' as const, action: handleHazardReport, delay: 350, size: ICON_SIZE_LARGE -2 },
              ].map((item) => (
                <FadeInView key={item.key} delay={item.delay} style={styles.controlButtonWrapper} yOffset={20}>
                  <AnimatedPressable onPress={item.action} style={styles.controlButton}>
                    <Ionicons name={item.icon} size={item.size} color={THEME.PRIMARY_BRAND_COLOR} />
                  </AnimatedPressable>
                </FadeInView>
              ))}
            </View>
          </>
        )}

        {elementsVisible && !isFetchingInitialLocation && (
          <FadeInView delay={300} style={styles.bottomNavWrapper} yOffset={30}>
            <View style={styles.bottomNav}>
              {bottomNavItems.map((item) => {
                const IconComponent = item.type;
                const isActive = activeBottomTab === item.name;
                return (
                  <AnimatedPressable
                      key={item.key}
                      onPress={() => handleBottomNavPress(item.name)}
                      style={styles.bottomNavButtonContainer}
                      pressableStyle={{ flex: 1 }}
                  >
                    <View style={[styles.bottomNavButton, isActive && styles.bottomNavButtonActive]}>
                      <IconComponent
                          name={item.icon}
                          size={ICON_SIZE_STANDARD - (isActive ? 0 : 2)}
                          color={isActive ? THEME.ACCENT_COLOR : THEME.TEXT_SECONDARY}
                      />
                      <Text style={[ styles.bottomNavButtonText, isActive && styles.bottomNavButtonTextActive, ]} >
                        {item.name}
                      </Text>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>
          </FadeInView>
        )}
      </View>
    </>
  );
};

// ... (your styles StyleSheet.create code remains unchanged)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.BACKGROUND_LIGHT, },
  map: { ...StyleSheet.absoluteFillObject, },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
    fontWeight: '500',
  },
  searchAreaWrapper: { position: 'absolute', top: (StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 24)) + 15, left: 15, right: 15, zIndex: 10, alignItems: 'center', },
  searchBarContainer: { backgroundColor: THEME.BACKGROUND_WHITE, borderRadius: 28, paddingVertical: Platform.OS === 'ios' ? 14 : 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', width: '100%', shadowColor: THEME.SHADOW_COLOR, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8, },
  searchIcon: { marginRight: 12, },
  searchPlaceholderText: { flex: 1, fontSize: 16, color: THEME.TEXT_PLACEHOLDER, marginRight: 8, },
  clearSearchButton: { padding: 6, },
  voiceSearchButton: { padding: 6, },
  voiceStatusContainer: { marginTop: 10, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 15, alignSelf: 'center', },
  voiceErrorText: { color: THEME.ERROR_COLOR, fontSize: 13, textAlign: 'center', fontWeight: '500', },
  rightControlsContainer: { position: 'absolute', top: (StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 24)) + 15 + 65 + 20, right: 15, alignItems: 'center', zIndex: 10, },
  controlButtonWrapper: { marginBottom: 15, },
  controlButton: { backgroundColor: THEME.MAP_CONTROL_BACKGROUND, width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.SHADOW_COLOR, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 6, },
  bottomNavWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, },
  bottomNav: { flexDirection: 'row', backgroundColor: THEME.BACKGROUND_WHITE, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 10, minHeight: Platform.OS === 'ios' ? 85 : 65, shadowColor: THEME.SHADOW_COLOR, shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10, alignItems: 'flex-start', },
  bottomNavButtonContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomNavButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 5, borderRadius: 18, width: '80%', maxWidth: 100, },
  bottomNavButtonActive: { backgroundColor: THEME.PRIMARY_BRAND_COLOR + '20', },
  bottomNavButtonText: { fontSize: 11, color: THEME.TEXT_SECONDARY, marginTop: 4, fontWeight: '500', },
  bottomNavButtonTextActive: { color: THEME.ACCENT_COLOR, fontWeight: '700', },
});

export default HomeScreen;