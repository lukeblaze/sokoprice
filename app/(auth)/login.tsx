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
import { colors, radii, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAppStore(s => s.signIn);
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    form: { backgroundColor: t.surface },
    formTitle: { color: t.textPrimary },
    fieldLabel: { color: t.textPrimary },
    inputWrap: { backgroundColor: t.surfaceAlt, borderColor: t.border },
    input: { color: t.textPrimary },
    dividerLine: { backgroundColor: t.border },
    registerBtn: { borderColor: t.border },
    registerBtnText: { color: t.textPrimary },
  }), [t]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate auth — replace with real API call
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    signIn();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { paddingTop: insets.top }]}
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
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={styles.appName}>SokoPrice</Text>
          <Text style={styles.tagline}>Nairobi market prices, real time</Text>
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
            <Text style={styles.dividerText}>or</Text>
            <View style={[styles.dividerLine, dyn.dividerLine]} />
          </View>

          <Pressable onPress={() => router.push('/(auth)/register')} style={[styles.registerBtn, dyn.registerBtn]}>
            <Text style={[styles.registerBtnText, dyn.registerBtnText]}>Create a business account</Text>
          </Pressable>
        </View>

        {/* Skip for demo */}
        <Pressable onPress={() => { signIn(); router.replace('/(tabs)'); }} style={styles.skipBtn}>
          <Text style={styles.skipText}>Continue as guest →</Text>
        </Pressable>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brand: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 48,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 22,
    fontFamily: typography.displayFont,
    color: colors.navy[800],
  },
  appName: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.displayFont,
    color: colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 6,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: 24,
  },
  formTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.gray[50],
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy[800],
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgot: {
    fontSize: typography.sizes.sm,
    color: colors.amber[600],
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: colors.navy[800],
    borderRadius: radii.lg,
    paddingVertical: 14,
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
    gap: 12,
    marginVertical: 20,
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
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
  },
  skipBtn: {
    alignItems: 'center',
    paddingTop: 28,
  },
  skipText: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.4)',
  },
});
