import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { colors } from '@/theme/tokens';
import { useAppStore } from '@/store';

export interface SemanticColors {
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  divider: string;
}

const lightColors: Omit<SemanticColors, 'isDark'> = {
  bg: colors.gray[50],
  surface: colors.white,
  surfaceAlt: colors.gray[50],
  border: colors.gray[200],
  borderSubtle: colors.gray[100],
  textPrimary: colors.navy[800],
  textSecondary: colors.gray[500],
  textMuted: colors.gray[400],
  divider: colors.gray[100],
};

// Dark mode extends the brand's navy — hero sections are already this
// color in light mode, so dark mode just becomes navy everywhere.
const darkColors: Omit<SemanticColors, 'isDark'> = {
  bg: colors.navy[900],
  surface: colors.navy[800],
  surfaceAlt: colors.navy[700],
  border: colors.navy[600],
  borderSubtle: colors.navy[700],
  textPrimary: colors.white,
  textSecondary: colors.gray[300],
  textMuted: colors.gray[400],
  divider: colors.navy[700],
};

export function useThemeColors(): SemanticColors {
  const colorScheme = useAppStore(s => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = colorScheme === 'system' ? systemScheme === 'dark' : colorScheme === 'dark';

  return useMemo(
    () => ({ isDark, ...(isDark ? darkColors : lightColors) }),
    [isDark]
  );
}
