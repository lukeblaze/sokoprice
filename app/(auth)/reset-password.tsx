import React, { useMemo, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, LockIcon, EyeIcon, EyeSlashIcon, WarningCircleIcon } from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { colors, radii, typography } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { authApi } from '@/api';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    title: { color: t.textPrimary },
    subtitle: { color: t.textSecondary },
    form: { backgroundColor: t.surface, borderColor: t.border },
    fieldLabel: { color: t.textPrimary },
    inputWrap: { backgroundColor: t.surfaceAlt, borderColor: t.border },
    input: { color: t.textPrimary },
    back: { backgroundColor: t.surfaceAlt },
  }), [t]);

  const { uid, token } = useLocalSearchParams<{ uid?: string; token?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const linkInvalid = !uid || !token;

  const handleSubmit = async () => {
    if (!password || password.length < 8) {
      showMessage({ message: 'Password must be at least 8 characters', type: 'warning' });
      return;
    }
    if (password !== confirmPassword) {
      showMessage({ message: "Passwords don't match", type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmPasswordReset(uid as string, token as string, password);
      showMessage({ message: 'Password reset — sign in with your new password', type: 'success' });
      router.replace('/(auth)/login');
    } catch (err) {
      showMessage({ message: err instanceof Error ? err.message : 'Reset link is invalid or expired', type: 'danger' });
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
        <title>Reset Password — SokoPrice</title>
        <meta name="description" content="Choose a new password for your SokoPrice account." />
      </Head>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerCol}>
          <Pressable onPress={() => router.replace('/(auth)/login')} style={[styles.back, dyn.back]}>
            <ArrowLeftIcon size={20} color={t.textPrimary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, dyn.title]}>Choose a new password</Text>
            <Text style={[styles.subtitle, dyn.subtitle]}>
              Make it something you haven't used before.
            </Text>
          </View>

          <View style={[styles.form, dyn.form]}>
            {linkInvalid ? (
              <View style={styles.successWrap}>
                <WarningCircleIcon size={40} color={colors.red[600]} weight="fill" />
                <Text style={styles.successTitle}>Invalid reset link</Text>
                <Text style={styles.successBody}>
                  This password reset link is missing or malformed. Request a new one to continue.
                </Text>
                <Pressable onPress={() => router.replace('/(auth)/forgot-password')} style={styles.submitBtn}>
                  <Text style={styles.submitBtnText}>Request new link</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, dyn.fieldLabel]}>New password</Text>
                  <View style={[styles.inputWrap, dyn.inputWrap]}>
                    <LockIcon size={16} color={t.textMuted} />
                    <TextInput
                      style={[styles.input, dyn.input]}
                      placeholder="At least 8 characters"
                      placeholderTextColor={t.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
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

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, dyn.fieldLabel]}>Confirm password</Text>
                  <View style={[styles.inputWrap, dyn.inputWrap]}>
                    <LockIcon size={16} color={t.textMuted} />
                    <TextInput
                      style={[styles.input, dyn.input]}
                      placeholder="Re-enter your new password"
                      placeholderTextColor={t.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleSubmit}
                  style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                  disabled={loading}
                >
                  <Text style={styles.submitBtnText}>
                    {loading ? 'Resetting…' : 'Reset password'}
                  </Text>
                </Pressable>
              </>
            )}
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
  scrollView: {
    flex: 1,
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
  back: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.displayFont,
    color: colors.white,
  },
  subtitle: {
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
  field: {
    marginBottom: 12,
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
  submitBtn: {
    backgroundColor: colors.navy[800],
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.white,
  },
  successWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  successTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
    marginTop: 14,
  },
  successBody: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
});
