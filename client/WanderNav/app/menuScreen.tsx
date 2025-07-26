import React, { useRef, useEffect, useState } from 'react'; // Added useEffect, useState for animations
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../constants/theme'; // Import THEME
import { useFocusEffect } from 'expo-router'; // For animations on screen focus


// --- Reusable Animated Pressable Component (Ensure this is accessible or redefined) ---
const PRESSED_SCALE_VALUE = 0.97;
const AnimatedPressable = ({ onPress, style, children, pressableStyle }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleValue, { toValue: PRESSED_SCALE_VALUE, friction: 5, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={pressableStyle} android_ripple={{ color: 'rgba(0,0,0,0.05)'}}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// --- FadeInView Component (Ensure this is accessible or redefined) ---
const FadeInView = ({ children, duration = 300, delay = 0, style, slideFrom = 'bottom' }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const transformValue = useRef(new Animated.Value(slideFrom === 'bottom' ? 15 : slideFrom === 'left' ? -15 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }).start();
    Animated.timing(transformValue, {
      toValue: 0,
      duration: duration * 1.2,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, transformValue, duration, delay]);

  const animatedStyle = {
    opacity,
    transform: [
      slideFrom === 'bottom' || slideFrom === 'top' ? { translateY: transformValue } : { translateX: transformValue }
    ]
  };

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};


// --- Menu Button Component ---
interface MenuButtonProps {
  title: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconSet?: 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons';
  onPress: () => void;
  isLastItem?: boolean;
  delay?: number; // For staggered animation
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, iconName, iconSet = 'MaterialCommunityIcons', onPress, isLastItem, delay = 0 }) => {
  let IconComponent: any = MaterialCommunityIcons;
  if (iconSet === 'Ionicons') IconComponent = Ionicons;
  if (iconSet === 'MaterialIcons') IconComponent = MaterialIcons;

  return (
    <FadeInView delay={delay} slideFrom="left">
      <AnimatedPressable
        onPress={onPress}
        style={[styles.menuButton, isLastItem && styles.lastMenuButton]}
        pressableStyle={{ width: '100%' }}
      >
        <IconComponent name={iconName} size={24} color={THEME.PRIMARY_BRAND_COLOR} style={styles.menuButtonIcon} />
        <Text style={styles.menuButtonText}>{title}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={THEME.TEXT_SECONDARY} />
      </AnimatedPressable>
    </FadeInView>
  );
};


const MenuScreen = () => {
  const router = useRouter();
  const [elementsVisible, setElementsVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setElementsVisible(true);
      return () => setElementsVisible(false);
    }, [])
  );

  const menuItems = [
    {
      title: 'Profile',
      iconName: 'person-circle-outline' as React.ComponentProps<typeof Ionicons>['name'],
      iconSet: 'Ionicons' as 'Ionicons',
      action: () => router.push('/profileScreen'),
    },
    {
      title: 'Settings',
      iconName: 'settings-outline' as React.ComponentProps<typeof Ionicons>['name'],
      iconSet: 'Ionicons' as 'Ionicons',
      action: () => router.push('/settingsScreen'),
    },
    {
      title: 'Group Messaging',
      iconName: 'chatbubbles-outline' as React.ComponentProps<typeof Ionicons>['name'],
      iconSet: 'Ionicons' as 'Ionicons',
      action: () => router.push('/groupMessagingScreen'),
    },
    // Add more items if needed
    // {
    //   title: 'Help & Support',
    //   iconName: 'help-circle-outline' as React.ComponentProps<typeof Ionicons>['name'],
    //   iconSet: 'Ionicons' as 'Ionicons',
    //   action: () => { /* ... */ },
    // },
  ];

  return (
    <View style={styles.screen}>
      {/* Stack.Screen options are now globally set in _layout.tsx,
          but can be overridden here if specific styling is needed for this screen's header */}
      <Stack.Screen
        options={{
          title: 'Menu',
          // Example of overriding global header for a specific screen:
          // headerStyle: { backgroundColor: THEME.PRIMARY_BRAND_COLOR },
          // headerTintColor: THEME.TEXT_ON_PRIMARY_BRAND,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {elementsVisible && (
          <View style={styles.menuItemGroup}>
            {menuItems.map((item, index) => (
              <MenuButton
                key={item.title}
                title={item.title}
                iconName={item.iconName as any}
                iconSet={item.iconSet as any}
                onPress={item.action}
                isLastItem={index === menuItems.length - 1}
                delay={index * 100} // Staggered animation delay
              />
            ))}
          </View>
        )}

        {/* Example: Logout Button or App Version */}
        {elementsVisible && (
          <FadeInView delay={menuItems.length * 100 + 100} style={{ marginTop: 30 }}>
            <AnimatedPressable
              onPress={() => alert('Logout action!')} // Replace with actual logout logic
              style={styles.logoutButton}
              pressableStyle={{ marginHorizontal: 20 }}
            >
              <MaterialCommunityIcons name="logout" size={22} color={THEME.ERROR_COLOR} style={styles.menuButtonIcon} />
              <Text style={[styles.menuButtonText, { color: THEME.ERROR_COLOR }]}>Logout</Text>
            </AnimatedPressable>
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND_LIGHT,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  menuItemGroup: {
    backgroundColor: THEME.BACKGROUND_WHITE,
    borderRadius: 12, // Softer radius
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: 'hidden', // Ensures border radius is respected by children
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, // More subtle shadow
    shadowRadius: 8,
    elevation: 4,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Increased padding for better touch area
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Handled by menuItemGroup
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.BORDER_COLOR,
  },
  lastMenuButton: {
    borderBottomWidth: 0,
  },
  menuButtonIcon: {
    marginRight: 20, // Increased spacing
  },
  menuButtonText: {
    flex: 1,
    fontSize: 17,
    color: THEME.TEXT_PRIMARY,
    fontWeight: '500', // Slightly bolder
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: THEME.BACKGROUND_WHITE,
    borderRadius: 12,
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default MenuScreen;