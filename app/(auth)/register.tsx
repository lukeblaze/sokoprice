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
import { ArrowLeftIcon, UserIcon, BuildingsIcon, PhoneIcon, EnvelopeSimpleIcon, LockIcon } from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { colors, radii, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { useThemeColors } from '@/hooks/useThemeColors';
import { authApi } from '@/api';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAppStore(s => s.signIn);
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
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      showMessage({ message: 'Fill in your name, email, and password', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const user = await authApi.register({
        name: form.name.trim(),
        businessName: form.businessName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
      });
      signIn(user);
      router.replace('/(tabs)');
    } catch (err) {
      showMessage({ message: err instanceof Error ? err.message : 'Registration failed', type: 'danger' });
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
        <title>Create Account — SokoPrice</title>
        <meta name="description" content="Create a free SokoPrice account to start comparing vendor prices in Nairobi." />
      </Head>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.centerCol}>
        {/* Back */}
        <Pressable onPress={() => router.back()} style={[styles.back, dyn.back]}>
          <ArrowLeftIcon size={20} color={t.textPrimary} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, dyn.title]}>Create account</Text>
          <Text style={[styles.subtitle, dyn.subtitle]}>Start tracking Nairobi market prices</Text>
        </View>

        {/* Form */}
        <View style={[styles.form, dyn.form]}>
          {[
            { key: 'name', label: 'Your name', placeholder: 'Blaze Murimi', icon: UserIcon, autoCapitalize: 'words' as const },
            { key: 'businessName', label: 'Business name', placeholder: 'Blaze Solutions Ltd', icon: BuildingsIcon, autoCapitalize: 'words' as const },
            { key: 'phone', label: 'Phone (M-Pesa)', placeholder: '+254 700 000 000', icon: PhoneIcon, keyboardType: 'phone-pad' as const, autoCapitalize: 'none' as const },
            { key: 'email', label: 'Email address', placeholder: 'you@company.co.ke', icon: EnvelopeSimpleIcon, keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
            { key: 'password', label: 'Password', placeholder: 'Choose a strong password', icon: LockIcon, secure: true, autoCapitalize: 'none' as const },
          ].map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={[styles.fieldLabel, dyn.fieldLabel]}>{f.label}</Text>
              <View style={[styles.inputWrap, dyn.inputWrap]}>
                <f.icon size={16} color={t.textMuted} />
                <TextInput
                  style={[styles.input, dyn.input]}
                  placeholder={f.placeholder}
                  placeholderTextColor={t.textMuted}
                  value={(form as any)[f.key]}
                  onChangeText={set(f.key)}
                  secureTextEntry={f.secure}
                  keyboardType={f.keyboardType ?? 'default'}
                  autoCapitalize={f.autoCapitalize ?? 'sentences'}
                />
              </View>
            </View>
          ))}

          <Pressable
            onPress={handleRegister}
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Creating account…' : 'Create account'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.signInLink}>
            <Text style={styles.signInLinkText}>Already have an account? Sign in</Text>
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
  signInLink: {
    alignItems: 'center',
    paddingTop: 18,
  },
  signInLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.amber[600],
    fontWeight: '500',
  },
});
