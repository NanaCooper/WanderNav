import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useSavedDestinations, Destination, PredefinedPlace } from '../contexts/SavedDestinationsContext';
import { THEME } from '../constants/theme'; // Assuming your theme file

// --- Constants ---
const ICON_SIZE_QUICK_ACCESS = 28; // Slightly larger for impact
const ICON_SIZE_DESTINATION_ITEM = 24;
const QUICK_ACCESS_COLUMNS = 3; // Or 4 if icons are smaller / names shorter

// --- Reusable Animated Pressable (Enhanced for different feedback) ---
const AnimatedPressable = ({
  onPress,
  style,
  children,
  pressableStyle,
  scaleTo = 0.96, // Default scale
  opacityTo = 0.7, // Default opacity feedback
  feedbackType = 'scale', // 'scale' or 'opacity' or 'both'
}: {
  onPress?: () => void;
  style?: any;
  children: React.ReactNode;
  pressableStyle?: any;
  scaleTo?: number;
  opacityTo?: number;
  feedbackType?: 'scale' | 'opacity' | 'both';
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: feedbackType === 'opacity' ? opacityTo : scaleTo,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const animatedStyle =
    feedbackType === 'opacity'
      ? { opacity: animatedValue }
      : feedbackType === 'scale'
      ? { transform: [{ scale: animatedValue }] }
      : { transform: [{ scale: animatedValue }], opacity: animatedValue };


  return (
    <Pressable
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress}
      style={pressableStyle}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};


const SavedDestinationsScreen = () => {
  const router = useRouter();
  const { savedDestinations, predefinedPlaces } = useSavedDestinations();

  const handlePredefinedPlacePress = (place: PredefinedPlace) => {
    console.log(`Selected predefined place: ${place.name}`);
    // router.push({ pathname: '/searchScreen', params: { destination: place.name, lat: place.lat, lon: place.lon } });
  };

  const handleAddNewQuickAccess = () => {
    console.log('Add new quick access pressed');
    // router.push('/manageQuickAccessScreen');
  };

  const handleDestinationPress = (destination: Destination) => {
    console.log('Selected destination:', destination.name);
    // router.push({ pathname: '/mapScreen', params: { destinationId: destination.id } });
  };

  const renderPredefinedPlace = ({ item, index }: { item: PredefinedPlace, index: number }) => {
    const IconComponent =
      item.iconType === 'Ionicons' ? Ionicons :
      item.iconType === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
      MaterialIcons; // Default

    const isAddButton = item.id === 'add_new';
    const iconColor = isAddButton ? THEME.ACCENT_COLOR : THEME.PRIMARY_BRAND_COLOR;
    const textColor = isAddButton ? THEME.ACCENT_COLOR : THEME.TEXT_SECONDARY;

    return (
      <AnimatedPressable
        pressableStyle={[
          styles.predefinedPlaceWrapper,
          // Add right margin to all but the last item in a row
          (index + 1) % QUICK_ACCESS_COLUMNS !== 0 && styles.predefinedPlaceWrapperMargin,
        ]}
        onPress={() => isAddButton ? handleAddNewQuickAccess() : handlePredefinedPlacePress(item)}
        feedbackType="opacity"
      >
        <View style={[styles.predefinedPlaceButton, isAddButton && styles.addButtonSpecialEffect]}>
          <IconComponent
            name={item.icon as any || 'help-circle-outline'}
            size={ICON_SIZE_QUICK_ACCESS}
            color={iconColor}
          />
        </View>
        <Text style={[styles.predefinedPlaceText, { color: textColor }]} numberOfLines={2}>
          {item.name}
        </Text>
      </AnimatedPressable>
    );
  };

  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.quickAccessPanel}>
        <FlatList
          data={[...predefinedPlaces, { id: 'add_new', name: 'Add New', icon: 'plus-circle-outline', iconType: 'MaterialCommunityIcons' }]}
          renderItem={renderPredefinedPlace}
          keyExtractor={(item) => item.id}
          numColumns={QUICK_ACCESS_COLUMNS}
          scrollEnabled={false} // The outer list scrolls
          columnWrapperStyle={styles.quickAccessRowWrapper} // Use if needed for complex row styling
          // No contentContainerStyle needed here as panel handles padding
        />
      </View>
      <Text style={[styles.sectionTitle, { marginTop: 35, marginBottom: 20 }]}>Your Saved Destinations</Text>
    </View>
  );

  const renderDestinationItem = ({ item }: { item: Destination }) => (
    <AnimatedPressable
      pressableStyle={styles.destinationItemPressable}
      onPress={() => handleDestinationPress(item)}
      feedbackType="scale"
      scaleTo={0.98}
    >
      <View style={styles.destinationItemContent}>
        <View style={[
            styles.destinationIconOuterContainer,
            // You could add a specific color based on item.type if you had one
            // { backgroundColor: item.type === 'home' ? THEME.ACCENT_COLOR_LIGHT : THEME.PRIMARY_BRAND_COLOR_LIGHTER }
          ]}
        >
          <View style={styles.destinationIconInnerContainer}>
            <MaterialIcons
              name={item.categoryIcon || "location-pin"} // Assuming categoryIcon on Destination
              size={ICON_SIZE_DESTINATION_ITEM}
              color={THEME.PRIMARY_BRAND_COLOR} // Or dynamic based on category
            />
          </View>
        </View>
        <View style={styles.destinationTextContainer}>
          <Text style={styles.destinationName} numberOfLines={1}>{item.name}</Text>
          {item.address && <Text style={styles.destinationAddress} numberOfLines={1}>{item.address}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={22} color={THEME.TEXT_TERTIARY_LIGHT} />
      </View>
    </AnimatedPressable>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Animated.View style={{transform: [{scale: new Animated.Value(0.8)}]}}>
        {/* Simple fade-in animation for the icon */}
        <MaterialCommunityIcons name="map-marker-question-outline" size={90} color={THEME.TEXT_TERTIARY_LIGHT} style={styles.emptyIcon} />
      </Animated.View>
      <Text style={styles.emptyTitle}>Nothing Saved Yet?</Text>
      <Text style={styles.emptyText}>
        Tap the search bar to find places and save your favorites for easy access next time.
      </Text>
      <Pressable style={styles.emptyActionButton} onPress={() => router.push('/searchScreen')}>
        <Ionicons name="search-outline" size={20} color={THEME.TEXT_ON_PRIMARY_BRAND} />
        <Text style={styles.emptyActionButtonText}>Find Places</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.BACKGROUND_PRIMARY} />
      <Stack.Screen
        options={{
          title: 'Saved Places',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: THEME.BACKGROUND_WHITE }, // Or THEME.BACKGROUND_SURFACE
          headerTitleStyle: { color: THEME.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 18 },
          headerShadowVisible: true,
          headerTintColor: THEME.PRIMARY_BRAND_COLOR,
        }}
      />
      <FlatList
        data={savedDestinations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDestinationItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ savedDestinations.length === 0 ? <EmptyListComponent /> : null }
        // ItemSeparatorComponent={() => <View style={styles.separator} />} // Re-added for a subtle division
        contentContainerStyle={styles.flatListContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND_PRIMARY, // A slightly off-white or light grey
  },
  flatListContentContainer: {
    paddingBottom: 50,
  },
  listHeaderContainer: {
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 22, // Bigger, bolder titles
    fontWeight: 'bold', // Use bold, not number
    color: THEME.TEXT_PRIMARY,
    marginBottom: 18,
    paddingHorizontal: 20,
    letterSpacing: 0.5, // Subtle letter spacing
  },

  // --- Quick Access NEW Styles ---
  quickAccessPanel: {
    backgroundColor: THEME.BACKGROUND_WHITE, // Panel background
    marginHorizontal: 15,
    borderRadius: THEME.BORDER_RADIUS_XLARGE, // << VERY CURVY PANEL
    paddingVertical: 20,
    paddingHorizontal: 15, // Inner padding for the content of the panel
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 10, // Space below panel before next title
  },
  quickAccessRowWrapper: {
    // If using numColumns, this can help space items if default flex behavior isn't enough
    // justifyContent: 'space-around', // Example
  },
  predefinedPlaceWrapper: {
    flex: 1, // Distribute space within numColumns
    alignItems: 'center', // Center content vertically in the wrapper
    marginBottom: 15, // Space between rows of items
    maxWidth: Dimensions.get('window').width / QUICK_ACCESS_COLUMNS - 20, // Max width based on columns
  },
  predefinedPlaceWrapperMargin: {
    // marginRight: 10, // Apply margin if not using space-around/between in columnWrapperStyle
  },
  predefinedPlaceButton: {
    width: 70, // Slightly larger, defined touch target
    height: 70,
    borderRadius: 25, // << CURVY ICON BACKGROUND
    backgroundColor: THEME.BACKGROUND_SECONDARY, // Light greyish background for the icon
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Space between icon circle and text
    // No shadow on individual buttons, panel has shadow
  },
  addButtonSpecialEffect: { // For the "Add New" button in quick access
    backgroundColor: THEME.ACCENT_COLOR_LIGHTER, // A very light accent color
    borderWidth: 1.5,
    borderColor: THEME.ACCENT_COLOR_PALE, // A pale version of accent color
  },
  predefinedPlaceText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 2, // Small padding for text
    lineHeight: 18,
  },

  // --- Saved Destination Item NEW Styles ---
  destinationItemPressable: {
    marginHorizontal: 15, // Consistent margin with panel
    marginBottom: 12, // Space between items
    backgroundColor: THEME.BACKGROUND_WHITE, // Each item gets its own distinct background
    borderRadius: THEME.BORDER_RADIUS_LARGE, // << CURVY ITEMS
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  destinationItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, // Comfortable padding
    paddingHorizontal: 15,
  },
  destinationIconOuterContainer: { // New: Outer colored circle for the icon
    width: 50,
    height: 50,
    borderRadius: 25, // << PERFECTLY CIRCULAR
    backgroundColor: THEME.PRIMARY_BRAND_COLOR_LIGHTEST, // Very light theme color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  destinationIconInnerContainer: { // New: Optional inner smaller circle if needed for complex icons
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.BACKGROUND_WHITE, // White background for the icon itself to pop
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for the icon itself to lift it
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  destinationTextContainer: {
    flex: 1,
  },
  destinationName: {
    fontSize: 17,
    fontWeight: '600', // Bolder name
    color: THEME.TEXT_PRIMARY,
    marginBottom: 4, // More space
  },
  destinationAddress: {
    fontSize: 14, // Slightly larger address
    color: THEME.TEXT_SECONDARY,
  },
  separator: { // Re-added subtle separator
    height: 1,
    backgroundColor: THEME.BORDER_COLOR_EXTRA_LIGHT, // Very light separator
    marginHorizontal: 30, // Indent it
    marginTop: 5, // After the item's marginBottom
  },

  // --- Empty List Styles REFINED ---
  emptyContainer: {
    flexGrow: 1, // Takes available space if list is short or empty
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40, // More vertical padding
    marginTop: 20, // Space from "Your Saved Destinations" title
  },
  emptyIcon: {
    marginBottom: 30, // More space
    opacity: 0.7, // Slightly transparent icon for softer look
  },
  emptyTitle: {
    fontSize: 24, // Larger title
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24, // Better readability
    marginBottom: 30,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.PRIMARY_BRAND_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: THEME.BORDER_RADIUS_XLARGE, // << VERY CURVY BUTTON
    shadowColor: THEME.PRIMARY_BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionButtonText: {
    color: THEME.TEXT_ON_PRIMARY_BRAND,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default SavedDestinationsScreen;