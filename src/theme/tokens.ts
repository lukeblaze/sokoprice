// SokoPrice Design Tokens
// Navy/Amber palette — commerce trust, Nairobi market energy

export const colors = {
  // Primary palette
  navy: {
    50: '#E8ECF0',
    100: '#C5CDD7',
    200: '#9EADBF',
    300: '#768DA6',
    400: '#5A7490',
    500: '#3D5B79',
    600: '#2A4A66',
    700: '#183852',
    800: '#0D1B2A',  // Primary navy — main brand
    900: '#080F17',
  },
  amber: {
    50: '#FFF8E8',
    100: '#FFEDB8',
    200: '#FFE08A',
    300: '#F5C842',
    400: '#E8A020',  // Primary amber — accent
    500: '#C88010',
    600: '#A86408',
    700: '#884C04',
    800: '#6A3801',
    900: '#4A2600',
  },
  // Neutrals
  gray: {
    50: '#F7F5F0',   // Offwhite background
    100: '#EDF0F2',
    200: '#D8DCE0',
    300: '#B8BEC4',
    400: '#8E969E',
    500: '#6B7280',
    600: '#4A5568',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Semantic
  green: {
    50: '#E8F5EE',
    400: '#2D9E5F',
    600: '#1A7A43',
    800: '#0E5C2F',
  },
  red: {
    50: '#FDECEA',
    400: '#E53E3E',
    600: '#C53030',
    800: '#9B2C2C',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const typography = {
  // Space Grotesk for display/headlines (loaded via expo-font)
  displayFont: 'SpaceGrotesk_700Bold',
  displayFontMedium: 'SpaceGrotesk_500Medium',
  // Inter for body (loaded via expo-font)
  bodyFont: 'Inter_400Regular',
  bodyFontMedium: 'Inter_500Medium',
  bodyFontSemiBold: 'Inter_600SemiBold',
  // Monospace for prices/numbers
  monoFont: 'Inter_500Medium',

  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },

  lineHeights: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Bottom tab bar height (used for scroll padding)
export const TAB_BAR_HEIGHT = 64;
export const STATUS_BAR_HEIGHT = 44;
