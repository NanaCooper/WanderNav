// theme.ts

// Helper function to add alpha to hex colors (optional but useful)
export const addAlpha = (color: string, opacity: number): string => {
  // if already rgba, just return
  if (color.startsWith('rgba')) return color;
  const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase().padStart(2, '0');
};

export const THEME = {
  // --- Core Brand Colors ---
  PRIMARY_BRAND_COLOR: '#2C3E50', // Dark Blue
  ACCENT_COLOR: '#1ABC9C',       // Teal

  // --- Background Colors ---
  BACKGROUND_PRIMARY: '#F4F6F8',   // Main screen background (your existing BACKGROUND_LIGHT)
  BACKGROUND_SECONDARY: '#E9ECEF', // Slightly darker than primary, for subtle card-in-card or icon BGs
  BACKGROUND_SURFACE: '#FFFFFF',   // For elements that sit on top of BACKGROUND_PRIMARY (your existing BACKGROUND_WHITE)
  BACKGROUND_WHITE: '#FFFFFF',     // Pure white, can be same as SURFACE or used specifically

  // --- Text Colors ---
  TEXT_PRIMARY: '#2D3748',          // For main headlines and important text
  TEXT_SECONDARY: '#718096',        // For subheadings, less important text, input labels
  TEXT_TERTIARY: '#AEAEB2',         // For hints, captions, disabled text (New)
  TEXT_ON_PRIMARY_BRAND: '#FFFFFF', // Text on Dark Blue
  TEXT_ON_ACCENT_COLOR: '#FFFFFF',  // Text on Teal (ensure contrast)
  TEXT_ON_DARK_SURFACE: '#FFFFFF',  // For text on dark custom backgrounds (if any)
  TEXT_LINK: '#007AFF',            // Standard link color (Example, adjust as needed)

  // --- Border Colors ---
  BORDER_COLOR: '#E2E8F0',          // Standard border for inputs, cards
  BORDER_COLOR_LIGHT: '#EDF2F7',    // Lighter border, for subtle dividers (New)
  BORDER_COLOR_EXTRA_LIGHT: '#F7FAFC', // Very light, almost invisible (New)

  // --- Status & Utility Colors ---
  SUCCESS_COLOR: '#2ECC71',
  SUCCESS_COLOR_LIGHT: addAlpha('#2ECC71', 0.15), // Light background for success messages
  ERROR_COLOR: '#E74C3C',
  ERROR_COLOR_LIGHT: addAlpha('#E74C3C', 0.15),   // Light background for error messages
  WARNING_COLOR: '#FFA500',         // Example orange for warnings
  WARNING_COLOR_LIGHT: addAlpha('#FFA500', 0.15),

  // --- Shadow ---
  SHADOW_COLOR: 'rgba(160, 174, 192, 0.4)', // Your existing soft shadow

  // --- Opacity Enhanced Brand Colors (for backgrounds, borders etc.) ---
  PRIMARY_BRAND_COLOR_LIGHTER: addAlpha('#2C3E50', 0.1), // Very light version of Dark Blue for backgrounds
  PRIMARY_BRAND_COLOR_PALE: addAlpha('#2C3E50', 0.25),   // Slightly more visible than lighter
  ACCENT_COLOR_LIGHTER: addAlpha('#1ABC9C', 0.1),    // Very light version of Teal
  ACCENT_COLOR_PALE: addAlpha('#1ABC9C', 0.25),      // Slightly more visible than lighter

  // --- Specific Use Cases (from previous examples) ---
  MAP_CONTROL_BACKGROUND: 'rgba(255, 255, 255, 0.95)',

  // --- Border Radii (Crucial for the curvy design) ---
  BORDER_RADIUS_SMALL: 8,
  BORDER_RADIUS_MEDIUM: 14,
  BORDER_RADIUS_LARGE: 22,
  BORDER_RADIUS_XLARGE: 30, // For very curvy panels, main action buttons
  BORDER_RADIUS_CIRCLE: 9999, // For making perfect circles (half of width/height)

  // --- Spacing Units (Consider adding these for consistency) ---
  // SPACING_EXTRA_SMALL: 4,
  // SPACING_SMALL: 8,
  // SPACING_MEDIUM: 16,
  // SPACING_LARGE: 24,
  // SPACING_EXTRA_LARGE: 32,

  // --- Font Sizes (Consider adding these) ---
  // FONT_SIZE_EXTRA_SMALL: 10,
  // FONT_SIZE_SMALL: 12,
  // FONT_SIZE_MEDIUM: 14, (Often default body)
  // FONT_SIZE_LARGE: 16,
  // FONT_SIZE_XLARGE: 18,
  // FONT_SIZE_XXLARGE: 22,
  // FONT_SIZE_TITLE: 28,

  // --- Font Weights (If you use specific weights often) ---
  // FONT_WEIGHT_LIGHT: '300',
  // FONT_WEIGHT_REGULAR: '400',
  // FONT_WEIGHT_MEDIUM: '500',
  // FONT_WEIGHT_SEMIBOLD: '600',
  // FONT_WEIGHT_BOLD: '700',
};

// --- Common Reusable Styles (Example - You can expand this) ---
export const commonStyles = {
  card: {
    backgroundColor: THEME.BACKGROUND_SURFACE,
    borderRadius: THEME.BORDER_RADIUS_LARGE,
    padding: 16, // Or THEME.SPACING_MEDIUM
    shadowColor: THEME.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Adjust as needed
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    backgroundColor: THEME.BACKGROUND_WHITE,
    borderRadius: THEME.BORDER_RADIUS_MEDIUM,
    paddingHorizontal: 16, // Or THEME.SPACING_MEDIUM
    paddingVertical: 12,
    fontSize: 16, // Or THEME.FONT_SIZE_LARGE
    color: THEME.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: THEME.BORDER_COLOR,
  },
  // ... more common styles like buttons, titles, etc.
};