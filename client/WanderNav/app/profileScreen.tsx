import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Assuming MaterialCommunityIcons is not used here, else add it
import { THEME } from '../constants/theme';
import { useFocusEffect } from 'expo-router';

// --- Reusable Animated Pressable (Ensure accessible or redefine from a shared component) ---
const PRESSED_SCALE_VALUE = 0.98;
const AnimatedPressable = ({ onPress, style, children, pressableStyle }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleValue, { toValue: PRESSED_SCALE_VALUE, friction: 7, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={pressableStyle} android_ripple={{ color: 'rgba(0,0,0,0.05)'}}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// --- Reusable FadeInView (Ensure accessible or redefine from a shared component) ---
interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: any;
  translateYValue?: number; // How much it slides up from
}

const FadeInView: React.FC<FadeInViewProps> = ({ children, duration = 300, delay = 0, style, translateYValue = 20 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYValue)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 7, tension: 60, delay, useNativeDriver: true })
    ]).start();
  }, [opacity, translateY, duration, delay]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
};


const ProfileScreen = () => {
  const router = useRouter();
  const [elementsVisible, setElementsVisible] = useState(false);

  // Example state - replace with actual user data fetching and management
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [bio, setBio] = useState('Loves coding with React Native & Expo! Exploring new places and technologies.');
  const [avatarUri, setAvatarUri] = useState('https://placeimg.com/150/150/people/3'); // Placeholder

  useFocusEffect(
    useCallback(() => {
      setElementsVisible(true);
      // Optional: Logic to fetch/refresh user data when screen is focused
      return () => {
        setElementsVisible(false); // Reset for next focus, if desired
      };
    }, [])
  );

  const handleSaveChanges = () => {
    console.log('Saving changes:', { name, email, bio, avatarUri });
    // Add logic to save changes (e.g., API call)
    alert('Changes Saved!'); // Placeholder feedback
    // Optionally, navigate back or show a success message
  };

  const handleProfilePictureChange = () => {
    // Logic for image picker
    alert('Change profile picture functionality to be implemented.');
    // Example: setAvatarUri('new_image_uri_from_picker');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: THEME.BACKGROUND_LIGHT }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? (Dimensions.get('window').height > 800 ? 90 : 70) : 0}
    >
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerRight: () => (
            <Pressable onPress={handleSaveChanges} style={{ marginRight: 15 }}>
              <Text style={styles.headerSaveText}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {elementsVisible && (
          <>
            <FadeInView delay={100} translateYValue={30} style={styles.profileHeaderContainer}>
              <Pressable onPress={handleProfilePictureChange} style={styles.avatarPressable}>
                <Image
                  source={{ uri: avatarUri || 'https://placeimg.com/150/150/people/placeholder' }} // Fallback
                  style={styles.profileImage}
                />
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera-outline" size={20} color={THEME.BACKGROUND_WHITE} />
                </View>
              </Pressable>
            </FadeInView>

            <FadeInView delay={200} style={styles.formSection}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={THEME.TEXT_SECONDARY}
                autoCorrect={false}
              />
            </FadeInView>

            <FadeInView delay={300} style={styles.formSection}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={false} // Common for email to be non-editable here, or require verification
                selectTextOnFocus={false}
                placeholderTextColor={THEME.TEXT_SECONDARY}
              />
            </FadeInView>

            <FadeInView delay={400} style={styles.formSection}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us a bit about yourself"
                multiline
                numberOfLines={4} // Suggests initial height
                placeholderTextColor={THEME.TEXT_SECONDARY}
                textAlignVertical="top" // For Android multiline placeholder
              />
            </FadeInView>

            {/* Optional: Add more fields or a dedicated button if headerRight is not used for save */}
            {/*
            <FadeInView delay={500} translateYValue={10} style={{ marginTop: 30 }}>
              <AnimatedPressable onPress={handleSaveChanges} style={styles.saveButton} pressableStyle={{marginHorizontal: 20}}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </AnimatedPressable>
            </FadeInView>
            */}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // backgroundColor is on KeyboardAvoidingView now
  },
  scrollContainer: {
    paddingVertical: 20, // Add some top padding if header is translucent or for spacing
    paddingHorizontal: 20,
    paddingBottom: 40, // Space for the last element before keyboard
  },
  headerSaveText: {
    color: THEME.ACCENT_COLOR,
    fontSize: 17,
    fontWeight: '600',
  },
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: 30, // Space below avatar section
  },
  avatarPressable: {
    position: 'relative', // For camera icon positioning
  },
  profileImage: {
    width: 130, // Slightly larger
    height: 130,
    borderRadius: 65,
    borderWidth: 4, // Thicker border
    borderColor: THEME.ACCENT_COLOR,
    backgroundColor: THEME.BORDER_COLOR, // Placeholder bg while image loads
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: THEME.PRIMARY_BRAND_COLOR,
    padding: 10, // Slightly larger
    borderRadius: 20, // Fully round
    borderWidth: 2,
    borderColor: THEME.BACKGROUND_WHITE, // Contrast border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  formSection: {
    marginBottom: 25, // Increased spacing between form items
  },
  label: {
    fontSize: 15, // Slightly larger label
    color: THEME.TEXT_SECONDARY,
    marginBottom: 10, // Increased space below label
    fontWeight: '500', // Medium weight for labels
  },
  input: {
    backgroundColor: THEME.BACKGROUND_WHITE,
    borderRadius: 12, // More rounded
    paddingHorizontal: 18, // More horizontal padding
    paddingVertical: Platform.OS === 'ios' ? 15 : 12, // Adjusted padding for height
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: THEME.BORDER_COLOR, // Subtle border
    // Removed individual shadow from inputs for a cleaner look, relies on card/section shadow if any
  },
  textArea: {
    minHeight: 100, // Ensure enough height for multiline
    textAlignVertical: 'top', // For Android
  },
  // If using a separate save button:
  // saveButton: {
  //   backgroundColor: THEME.ACCENT_COLOR,
  //   paddingVertical: 16,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   shadowColor: THEME.SHADOW_COLOR,
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 5,
  //   elevation: 3,
  // },
  // saveButtonText: {
  //   color: THEME.BACKGROUND_WHITE,
  //   fontSize: 17,
  //   fontWeight: 'bold',
  // },
});

export default ProfileScreen;