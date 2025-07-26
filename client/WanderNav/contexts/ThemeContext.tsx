import { useTheme as useInternalTheme } from '../app/contexts/ThemeContext'; // Adjust path if ThemeContext.tsx is elsewhere

// --- Base Color Palettes ---
const lightColors = {
  primaryBrand: '#007AFF', // Blue
  accent: '#FF9500', // Orange
  secondaryAccent: '#34C759', // Green

  textPrimary: '#1c1c1e', // Near black for major text
  textSecondary: '#636366', // Medium gray for minor text
  textDisabled: '#AEAEB2',
  textOnPrimaryBrand: '#FFFFFF', // Text on primary brand color background

  backgroundRoot: '#F2F2F7', // Overall app background
  backgroundLight: '#FFFFFF', // For cards, headers, tab bars
  backgroundSecondary: '#E5E5EA', // Slightly off-white for grouped table views etc.
  backgroundDark: '#1C1C1E', // For elements needing dark background in light theme (rare)

  border: '#C6C6C8', // Standard border color
  separator: '#D1D1D6', // For list separators

  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',

  // Status Bar (can be different from effective theme if needed)
  statusBar: 'dark-content', // 'default' or 'light-content' or 'dark-content'
};

const darkColors = {
  primaryBrand: '#0A84FF', // Brighter blue for dark mode
  accent: '#FF9F0A', // Brighter orange
  secondaryAccent: '#30D158', // Brighter green

  textPrimary: '#FFFFFF', // White for major text
  textSecondary: '#EBEBF599', // Light gray for minor text (semi-transparent white)
  textDisabled: '#EBEBF54D',
  textOnPrimaryBrand: '#FFFFFF',

  backgroundRoot: '#000000', // True black or very dark gray for overall background
  backgroundLight: '#1C1C1E', // Dark gray for cards, headers, tab bars
  backgroundSecondary: '#2C2C2E', // Slightly lighter dark gray
  backgroundDark: '#FFFFFF', // For elements needing light background in dark theme (rare)

  border: '#38383A', // Dark mode border color
  separator: '#3A3A3C', // Dark mode list separators

  success: '#32D74B',
  warning: '#FFD60A', // Often remains similar
  error: '#FF453A', // Often remains similar

  // Status Bar
  statusBar: 'light-content',
};

// --- Exported THEME object ---
// This will be a Proxy or a function that dynamically returns colors
// For simplicity and direct hook usage, we'll encourage using a hook to get the themed colors.

// It's often better to create a hook that returns the current theme's color palette.
export const useAppTheme = () => {
  const { isDarkMode } = useInternalTheme(); // Use the hook from your ThemeContext
  return isDarkMode ? darkColors : lightColors;
};

// --- For convenience, you might still want to export the palettes directly if needed elsewhere ---
export const LightThemePalette = lightColors;
export const DarkThemePalette = darkColors;

// --- Example of a more structured THEME object (if you prefer this pattern) ---
// This would be used INSTEAD of encouraging useAppTheme directly everywhere for colors
// Note: This specific `DYNAMIC_THEME` object is NOT dynamic by itself.
// You'd use it like: `const currentDynamicColors = isDarkMode ? DYNAMIC_THEME.dark : DYNAMIC_THEME.light;`
// Or, more robustly, this object would be constructed inside a component using the useAppTheme hook.

/*
export const DYNAMIC_THEME = {
  light: lightColors,
  dark: darkColors,
  // You could add spacing, typography, etc. here if they also change with theme
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamilyRegular: 'System', // Replace with your font
    fontFamilyBold: 'System',    // Replace with your font
    // ... other font styles
  },
};
*/

// What was previously referred to as `THEME` in your other files
// should now be replaced by colors obtained from `useAppTheme()`.
// For example, instead of `THEME.PRIMARY_BRAND_COLOR`, you'd do:
// `const appTheme = useAppTheme();`
// `... color: appTheme.primaryBrand ...`

// If you absolutely need a globally accessible (but non-reactive) default,
// you might export one of the palettes, but this is NOT recommended for dynamic UI.
// export const DEFAULT_LIGHT_THEME_FOR_NON_REACTIVE_PARTS = lightColors;