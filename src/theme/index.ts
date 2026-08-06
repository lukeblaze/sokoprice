import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors, typography, spacing, radii, shadows } from './tokens';

// React Native Paper MD3 theme — SokoPrice
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.navy[800],
    primaryContainer: colors.navy[100],
    secondary: colors.amber[400],
    secondaryContainer: colors.amber[50],
    tertiary: colors.green[400],
    surface: colors.white,
    surfaceVariant: colors.gray[50],
    background: colors.gray[50],
    onBackground: colors.navy[800],
    onSurface: colors.navy[800],
    outline: colors.gray[200],
    error: colors.red[600],
  },
  roundness: 3, // = 12px with Paper's scale
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.amber[400],
    primaryContainer: colors.navy[700],
    secondary: colors.amber[300],
    secondaryContainer: colors.navy[600],
    surface: colors.navy[800],
    surfaceVariant: colors.navy[700],
    background: colors.navy[900],
    onBackground: colors.gray[50],
    onSurface: colors.gray[50],
    outline: colors.navy[600],
    error: colors.red[400],
  },
  roundness: 3,
};

// Shared app theme object (used outside Paper)
export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
} as const;

export type AppTheme = typeof lightTheme;
export { colors, typography, spacing, radii, shadows };
