import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EnvelopeSimpleIcon, LockIcon, EyeIcon, EyeSlashIcon } from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { colors, radii, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { useThemeColors } from '@/hooks/useThemeColors';
import { authApi } from '@/api';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAppStore(s => s.signIn);
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    appName: { color: t.textPrimary },
    tagline: { color: t.textSecondary },
    form: { backgroundColor: t.surface, borderColor: t.border },
    formTitle: { color: t.textPrimary },
    fieldLabel: { color: t.textPrimary },
    inputWrap: { backgroundColor: t.surfaceAlt, borderColor: t.border },
    input: { color: t.textPrimary },
    dividerLine: { backgroundColor: t.border },
    dividerText: { color: t.textMuted },
    registerBtn: { borderColor: t.border },
    registerBtnText: { color: t.textPrimary },
  }), [t]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showMessage({ message: 'Enter your email and password', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const user = await authApi.login(email.trim(), password);
      signIn(user);
      router.replace('/(tabs)');
    } catch (err) {
      showMessage({ message: err instanceof Error ? err.message : 'Sign in failed', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}
    >
      <Head>
        <title>Sign In — SokoPrice</title>
        <meta name="description" content="Sign in to SokoPrice to track prices and manage your vendor watchlist." />
      </Head>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.centerCol}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={[styles.appName, dyn.appName]}>SokoPrice</Text>
          <Text style={[styles.tagline, dyn.tagline]}>Nairobi market prices, real time</Text>
        </View>

        {/* Form */}
        <View style={[styles.form, dyn.form]}>
          <Text style={[styles.formTitle, dyn.formTitle]}>Sign in</Text>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, dyn.fieldLabel]}>Email address</Text>
            <View style={[styles.inputWrap, dyn.inputWrap]}>
              <EnvelopeSimpleIcon size={16} color={t.textMuted} />
              <TextInput
                style={[styles.input, dyn.input]}
                placeholder="you@company.co.ke"
                placeholderTextColor={t.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, dyn.fieldLabel]}>Password</Text>
            <View style={[styles.inputWrap, dyn.inputWrap]}>
              <LockIcon size={16} color={t.textMuted} />
              <TextInput
                style={[styles.input, dyn.input]}
                placeholder="Your password"
                placeholderTextColor={t.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPassword(v => !v)}>
                {showPassword ? (
                  <EyeSlashIcon size={16} color={t.textMuted} />
                ) : (
                  <EyeIcon size={16} color={t.textMuted} />
                )}
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => {}} style={styles.forgotWrap}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            style={[styles.submitBtn, loading && styles.submitBtnLoading]}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, dyn.dividerLine]} />
            <Text style={[styles.dividerText, dyn.dividerText]}>or</Text>
            <View style={[styles.dividerLine, dyn.dividerLine]} />
          </View>

          <Pressable onPress={() => router.push('/(auth)/register')} style={[styles.registerBtn, dyn.registerBtn]}>
            <Text style={[styles.registerBtnText, dyn.registerBtnText]}>Create a business account</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy[800],
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  centerCol: {
    width: '100%',
    maxWidth: 380,
  },
  brand: {
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 32,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    fontSize: 18,
    fontFamily: typography.displayFont,
    color: colors.navy[800],
  },
  appName: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.displayFont,
    color: colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 0.5,
    borderColor: 'transparent',
    padding: 20,
  },
  formTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
    marginBottom: 18,
  },
  field: {
    marginBottom: 13,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.gray[50],
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy[800],
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgot: {
    fontSize: typography.sizes.sm,
    color: colors.amber[600],
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: colors.navy[800],
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnLoading: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[400],
  },
  registerBtn: {
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  registerBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
  },
});
