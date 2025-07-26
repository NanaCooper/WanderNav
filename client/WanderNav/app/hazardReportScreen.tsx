import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable, // Keep this
  Platform,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  StyleProp, // Import StyleProp
  ViewStyle,  // Import ViewStyle
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

// --- Import ImagePicker ---
import * as ImagePicker from 'expo-image-picker';

// --- Reusable Animated Pressable ---
const PRESSED_SCALE_VALUE = 0.97;

interface AnimatedPressableProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>; // For the Animated.View
  pressableStyle?: StyleProp<ViewStyle>; // For the outer Pressable
  children?: React.ReactNode;
  friction?: number; // Optional: if you want to override default
  tension?: number;  // Optional: if you want to override default
}

const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  onPress,
  style,
  pressableStyle,
  children,
  friction = 7, // Default friction
  tension = 60, // Default tension
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: PRESSED_SCALE_VALUE,
      friction: friction,
      tension: tension,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: friction,
      tension: tension,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress}
      style={pressableStyle} // Now uses the destructured prop
      android_ripple={{ color: (THEME.PRIMARY_BRAND_COLOR || '#000000') + '30', borderless: false }} // Added fallback for THEME color
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};


// --- Reusable FadeInView ---
interface FadeInViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  delay?: number;
  yOffset?: number;
  duration?: number;
}

const FadeInView: React.FC<FadeInViewProps> = ({
  style,
  children,
  delay = 0,
  yOffset = 15, // This is the initial offset for the animation
  duration = 350,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  // Initialize translateY with the yOffset prop, so it starts from that offset
  const translateY = useRef(new Animated.Value(yOffset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration, // Use prop
        delay: delay,       // Use prop
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, // Animate to its final position (0 offset)
        friction: 7,
        tension: 50,
        delay: delay,       // Use prop
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay, duration]); // yOffset is for initial value, not animation trigger change here

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};


const HAZARD_CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: 'road-variant' as const },
  { id: 'debris', label: 'Debris', icon: 'delete-sweep-outline' as const },
  { id: 'accident', label: 'Accident', icon: 'car-crash' as const },
  { id: 'construction', label: 'Construction', icon: 'sign-caution' as const },
  { id: 'flood', label: 'Flooding', icon: 'water-alert-outline' as const },
  { id: 'other', label: 'Other', icon: 'alert-circle-outline' as const },
] as const;

type HazardCategoryId = typeof HAZARD_CATEGORIES[number]['id'];
const ICON_SIZE_CATEGORY = 28;
const ICON_SIZE_BUTTON = 22;

const HazardReportScreen = () => {
  const router = useRouter();
  const [elementsVisible, setElementsVisible] = useState(false);

  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HazardCategoryId | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  const fetchLocation = async () => {
    setTimeout(() => {
      setLocation({ latitude: 37.78825, longitude: -122.4324 });
      Alert.alert("Location Set", "Mock location has been set for this report.");
    }, 1000);
  };

  useFocusEffect(
    useCallback(() => {
      setElementsVisible(true);
      return () => {
        setElementsVisible(false);
      }
    }, [])
  );

  const handleCategorySelect = (categoryId: HazardCategoryId) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const handleAddPhoto = () => {
    Alert.alert(
      "Add Photo",
      "Choose an option for your hazard report photo:",
      [
        {
          text: "Take Photo...",
          onPress: async () => {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status !== ImagePicker.PermissionStatus.GRANTED) {
              Alert.alert("Permission Required", "Camera permission is needed to take photos.");
              return;
            }
            launchCameraForHazard();
          },
        },
        {
          text: "Choose from Library...",
          onPress: async () => {
            const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaLibraryPermission.status !== ImagePicker.PermissionStatus.GRANTED) {
              Alert.alert("Permission Required", "Media library permission is needed to select photos.");
              return;
            }
            launchImageLibraryForHazard();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const launchCameraForHazard = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error launching camera for hazard:", error);
      Alert.alert("Camera Error", "Could not open camera. Please check permissions in settings.");
    }
  };

  const launchImageLibraryForHazard = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error launching image library for hazard:", error);
      Alert.alert("Gallery Error", "Could not open image library. Please check permissions in settings.");
    }
  };

  const removePhoto = () => {
    setPhotoUri(null);
  };

  const handleSubmitReport = () => {
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a hazard category.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description of the hazard.');
      return;
    }

    console.log('Submitting Hazard Report:', { selectedCategory, description, photoUri, location });
    Alert.alert('Report Submitted', 'Thank you for helping keep our roads safe!', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: THEME.BACKGROUND_PRIMARY }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? (Dimensions.get('window').height > 800 ? 90 : 70) : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={THEME.BACKGROUND_PRIMARY} />
      <Stack.Screen
        options={{
          title: 'Report a Hazard',
          headerStyle: { backgroundColor: THEME.BACKGROUND_SURFACE },
          headerTitleStyle: { color: THEME.TEXT_PRIMARY, fontWeight: '600' },
          headerTintColor: THEME.PRIMARY_BRAND_COLOR,
        }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {elementsVisible && (
          <>
            <FadeInView delay={100} yOffset={10} style={styles.formSection}>
              <Text style={styles.label}>Location (Tap to Pinpoint)</Text>
              <Pressable style={styles.mapPlaceholder} onPress={fetchLocation}>
                <MaterialCommunityIcons name={location ? "map-marker-check-outline" : "map-marker-plus-outline"} size={50} color={location ? THEME.SUCCESS_COLOR : THEME.PRIMARY_BRAND_COLOR} />
                <Text style={styles.mapPlaceholderText}>
                  {location
                    ? `Location Selected: ${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
                    : 'Tap to select location on map'}
                </Text>
                {location && <Text style={styles.mapPlaceholderSubtext}>(Tap again to re-select)</Text>}
              </Pressable>
            </FadeInView>

            <FadeInView delay={200} yOffset={10} style={styles.formSection}>
              <Text style={styles.label}>Select Hazard Category</Text>
              <View style={styles.categoryContainer}>
                {HAZARD_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.categoryButtonSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                        name={category.icon}
                        size={ICON_SIZE_CATEGORY}
                        color={selectedCategory === category.id ? THEME.BACKGROUND_WHITE : THEME.PRIMARY_BRAND_COLOR}
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category.id && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeInView>

            <FadeInView delay={300} yOffset={10} style={styles.formSection}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide details like size, specific location notes, potential danger, etc."
                multiline
                numberOfLines={5}
                placeholderTextColor={THEME.TEXT_TERTIARY}
                textAlignVertical="top"
              />
            </FadeInView>

            <FadeInView delay={400} yOffset={10} style={styles.formSection}>
              <Text style={styles.label}>Add Photo (Optional)</Text>
              {!photoUri ? (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="camera-plus-outline" size={ICON_SIZE_BUTTON + 4} color={THEME.ACCENT_COLOR} />
                  <Text style={styles.addPhotoButtonText}>Tap to add a photo</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: photoUri }} style={styles.imagePreview} />
                  <AnimatedPressable
                    onPress={removePhoto}
                    style={styles.removeImageButton} // Style for the animated view itself
                    pressableStyle={styles.removeImagePressable} // Style for the outer Pressable hit area
                  >
                      <Ionicons name="close-circle" size={28} color={THEME.ERROR_COLOR} />
                  </AnimatedPressable>
                  <TouchableOpacity style={styles.changePhotoButton} onPress={handleAddPhoto} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="image-edit-outline" size={ICON_SIZE_BUTTON} color={THEME.BACKGROUND_WHITE} style={{marginRight: 6}}/>
                      <Text style={styles.changePhotoButtonText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </FadeInView>

            <FadeInView delay={500} yOffset={10} style={styles.submitButtonContainer}>
              <AnimatedPressable
                onPress={handleSubmitReport}
                style={styles.submitButton} // Style for the animated view
                // pressableStyle prop could be used if you need separate styling for the Pressable hit area itself
              >
                <MaterialCommunityIcons name="send-check-outline" size={ICON_SIZE_BUTTON} color={THEME.TEXT_ON_ACCENT_COLOR} />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </AnimatedPressable>
            </FadeInView>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  formSection: {
    marginBottom: 35,
  },
  label: {
    fontSize: 18,
    color: THEME.TEXT_PRIMARY,
    marginBottom: 16,
    fontWeight: '600',
    paddingLeft: 5,
  },
  mapPlaceholder: {
    height: 170,
    backgroundColor: THEME.BACKGROUND_SURFACE,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.BORDER_COLOR,
    padding: 20,
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  mapPlaceholderText: {
    marginTop: 12,
    color: THEME.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  mapPlaceholderSubtext: {
    marginTop: 6,
    color: THEME.TEXT_TERTIARY,
    fontSize: 13,
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 15,
  },
  categoryButton: {
    backgroundColor: THEME.BACKGROUND_SURFACE,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: THEME.PRIMARY_BRAND_COLOR_LIGHTER || THEME.BORDER_COLOR,
    alignItems: 'center',
    width: '30.5%',
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: THEME.PRIMARY_BRAND_COLOR,
    borderColor: THEME.PRIMARY_BRAND_COLOR,
    elevation: 5,
    shadowOpacity: 0.2,
  },
  categoryButtonText: {
    marginTop: 10,
    fontSize: 12.5,
    color: THEME.PRIMARY_BRAND_COLOR,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryButtonTextSelected: {
    color: THEME.BACKGROUND_WHITE,
  },
  input: {
    backgroundColor: THEME.BACKGROUND_SURFACE,
    borderRadius: 25,
    paddingHorizontal: 22,
    paddingVertical: Platform.OS === 'ios' ? 18 : 16,
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: THEME.BORDER_COLOR,
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
    borderRadius: 25,
    paddingTop: 18,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.BACKGROUND_SURFACE,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: THEME.ACCENT_COLOR_LIGHTER || THEME.BORDER_COLOR,
    borderStyle: 'dashed',
    justifyContent: 'center',
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  addPhotoButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: THEME.ACCENT_COLOR,
    fontWeight: '600',
  },
  imagePreviewWrapper: {
    alignItems: 'center',
    marginTop: 15,
    position: 'relative',
  },
  imagePreview: {
    width: '90%',
    aspectRatio: 16/10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: THEME.BORDER_COLOR_LIGHT || THEME.BORDER_COLOR,
    backgroundColor: THEME.BACKGROUND_SECONDARY,
  },
  removeImagePressable: { // This style is for the Pressable component itself (hit area, positioning)
    position: 'absolute',
    top: -8,
    right: -2, // Adjust as needed for visual alignment with the button style
    zIndex: 1,
    // Add padding if you want the touch area to be larger than the visible button
    // padding: 5,
  },
  removeImageButton: { // This style is for the Animated.View (visual appearance of the button)
    backgroundColor: THEME.BACKGROUND_SURFACE_OPACITY_HEAVY || 'rgba(255,255,255,0.8)',
    borderRadius: 18, // Make it a circle or rounded square based on content
    padding: 7,       // Adjust padding to make it look good around the icon
    elevation: 5,
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    // Ensure it aligns with the icon if needed, e.g., by making it a square
    // width: 32, height: 32, alignItems: 'center', justifyContent: 'center'
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: THEME.PRIMARY_BRAND_COLOR_OPACITY_HIGH || (THEME.PRIMARY_BRAND_COLOR + 'E9'),
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  changePhotoButtonText: {
    color: THEME.TEXT_ON_PRIMARY_BRAND,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonContainer: {
    marginTop: 25,
    marginBottom: Platform.OS === 'ios' ? 25 : 35,
  },
  submitButton: { // This style is for the Animated.View
    flexDirection: 'row',
    backgroundColor: THEME.ACCENT_COLOR,
    paddingVertical: 20,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.ACCENT_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonText: {
    color: THEME.TEXT_ON_ACCENT_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default HazardReportScreen;