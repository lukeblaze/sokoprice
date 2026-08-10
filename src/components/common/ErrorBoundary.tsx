import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Text } from './Text';
import { WarningCircleIcon } from 'phosphor-react-native';
import { colors, radii, typography } from '@/theme/tokens';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  handleReload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
      return;
    }
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.screen}>
          <WarningCircleIcon size={48} color={colors.amber[400]} weight="fill" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            An unexpected error occurred. Try reloading the app — your data is safe.
          </Text>
          <Pressable onPress={this.handleReload} style={styles.button}>
            <Text style={styles.buttonText}>Reload</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.navy[800],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
    marginTop: 16,
  },
  body: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.navy[800],
  },
});
