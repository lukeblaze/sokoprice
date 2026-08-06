import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { typography } from '@/theme/tokens';

// Drop-in replacement for RN's <Text> that defaults to the Inter body
// typeface. Components that need the Space Grotesk display face (primary
// headers, prices) set fontFamily explicitly in their own style.
export function Text({ style, ...rest }: TextProps) {
  return <RNText style={[{ fontFamily: typography.bodyFont }, style]} {...rest} />;
}
