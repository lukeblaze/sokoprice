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
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, EnvelopeSimpleIcon, CheckCircleIcon } from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { colors, radii, typography } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { authApi } from '@/api';

export default function ForgotPasswordScreen() {
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

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      showMessage({ message: 'Enter your email address', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      showMessage({ message: err instanceof Error ? err.message : 'Something went wrong', type: 'danger' });
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
        <meta name="description" content="Reset your SokoPrice account password." />
      </Head>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerCol}>
          <Pressable onPress={() => router.back()} style={[styles.back, dyn.back]}>
            <ArrowLeftIcon size={20} color={t.textPrimary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, dyn.title]}>Forgot password?</Text>
            <Text style={[styles.subtitle, dyn.subtitle]}>
              Enter your email and we'll send you a link to reset it.
            </Text>
          </View>

          <View style={[styles.form, dyn.form]}>
            {sent ? (
              <View style={styles.successWrap}>
                <CheckCircleIcon size={40} color={colors.amber[500]} weight="fill" />
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successBody}>
                  If an account exists for {email.trim()}, we've sent a link to reset your password.
                </Text>
                <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.submitBtn}>
                  <Text style={styles.submitBtnText}>Back to sign in</Text>
                </Pressable>
              </View>
            ) : (
              <>
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

                <Pressable
                  onPress={handleSubmit}
                  style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                  disabled={loading}
                >
                  <Text style={styles.submitBtnText}>
                    {loading ? 'Sending…' : 'Send reset link'}
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
