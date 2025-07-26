import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
  Keyboard,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME, addAlpha } from '../constants/theme'; // Ensure this path is correct
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { searchApiService } from '../src/services/api';

// ... (Keep your AnimatedPressable and FadeInView components as they are) ...
const AnimatedPressable = ({ onPress, style, children, pressableStyle, scaleTo = 0.97, feedbackType = 'scale', androidRippleColor = addAlpha(THEME.TEXT_PRIMARY, 0.05), }: { onPress?: () => void; style?: any; children: React.ReactNode; pressableStyle?: any; scaleTo?: number; feedbackType?: 'scale' | 'opacity'; androidRippleColor?: string; }) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = React.useState(false);
  
  const handlePressIn = () => {
    if (!isPressed) {
      setIsPressed(true);
      Animated.spring(animatedValue, { toValue: scaleTo, useNativeDriver: true, friction: 7 }).start();
    }
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(animatedValue, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  };
  
  const handlePress = () => {
    if (onPress && !isPressed) {
      onPress();
    }
  };
  
  const animatedStyle = feedbackType === 'opacity' ? { opacity: animatedValue } : { transform: [{ scale: animatedValue }] };
  
  return (
    <Pressable 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={handlePress} 
      style={pressableStyle} 
      android_ripple={{ color: androidRippleColor }}
      disabled={isPressed}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

interface FadeInViewProps { children: React.ReactNode; duration?: number; delay?: number; style?: any; translateYValue?: number; }
const FadeInView: React.FC<FadeInViewProps> = ({ children, duration = 300, delay = 0, style, translateYValue = 15 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYValue)).current;
  useEffect(() => { Animated.parallel([ Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }), Animated.spring(translateY, { toValue: 0, friction: 7, tension: 60, delay, useNativeDriver: true }) ]).start(); }, [opacity, translateY, duration, delay]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
};


const SEARCH_TABS = [
  { id: 'places', label: 'Places', icon: 'map-search-outline' },
  { id: 'users', label: 'Users', icon: 'account-search-outline' },
  { id: 'hazards', label: 'Hazards', icon: 'alert-circle-outline' },
] as const;

type SearchTabId = typeof SEARCH_TABS[number]['id'];

interface PlaceResult { type: 'place'; id: string; name: string; address: string; lat?: number; lng?: number; }
interface UserResult { type: 'user'; id: string; name: string; username: string; avatar?: string;}
interface HazardResult { type: 'hazard'; id: string; category: string; description: string; date: string; icon?: string }
type SearchResultItem = PlaceResult | UserResult | HazardResult;

interface LocationPoint { latitude: number; longitude: number; name: string; address?: string; }
const CURRENT_LOCATION_TEXT = "Your Current Location";

const SearchScreen = () => {
  const router = useRouter();

  // Ensure activeTab defaults to 'places'
  const [activeTab, setActiveTab] = useState<SearchTabId>('places');

  const [startLocationQuery, setStartLocationQuery] = useState(CURRENT_LOCATION_TEXT);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [generalSearchQuery, setGeneralSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Add search lock

  const [selectedStartPoint, setSelectedStartPoint] = useState<LocationPoint | null>(null);
  const [selectedDestinationPoint, setSelectedDestinationPoint] = useState<LocationPoint | null>(null);

  type ActiveSearchInputType = 'start' | 'destination' | 'general';
  // Default activeSearchInput based on the initial activeTab
  const [activeSearchInput, setActiveSearchInput] = useState<ActiveSearchInputType>('start');


  const startInputRef = useRef<TextInput>(null);
  const destinationInputRef = useRef<TextInput>(null);
  const generalInputRef = useRef<TextInput>(null);

  // --- Initial Focus Logic ---
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure layout is complete, especially for Android
      const focusTimeout = setTimeout(() => {
        if (activeTab === 'places') {
          if (!selectedStartPoint && startLocationQuery === CURRENT_LOCATION_TEXT) {
            startInputRef.current?.focus();
            setActiveSearchInput('start');
          } else if (selectedStartPoint && !selectedDestinationPoint) {
            destinationInputRef.current?.focus();
            setActiveSearchInput('destination');
          } else if (!selectedStartPoint) { // Fallback if current location fetch failed or was cleared
            startInputRef.current?.focus();
            setActiveSearchInput('start');
          } else { // Both selected or other states, focus start or as preferred
             destinationInputRef.current?.focus(); // Or startInputRef
             setActiveSearchInput('destination'); // Or 'start'
          }
        } else { // Users or Hazards tab
          generalInputRef.current?.focus();
          setActiveSearchInput('general');
        }
      }, Platform.OS === 'ios' ? 100 : 250); // Adjust delay if needed

      return () => clearTimeout(focusTimeout);
    }, [activeTab, selectedStartPoint, selectedDestinationPoint, startLocationQuery])
  );


  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- Effect to fetch current location for default start ---
  useEffect(() => {
    if (activeTab === 'places' && startLocationQuery === CURRENT_LOCATION_TEXT && !selectedStartPoint) {
      setIsLoading(true);
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Needed", "Location permission is required. Please search manually or enable permissions in settings.");
          setStartLocationQuery('');
          setIsLoading(false);
          setActiveSearchInput('start'); // Ensure focus can go to start input
          startInputRef.current?.focus();
          return;
        }
        try {
          const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Location request timed out")), 7000));
          const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;

          setSelectedStartPoint({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            name: CURRENT_LOCATION_TEXT,
            address: `Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`
          });
          // Do not clear loading here if search will trigger
        } catch (error: any) {
          console.error('Error fetching current location:', error.message);
          Alert.alert("Location Error", "Could not fetch current location. Please type your start location.");
          setStartLocationQuery('');
          setActiveSearchInput('start');
          startInputRef.current?.focus();
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [activeTab, startLocationQuery]); // Removed selectedStartPoint as direct dep for initial fetch

  // --- Perform Search (Real API) ---
  const performSearch = useCallback(async (query: string, searchContext: ActiveSearchInputType) => {
    // Prevent multiple simultaneous searches
    if (isSearching) return;
    
    if (!query.trim() || (searchContext === 'start' && query === CURRENT_LOCATION_TEXT && selectedStartPoint)) {
      setSearchResults([]);
      setShowNoResults(false);
      setIsLoading(false);
      return;
    }

    setIsSearching(true);
    setIsLoading(true);
    setShowNoResults(false);
    if (!hasSearchedOnce) setHasSearchedOnce(true);

    try {
      console.log(`Searching: "${query}" (context: ${searchContext}, tab: ${activeTab})`);
      
      // Call the real backend API
      const searchParams = {
        query: query.trim(),
        type: activeTab as 'places' | 'users' | 'hazards'
      };

      const results = await searchApiService.performSearch(searchParams);
      
      // Convert backend results to frontend format
      const convertedResults: SearchResultItem[] = results.map((item, index) => {
        if (activeTab === 'places') {
          return {
            type: 'place',
            id: item.id,
            name: item.name,
            address: item.description || 'No address available',
            lat: item.latitude,
            lng: item.longitude
          };
        } else if (activeTab === 'users') {
          return {
            type: 'user',
            id: item.id,
            name: item.name,
            username: item.username || item.name.toLowerCase().replace(/\s+/g, '_'),
            avatar: `https://i.pravatar.cc/80?u=${item.id}`
          };
        } else { // hazards
          return {
            type: 'hazard',
            id: item.id,
            category: item.hazardType || 'Report',
            description: item.description || `Hazard near ${item.name}`,
            date: new Date().toISOString().split('T')[0],
            icon: 'alert-outline'
          };
        }
      });

      console.log('Search results converted:', convertedResults);
      setSearchResults(convertedResults);
      setShowNoResults(convertedResults.length === 0 && query.trim().length > 0);
      setIsLoading(false); // Stop loading when results are set
      
    } catch (error) {
      console.error('Search API error:', error);
      
      // Fallback to mock data if API fails
      let fallbackResults: SearchResultItem[] = [];
      
      if (activeTab === 'places') {
        if (query.toLowerCase().includes('park')) {
          fallbackResults = [
            { type: 'place', id: 'p1', name: `${query} Central Park`, address: '123 Main St', lat: 34.0522, lng: -118.2437 },
            { type: 'place', id: 'p2', name: `Community ${query}side`, address: '456 Oak Ave', lat: 34.0550, lng: -118.2500 }
          ];
        } else if (query.toLowerCase().includes('coffee')) {
          fallbackResults = [{ type: 'place', id: 'p3', name: `The ${query} Spot`, address: '789 Pine Ln', lat: 34.0500, lng: -118.2400 }];
        } else if (query.length > 1) {
          fallbackResults = [{ type: 'place', id: 'p-generic-' + query, name: `Place for ${query}`, address: 'Some Address', lat: 34.0511, lng: -118.2411 }];
        }
      } else if (activeTab === 'users') {
        fallbackResults = query.length > 1 ? [{ type: 'user', id: 'u-' + query, name: `${query} User`, username: `${query.toLowerCase()}_tag`, avatar: `https://i.pravatar.cc/80?u=${query}` }] : [];
      } else if (activeTab === 'hazards') {
        fallbackResults = query.length > 1 ? [{ type: 'hazard', id: 'h-' + query, category: 'Report', description: `Hazard near ${query}`, date: '2024-01-15', icon: 'alert-outline' }] : [];
      }
      
      setSearchResults(fallbackResults);
      setShowNoResults(fallbackResults.length === 0 && query.trim().length > 0);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [activeTab, selectedStartPoint, hasSearchedOnce, isSearching]);

  // --- Debounce Search ---
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    let currentQuery = '';
    let currentSearchContext = activeSearchInput;

    if (activeTab === 'places') {
      currentQuery = activeSearchInput === 'start' ? startLocationQuery : destinationQuery;
    } else {
      currentQuery = generalSearchQuery;
      currentSearchContext = 'general';
    }

    // Don't search if query is empty or if it's current location and already selected
    if (!currentQuery.trim() || (activeTab === 'places' && activeSearchInput === 'start' && currentQuery === CURRENT_LOCATION_TEXT && selectedStartPoint)) {
      setSearchResults([]);
      setShowNoResults(false);
      setIsLoading(false);
      return;
    }

    // Only search if query has at least 2 characters
    if (currentQuery.trim().length < 2) {
      setSearchResults([]);
      setShowNoResults(false);
      setIsLoading(false);
      return;
    }

    // Set loading state immediately
    setIsLoading(true);
    setShowNoResults(false);

    // Debounce the search with a longer delay
    debounceTimeout.current = setTimeout(() => {
      performSearch(currentQuery, currentSearchContext);
    }, 800); // Increased debounce delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [activeTab, startLocationQuery, destinationQuery, generalSearchQuery, activeSearchInput, selectedStartPoint, performSearch]);


  const handleTabChange = (tabId: SearchTabId) => {
    setActiveTab(tabId);
    setSearchResults([]);
    setShowNoResults(false);
    setHasSearchedOnce(false);
    setIsLoading(false); // Reset loading

    // Reset queries, but preserve startLocationQuery if it's current location and point is selected
    if (!(tabId === 'places' && startLocationQuery === CURRENT_LOCATION_TEXT && selectedStartPoint)) {
        if(startLocationQuery !== CURRENT_LOCATION_TEXT && tabId === 'places') {
             // If switching to places and start wasn't current, reset it
        } else if (tabId !== 'places') {
            // No specific reset for startLocationQuery if not switching to places
            // or if it was current location. The default useEffect will handle it.
        }
    }
    setDestinationQuery('');
    // setSelectedDestinationPoint(null); // Keep destination if user might switch back quickly? Or clear. Let's clear for now.
    setSelectedDestinationPoint(null);
    setGeneralSearchQuery('');


    if (tabId === 'places') {
        // If start point is current location and selected, focus destination
        if (selectedStartPoint && startLocationQuery === CURRENT_LOCATION_TEXT) {
            setActiveSearchInput('destination');
            // destinationInputRef.current?.focus(); // Focus handled by useFocusEffect
        } else {
            setActiveSearchInput('start'); // Default to start input
            // startInputRef.current?.focus(); // Focus handled by useFocusEffect
        }
    } else {
      setActiveSearchInput('general');
      // generalInputRef.current?.focus(); // Focus handled by useFocusEffect
    }
  };

  const handleClearInput = (inputType: ActiveSearchInputType) => {
    setSearchResults([]);
    setShowNoResults(false);
    setHasSearchedOnce(true); // Treat clear as a search action for UI state
    setIsLoading(false);

    if (inputType === 'start') {
      setStartLocationQuery('');
      setSelectedStartPoint(null);
      startInputRef.current?.focus();
    } else if (inputType === 'destination') {
      setDestinationQuery('');
      setSelectedDestinationPoint(null);
      destinationInputRef.current?.focus();
    } else if (inputType === 'general') {
      setGeneralSearchQuery('');
      generalInputRef.current?.focus();
    }
  };

  const onSearchResultPress = (item: SearchResultItem) => {
    // Prevent multiple rapid presses
    if (isLoading) return;
    
    Keyboard.dismiss();
    
    // Use setTimeout to ensure state updates are processed properly
    setTimeout(() => {
      if (item.type === 'place' && activeTab === 'places') {
        const placeItem = item as PlaceResult;
        if (!placeItem.lat || !placeItem.lng) {
          Alert.alert("Location Data Missing", "This place doesn't have coordinates.");
          return;
        }
        
        const locationPoint: LocationPoint = { 
          latitude: placeItem.lat, 
          longitude: placeItem.lng, 
          name: placeItem.name, 
          address: placeItem.address 
        };

        if (activeSearchInput === 'start') {
          setSelectedStartPoint(locationPoint);
          setStartLocationQuery(placeItem.name);
          setActiveSearchInput('destination');
          console.log("Start point selected:", locationPoint);
        } else { // 'destination'
          setSelectedDestinationPoint(locationPoint);
          setDestinationQuery(placeItem.name);
          console.log("Destination point selected:", locationPoint);
          if(selectedStartPoint) {
            console.log("Both points selected, ready for directions.");
          }
        }
        setSearchResults([]); // Clear results after selection
      } else if (item.type === 'user') {
        router.push(`/userProfile/${item.id}`);
      } else if (item.type === 'hazard') {
        router.push(`/hazardDetails/${item.id}`);
      }
    }, 100); // Small delay to ensure smooth state transitions
  };

  const handleGetDirections = () => {
    // Prevent multiple rapid presses
    if (isLoading) return;
    
    if (!selectedStartPoint) {
      Alert.alert("Start Location Needed", "Please select a starting point.", [{ 
        text: "OK", 
        onPress: () => { 
          setActiveSearchInput('start'); 
          startInputRef.current?.focus(); 
        }
      }]);
      return;
    }
    if (!selectedDestinationPoint) {
      Alert.alert("Destination Needed", "Please select a destination point.", [{ 
        text: "OK", 
        onPress: () => {
          setActiveSearchInput('destination'); 
          destinationInputRef.current?.focus(); 
        }
      }]);
      return;
    }
    
    console.log("Routing from:", selectedStartPoint.name, "to:", selectedDestinationPoint.name);
    
    // Set loading to prevent multiple presses
    setIsLoading(true);
    
    // Use setTimeout to ensure smooth navigation
    setTimeout(() => {
      router.push({
        pathname: '/map',
        params: {
          startLat: selectedStartPoint.latitude, 
          startLng: selectedStartPoint.longitude, 
          startName: selectedStartPoint.name,
          destLat: selectedDestinationPoint.latitude, 
          destLng: selectedDestinationPoint.longitude, 
          destName: selectedDestinationPoint.name,
        }
      });
      setIsLoading(false);
    }, 150);
  };

  const renderResultItem = ({ item }: { item: SearchResultItem }) => {
    const commonPressableStyle = styles.resultItemPressable;
    const commonItemStyle = styles.resultItem;
    let onPressAction = () => onSearchResultPress(item);
    let iconName: any = "map-marker-outline"; // Default for place
    let iconColor = THEME.ACCENT_COLOR;
    let iconBgColor = addAlpha(THEME.ACCENT_COLOR, 0.1);

    switch (item.type) {
      case 'user':
        iconName = "account-circle-outline";
        iconColor = THEME.PRIMARY_BRAND_COLOR; // Ensure this is in your theme
        iconBgColor = addAlpha(THEME.PRIMARY_BRAND_COLOR, 0.1);
        break;
      case 'hazard':
        iconName = (item.icon as any) || 'alert-circle-outline';
        iconColor = THEME.ERROR_COLOR; // Ensure this is in your theme
        iconBgColor = addAlpha(THEME.ERROR_COLOR, 0.1);
        break;
      case 'place':
        // Defaults are fine
        break;
    }

    return (
      <FadeInView delay={50} duration={200}>
        <AnimatedPressable pressableStyle={commonPressableStyle} style={commonItemStyle} onPress={onPressAction}>
          {item.type === 'user' && item.avatar ? ( <Image source={{ uri: item.avatar }} style={styles.resultItemAvatar} /> ) : (
            <View style={[styles.resultItemIconContainer, { backgroundColor: iconBgColor }]}>
              <MaterialCommunityIcons name={iconName} size={26} color={iconColor} />
            </View>
          )}
          <View style={styles.resultItemTextContainer}>
            <Text style={styles.resultItemTitle} numberOfLines={1}> {item.type === 'hazard' ? `${item.category} - ${item.date}` : item.name} </Text>
            <Text style={styles.resultItemSubtitle} numberOfLines={item.type === 'hazard' ? 2 : 1}>
                {item.type === 'place' ? item.address : item.type === 'user' ? `@${item.username}` : item.type === 'hazard' ? item.description : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={THEME.TEXT_TERTIARY} />
        </AnimatedPressable>
      </FadeInView>
    );
  };

  let displayedQueryForNoResults = '';
  if (activeTab === 'places') {
    displayedQueryForNoResults = activeSearchInput === 'start' ? startLocationQuery : destinationQuery;
  } else {
    displayedQueryForNoResults = generalSearchQuery;
  }

  // Debugging log
  // console.log("Rendering SearchScreen. Active Tab:", activeTab, "Active Input:", activeSearchInput);
  // console.log("Start Query:", startLocationQuery, "Selected Start:", !!selectedStartPoint);
  // console.log("Dest Query:", destinationQuery, "Selected Dest:", !!selectedDestinationPoint);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: THEME.BACKGROUND_PRIMARY }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? (Dimensions.get('window').height > 800 ? 90 : 70) : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.searchHeader}>
        {/* --- Places Tab Inputs --- */}
        {activeTab === 'places' && (
          <>
            <FadeInView delay={50} translateYValue={10} style={styles.searchContainerOuter}>
              <View style={[styles.searchContainerInner, activeSearchInput === 'start' && styles.activeInputHighlight]}>
                <MaterialCommunityIcons
                  name="ray-start-arrow"
                  size={22}
                  color={(selectedStartPoint && startLocationQuery === selectedStartPoint.name && startLocationQuery !== CURRENT_LOCATION_TEXT) || (selectedStartPoint && startLocationQuery === CURRENT_LOCATION_TEXT) ? THEME.ACCENT_COLOR : THEME.TEXT_TERTIARY}
                  style={styles.searchIcon} />
                <TextInput
                  ref={startInputRef}
                  style={styles.searchInput}
                  placeholder="Start location"
                  placeholderTextColor={THEME.TEXT_TERTIARY}
                  value={startLocationQuery}
                  onChangeText={(text) => {
                      setStartLocationQuery(text);
                      if (text !== CURRENT_LOCATION_TEXT && selectedStartPoint?.name === CURRENT_LOCATION_TEXT) {
                          setSelectedStartPoint(null); // Clear selected current location if user types something else
                      }
                      if (text.trim() === '') { // If user clears input, reset selected point
                          setSelectedStartPoint(null);
                      }
                  }}
                  onFocus={() => setActiveSearchInput('start')}
                  returnKeyType="next"
                  autoCapitalize="words"
                  autoCorrect={false}
                  clearButtonMode={Platform.OS === 'ios' && startLocationQuery !== CURRENT_LOCATION_TEXT ? 'while-editing' : 'never'}
                  onSubmitEditing={() => { setActiveSearchInput('destination'); destinationInputRef.current?.focus(); }}
                />
                {startLocationQuery.length > 0 && startLocationQuery !== CURRENT_LOCATION_TEXT && Platform.OS === 'android' && (
                  <TouchableOpacity onPress={() => handleClearInput('start')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={22} color={THEME.TEXT_TERTIARY} />
                  </TouchableOpacity>
                )}
              </View>
            </FadeInView>

            <FadeInView delay={100} translateYValue={10} style={[styles.searchContainerOuter, { marginTop: 10 }]}>
              <View style={[styles.searchContainerInner, activeSearchInput === 'destination' && styles.activeInputHighlight]}>
                <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={22}
                    color={selectedDestinationPoint ? THEME.ACCENT_COLOR : THEME.TEXT_TERTIARY}
                    style={styles.searchIcon} />
                <TextInput
                  ref={destinationInputRef}
                  style={styles.searchInput}
                  placeholder="Where to? (Destination)"
                  placeholderTextColor={THEME.TEXT_TERTIARY}
                  value={destinationQuery}
                  onChangeText={(text) => {
                      setDestinationQuery(text);
                      if (text.trim() === '') { // If user clears input, reset selected point
                          setSelectedDestinationPoint(null);
                      }
                  }}
                  onFocus={() => setActiveSearchInput('destination')}
                  returnKeyType="search"
                  autoCapitalize="words"
                  autoCorrect={false}
                  clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                  onSubmitEditing={handleGetDirections}
                />
                {destinationQuery.length > 0 && Platform.OS === 'android' && (
                  <TouchableOpacity onPress={() => handleClearInput('destination')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={22} color={THEME.TEXT_TERTIARY} />
                  </TouchableOpacity>
                )}
              </View>
            </FadeInView>
          </>
        )}

        {/* --- Users/Hazards Tab Input --- */}
        {activeTab !== 'places' && (
          <FadeInView delay={50} translateYValue={10} style={styles.searchContainerOuter}>
            <View style={[styles.searchContainerInner, styles.activeInputHighlight]}>
              <MaterialCommunityIcons name="magnify" size={22} color={THEME.TEXT_TERTIARY} style={styles.searchIcon} />
              <TextInput
                ref={generalInputRef}
                style={styles.searchInput}
                placeholder={`Search ${activeTab}...`}
                placeholderTextColor={THEME.TEXT_TERTIARY}
                value={generalSearchQuery}
                onChangeText={setGeneralSearchQuery}
                onFocus={() => setActiveSearchInput('general')}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                 onSubmitEditing={() => performSearch(generalSearchQuery, 'general')}
              />
              {generalSearchQuery.length > 0 && Platform.OS === 'android' && (
                <TouchableOpacity onPress={() => handleClearInput('general')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={22} color={THEME.TEXT_TERTIARY} />
                </TouchableOpacity>
              )}
            </View>
          </FadeInView>
        )}

        {/* --- Tabs --- */}
        <FadeInView delay={activeTab === 'places' ? 150 : 100} translateYValue={10} style={styles.tabsOuterContainer}>
          <View style={styles.tabsInnerContainer}>
            {SEARCH_TABS.map(tab => (
              <TouchableOpacity key={tab.id} style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]} onPress={() => handleTabChange(tab.id)} activeOpacity={0.7} >
                <MaterialCommunityIcons name={tab.icon as any} size={activeTab === tab.id ? 22 : 20} color={activeTab === tab.id ? THEME.ACCENT_COLOR : THEME.TEXT_SECONDARY} />
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeInView>
      </View>

      {/* --- Get Directions Button --- */}
      {activeTab === 'places' && selectedStartPoint && selectedDestinationPoint && !isLoading && (
        <View style={styles.getDirectionsButtonContainer}>
          <AnimatedPressable style={styles.getDirectionsButton} onPress={handleGetDirections} pressableStyle={{ width: '100%' }}>
            <MaterialCommunityIcons name="directions" size={24} color={THEME.TEXT_ON_ACCENT_COLOR} />
            <Text style={styles.getDirectionsButtonText}>Get Directions</Text>
          </AnimatedPressable>
        </View>
      )}
      
      {/* Debug info */}
      {__DEV__ && (
        <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text>Debug: activeTab={activeTab}, start={!!selectedStartPoint}, dest={!!selectedDestinationPoint}, loading={isLoading}</Text>
        </View>
      )}

      {/* --- Loading Indicator --- */}
      {isLoading && searchResults.length === 0 && (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={THEME.ACCENT_COLOR} />
          <Text style={styles.messageText}>
            {activeTab === 'places' && activeSearchInput === 'start' && startLocationQuery === CURRENT_LOCATION_TEXT && !selectedStartPoint
              ? "Finding current location..."
              : "Searching..."}
          </Text>
        </View>
      )}

      {/* --- Search Results List --- */}
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.type + '-' + item.id}
            contentContainerStyle={styles.resultsListContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* --- No Results Message --- */}
      {!isLoading && searchResults.length === 0 && hasSearchedOnce && (
        <FadeInView delay={100} style={styles.centeredMessageContainer}>
          <MaterialCommunityIcons name="magnify-scan" size={60} color={THEME.TEXT_TERTIARY} style={styles.messageIcon}/>
          <Text style={styles.messageTitle}>No Results</Text>
          <Text style={styles.messageText}>Couldn't find anything for "{displayedQueryForNoResults}". Try a different search?</Text>
        </FadeInView>
      )}

      {/* --- Initial "Empty State" Message --- */}
      {!isLoading && searchResults.length === 0 && !hasSearchedOnce && (
        <FadeInView delay={activeTab === 'places' ? 250 : 200} style={styles.centeredMessageContainer}>
          {activeTab === 'places' ? (
            <>
              <MaterialCommunityIcons name="routes" size={60} color={THEME.TEXT_TERTIARY} style={styles.messageIcon}/>
              <Text style={styles.messageTitle}>Plan Your Journey</Text>
              <Text style={styles.messageText}>Search for a starting point (or use current location) and then your destination.</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name={activeTab === 'users' ? "account-group-outline" : "alert-decagram-outline"} size={60} color={THEME.TEXT_TERTIARY} style={styles.messageIcon}/>
              <Text style={styles.messageTitle}>What are you looking for?</Text>
              <Text style={styles.messageText}>{activeTab === 'users' ? 'Search for users by name or username.' : 'Search for reported hazards.'}</Text>
            </>
          )}
          <TouchableOpacity style={styles.exploreButton} onPress={() => {
            if (activeTab === 'places') {
              activeSearchInput === 'start' ? startInputRef.current?.focus() : destinationInputRef.current?.focus();
            } else {
              generalInputRef.current?.focus();
            }
          }}>
            <Text style={styles.exploreButtonText}>Start Searching</Text>
          </TouchableOpacity>
        </FadeInView>
      )}
    </KeyboardAvoidingView>
  );
};

// --- Styles (Should be the same as previously provided) ---
const styles = StyleSheet.create({
  searchHeader: {
    paddingTop: Platform.OS === 'ios' ? (Dimensions.get('window').height > 800 ? 55 : 40) : 20, // SafeArea
    paddingHorizontal: 15,
    paddingBottom: 12,
    backgroundColor: THEME.BACKGROUND_SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME.BORDER_COLOR_LIGHT,
    zIndex: 10, // Keep header above content
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainerOuter: {
    // No specific styles needed, margin is applied directly or by parent
  },
  searchContainerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.BACKGROUND_SECONDARY,
    borderRadius: THEME.BORDER_RADIUS_LARGE,
    paddingHorizontal: 12, // Reduced slightly
    height: 48, // Slightly reduced height
  },
  searchIcon: {
    marginRight: 8, // Reduced slightly
  },
  searchInput: {
    flex: 1,
    fontSize: 15, // Slightly reduced
    color: THEME.TEXT_PRIMARY,
    height: '100%',
  },
  clearButton: {
    padding: 5, // Adjusted padding
    marginLeft: 5,
  },
  activeInputHighlight: {
    borderColor: THEME.ACCENT_COLOR,
    borderWidth: 1.5,
    // Removed shadow from active input for cleaner look, header has shadow
  },
  tabsOuterContainer: {
    marginTop: 15,
  },
  tabsInnerContainer: {
    flexDirection: 'row',
    // backgroundColor: THEME.BACKGROUND_SECONDARY, // Optional: if you want a bg for the tab bar itself
    // borderRadius: THEME.BORDER_RADIUS_MEDIUM,
    // padding: 4, // If using a background for the tab bar
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5, // Adjusted
        borderRadius: THEME.BORDER_RADIUS_MEDIUM,
        marginHorizontal: 3, // Adjusted
        borderWidth: 1.5,
        borderColor: 'transparent',
      },
      tabButtonActive: {
        backgroundColor: addAlpha(THEME.ACCENT_COLOR, 0.1),
        borderColor: THEME.ACCENT_COLOR,
      },
      tabText: {
        marginLeft: 6, // Adjusted
        fontSize: 13, // Adjusted
        color: THEME.TEXT_SECONDARY,
        fontWeight: '500',
      },
      tabTextActive: {
        color: THEME.ACCENT_COLOR,
        fontWeight: '600', // Slightly bolder
      },
      resultsListContainer: {
        paddingHorizontal: 15,
        paddingTop: 15,
        // paddingBottom is dynamically adjusted if getDirections button is visible
      },
      resultItemPressable: { // This is the style for the Pressable container
        marginBottom: 12,
      },
      resultItem: { // This is the style for the Animated.View inside Pressable
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.BACKGROUND_SURFACE,
        padding: 12, // Adjusted
        borderRadius: THEME.BORDER_RADIUS_LARGE,
        shadowColor: THEME.SHADOW_COLOR,
        shadowOffset: { width: 0, height: 2 }, // Reduced shadow
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2, // Reduced elevation
        borderWidth: 1,
        borderColor: THEME.BORDER_COLOR_LIGHT,
      },
      resultItemIconContainer: {
        width: 44, // Adjusted
        height: 44, // Adjusted
        borderRadius: THEME.BORDER_RADIUS_CIRCLE, // e.g. 22
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12, // Adjusted
      },
      resultItemAvatar: {
        width: 44, // Adjusted
        height: 44, // Adjusted
        borderRadius: THEME.BORDER_RADIUS_CIRCLE,
        marginRight: 12, // Adjusted
        backgroundColor: THEME.BORDER_COLOR,
      },
      resultItemTextContainer: {
        flex: 1,
      },
      resultItemTitle: {
        fontSize: 16, // Adjusted
        fontWeight: '600',
        color: THEME.TEXT_PRIMARY,
        marginBottom: 1, // Adjusted
      },
      resultItemSubtitle: {
        fontSize: 13, // Adjusted
        color: THEME.TEXT_SECONDARY,
        lineHeight: 17, // Adjusted
      },
      centeredMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 60, // Ensure enough space at the bottom
        backgroundColor: THEME.BACKGROUND_PRIMARY,
      },
      messageIcon: {
        marginBottom: 20, // Adjusted
        opacity: 0.7,
      },
      messageTitle: {
        fontSize: 20, // Adjusted
        fontWeight: 'bold',
        color: THEME.TEXT_PRIMARY,
        textAlign: 'center',
        marginBottom: 8, // Adjusted
      },
      messageText: {
        fontSize: 15, // Adjusted
        color: THEME.TEXT_SECONDARY,
        textAlign: 'center',
        lineHeight: 21, // Adjusted
      },
      exploreButton: {
        marginTop: 20, // Adjusted
        backgroundColor: THEME.ACCENT_COLOR,
        paddingVertical: 10, // Adjusted
        paddingHorizontal: 25, // Adjusted
        borderRadius: THEME.BORDER_RADIUS_XLARGE, // e.g. 50
        shadowColor: THEME.ACCENT_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      exploreButtonText: {
        color: THEME.TEXT_ON_ACCENT_COLOR,
        fontSize: 15, // Adjusted
        fontWeight: '600',
      },
      getDirectionsButtonContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10, // More padding for home indicator
        backgroundColor: THEME.BACKGROUND_SURFACE,
        borderTopWidth: 1,
        borderTopColor: THEME.BORDER_COLOR_LIGHT,
        // No absolute positioning, it will just appear below the tabs/header
        zIndex: 5,
      },
      getDirectionsButton: {
        backgroundColor: THEME.ACCENT_COLOR,
        paddingVertical: 12, // Adjusted
        paddingHorizontal: 20,
        borderRadius: THEME.BORDER_RADIUS_LARGE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: THEME.ACCENT_COLOR,
        shadowOffset: { width: 0, height: 3 }, // Adjusted
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3, // Adjusted
      },
      getDirectionsButtonText: {
        color: THEME.TEXT_ON_ACCENT_COLOR,
        fontSize: 16, // Adjusted
        fontWeight: 'bold',
        marginLeft: 8, // Adjusted
      },
      resultsContainer: {
        flex: 1, // Ensure it takes full height
      },
    });

    export default SearchScreen;