import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  StorefrontIcon,
  TagIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  WhatsappLogoIcon,
  GlobeIcon,
  ClockIcon,
  TextAlignLeftIcon,
} from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { colors, radii, typography } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useVendor, useCreateVendor, useUpdateVendor } from '@/hooks/useQueries';
import { PickerSheet, type PickerSheetHandle } from '@/components/common/PickerSheet';
import { LoadingSpinner } from '@/components/common';
import type { VendorBadge } from '@/types';

const BADGE_OPTIONS: VendorBadge[] = ['New', 'Verified', 'Trusted', 'Premium'];
const SWATCHES = ['#1a3a5c', '#0d1b2a', '#b45309', '#166534', '#7c2d12', '#4c1d95'];

interface FormState {
  name: string;
  category: string;
  description: string;
  location: string;
  area: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  openingHours: string;
  badge: VendorBadge;
  isVerified: boolean;
  colorHex: string;
}

const EMPTY_FORM: FormState = {
  name: '', category: '', description: '', location: '', area: '',
  phone: '', email: '', whatsapp: '', website: '', openingHours: '',
  badge: 'New', isVerified: false, colorHex: SWATCHES[0],
};

export default function VendorFormScreen() {
  const insets = useSafeAreaInsets();
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    back: { backgroundColor: t.surfaceAlt },
    title: { color: t.textPrimary },
    subtitle: { color: t.textSecondary },
    form: { backgroundColor: t.surface, borderColor: t.border },
    fieldLabel: { color: t.textPrimary },
    inputWrap: { backgroundColor: t.surfaceAlt, borderColor: t.border },
    input: { color: t.textPrimary },
    pickerRow: { backgroundColor: t.surfaceAlt, borderColor: t.border },
    pickerText: { color: t.textPrimary },
    switchRow: { backgroundColor: t.surfaceAlt },
  }), [t]);

  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { data: existingVendor, isLoading: loadingVendor } = useVendor(id ?? '');
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const badgeSheet = useRef<PickerSheetHandle>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [hydrated, setHydrated] = useState(!isEdit);

  useEffect(() => {
    if (isEdit && existingVendor && !hydrated) {
      setForm({
        name: existingVendor.name,
        category: existingVendor.category,
        description: existingVendor.description,
        location: existingVendor.location,
        area: existingVendor.area,
        phone: existingVendor.phone ?? '',
        email: existingVendor.email ?? '',
        whatsapp: existingVendor.whatsapp ?? '',
        website: existingVendor.website ?? '',
        openingHours: existingVendor.openingHours,
        badge: existingVendor.badge,
        isVerified: existingVendor.isVerified,
        colorHex: existingVendor.colorHex,
      });
      setHydrated(true);
    }
  }, [isEdit, existingVendor, hydrated]);

  const set = (key: keyof FormState) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const saving = createVendor.isPending || updateVendor.isPending;
  const canSubmit = form.name.trim().length > 0 && form.category.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const patch = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      area: form.area.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      website: form.website.trim() || undefined,
      openingHours: form.openingHours.trim(),
      badge: form.badge,
      isVerified: form.isVerified,
      colorHex: form.colorHex,
    };

    if (isEdit && id) {
      updateVendor.mutate({ id, patch }, {
        onSuccess: () => {
          showMessage({ message: `${patch.name} updated`, type: 'success' });
          router.back();
        },
        onError: () => showMessage({ message: 'Could not update vendor', type: 'danger' }),
      });
    } else {
      createVendor.mutate(patch, {
        onSuccess: () => {
          showMessage({ message: `${patch.name} added`, type: 'success' });
          router.back();
        },
        onError: () => showMessage({ message: 'Could not add vendor', type: 'danger' }),
      });
    }
  };

  if (isEdit && loadingVendor && !hydrated) {
    return (
      <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const fields: Array<{
    key: keyof FormState; label: string; placeholder: string; icon: typeof StorefrontIcon;
    keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'url';
    multiline?: boolean;
  }> = [
    { key: 'name', label: 'Vendor name', placeholder: 'e.g. MS Computers & Wholesalers', icon: StorefrontIcon },
    { key: 'category', label: 'Category', placeholder: 'e.g. IT hardware & peripherals', icon: TagIcon },
    { key: 'description', label: 'Description', placeholder: 'What does this vendor sell or specialize in?', icon: TextAlignLeftIcon, multiline: true },
    { key: 'location', label: 'Location', placeholder: 'e.g. Nairobi CBD', icon: MapPinIcon },
    { key: 'area', label: 'Area', placeholder: 'e.g. CBD, Westlands, Kilimani', icon: MapPinIcon },
    { key: 'phone', label: 'Phone', placeholder: '+254 700 000 000', icon: PhoneIcon, keyboardType: 'phone-pad' },
    { key: 'email', label: 'Email', placeholder: 'sales@vendor.co.ke', icon: EnvelopeSimpleIcon, keyboardType: 'email-address' },
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '+254 700 000 000', icon: WhatsappLogoIcon, keyboardType: 'phone-pad' },
    { key: 'website', label: 'Website', placeholder: 'https://vendor.co.ke', icon: GlobeIcon, keyboardType: 'url' },
    { key: 'openingHours', label: 'Opening hours', placeholder: 'Mon–Fri 8:00–18:00', icon: ClockIcon },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}
    >
      <Head>
        <title>{isEdit ? 'Edit Vendor' : 'Add Vendor'} — SokoPrice Admin</title>
        <meta name="description" content="Add or edit a vendor listing on SokoPrice." />
      </Head>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.centerCol}>
          <Pressable onPress={() => router.back()} style={[styles.back, dyn.back]}>
            <ArrowLeftIcon size={20} color={t.textPrimary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, dyn.title]}>{isEdit ? 'Edit vendor' : 'Add vendor'}</Text>
            <Text style={[styles.subtitle, dyn.subtitle]}>
              {isEdit ? 'Update this vendor\'s listing details.' : 'List a new vendor on SokoPrice.'}
            </Text>
          </View>

          <View style={[styles.form, dyn.form]}>
            {fields.map(f => (
              <View key={f.key} style={styles.field}>
                <Text style={[styles.fieldLabel, dyn.fieldLabel]}>{f.label}</Text>
                <View style={[styles.inputWrap, dyn.inputWrap, f.multiline && styles.inputWrapMultiline]}>
                  <f.icon size={16} color={t.textMuted} />
                  <TextInput
                    style={[styles.input, dyn.input, f.multiline && styles.inputMultiline]}
                    placeholder={f.placeholder}
                    placeholderTextColor={t.textMuted}
                    value={form[f.key] as string}
                    onChangeText={set(f.key)}
                    keyboardType={f.keyboardType === 'url' ? 'default' : (f.keyboardType ?? 'default')}
                    autoCapitalize={f.key === 'email' || f.key === 'website' || f.key === 'whatsapp' || f.key === 'phone' ? 'none' : 'sentences'}
                    multiline={f.multiline}
                    numberOfLines={f.multiline ? 3 : 1}
                  />
                </View>
              </View>
            ))}

            {/* Badge picker */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, dyn.fieldLabel]}>Badge</Text>
              <Pressable onPress={() => badgeSheet.current?.present()} style={[styles.pickerRow, dyn.pickerRow]}>
                <Text style={[styles.pickerText, dyn.pickerText]}>{form.badge}</Text>
              </Pressable>
            </View>

            {/* Verified toggle */}
            <View style={[styles.switchRow, dyn.switchRow]}>
              <Text style={[styles.fieldLabel, dyn.fieldLabel]}>Verified vendor</Text>
              <Switch
                value={form.isVerified}
                onValueChange={v => setForm(f => ({ ...f, isVerified: v }))}
                trackColor={{ false: t.border, true: colors.amber[400] }}
                thumbColor={colors.white}
              />
            </View>

            {/* Color swatches */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, dyn.fieldLabel]}>Avatar color</Text>
              <View style={styles.swatchRow}>
                {SWATCHES.map(hex => (
                  <Pressable
                    key={hex}
                    onPress={() => setForm(f => ({ ...f, colorHex: hex }))}
                    style={[
                      styles.swatch,
                      { backgroundColor: hex },
                      form.colorHex === hex && styles.swatchActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              style={[styles.submitBtn, (!canSubmit || saving) && { opacity: 0.6 }]}
              disabled={!canSubmit || saving}
            >
              <Text style={styles.submitBtnText}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add vendor'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <PickerSheet
        ref={badgeSheet}
        title="Badge"
        options={BADGE_OPTIONS.map(b => ({ label: b, value: b }))}
        value={form.badge}
        onSelect={v => setForm(f => ({ ...f, badge: v as VendorBadge }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  centerCol: {
    width: '100%',
    maxWidth: 480,
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
  header: { marginBottom: 20 },
  title: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.displayFont,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginTop: 4,
  },
  form: {
    borderRadius: radii.xl,
    borderWidth: 0.5,
    padding: 20,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: radii.md,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrapMultiline: {
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerRow: {
    borderRadius: radii.md,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: colors.amber[400],
  },
  submitBtn: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.navy[800],
  },
});
