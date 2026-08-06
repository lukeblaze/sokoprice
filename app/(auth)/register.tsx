import React, { useState } from 'react';
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
import { colors, radii, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAppStore(s => s.signIn);
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
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
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
        <title>Create Account — SokoPrice</title>
        <meta name="description" content="Create a free SokoPrice account to start comparing vendor prices in Nairobi." />
      </Head>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ArrowLeftIcon size={20} color={colors.white} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start tracking Nairobi market prices</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {[
            { key: 'name', label: 'Your name', placeholder: 'Blaze Murimi', icon: UserIcon, autoCapitalize: 'words' as const },
            { key: 'businessName', label: 'Business name', placeholder: 'Blaze Solutions Ltd', icon: BuildingsIcon, autoCapitalize: 'words' as const },
            { key: 'phone', label: 'Phone (M-Pesa)', placeholder: '+254 700 000 000', icon: PhoneIcon, keyboardType: 'phone-pad' as const, autoCapitalize: 'none' as const },
            { key: 'email', label: 'Email address', placeholder: 'you@company.co.ke', icon: EnvelopeSimpleIcon, keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
            { key: 'password', label: 'Password', placeholder: 'Choose a strong password', icon: LockIcon, secure: true, autoCapitalize: 'none' as const },
          ].map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={styles.inputWrap}>
                <f.icon size={16} color={colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.gray[300]}
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
  back: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.displayFont,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 6,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: 24,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 7,
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
  submitBtn: {
    backgroundColor: colors.navy[800],
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
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
