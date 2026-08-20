import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  BuildingsIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
} from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { colors, radii, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBreakpoint } from '@/hooks/useResponsive';
import { authApi } from '@/api';

type Mode = 'login' | 'signup';

const TURN_MS = 860;
const TURN_KEYFRAMES_ID = 'sokoprice-auth-turn-keyframes';

// The overlay panel's rest position is expressed as translateX(0%) for
// signup (covering the login slot on the left) and translateX(100%)
// for login (covering the signup slot on the right) — one panel-width
// (its own 50%) either way. The two keyframe animations below animate
// between those exact endpoints with a brief rotateY dip mid-transition
// for the "turning page" feel, mirroring the reference technique.
function injectTurnKeyframes() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(TURN_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = TURN_KEYFRAMES_ID;
  style.textContent = `
    @keyframes sokoprice-auth-turn-left {
      0% { transform: translate3d(100%,0,0) rotateY(0deg); }
      20% { transform: translate3d(90%,0,0) rotateY(-2.6deg); }
      50% { transform: translate3d(50%,0,0) rotateY(-4.5deg); }
      80% { transform: translate3d(10%,0,0) rotateY(-2.6deg); }
      100% { transform: translate3d(0,0,0) rotateY(0deg); }
    }
    @keyframes sokoprice-auth-turn-right {
      0% { transform: translate3d(0,0,0) rotateY(0deg); }
      20% { transform: translate3d(10%,0,0) rotateY(2.6deg); }
      50% { transform: translate3d(50%,0,0) rotateY(4.5deg); }
      80% { transform: translate3d(90%,0,0) rotateY(2.6deg); }
      100% { transform: translate3d(100%,0,0) rotateY(0deg); }
    }
  `;
  document.head.appendChild(style);
}

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  icon: typeof UserIcon;
  secure?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

function FormField({
  config,
  value,
  onChangeText,
  dyn,
  t,
  showPassword,
  onTogglePassword,
}: {
  config: FieldConfig;
  value: string;
  onChangeText: (v: string) => void;
  dyn: Record<string, object>;
  t: ReturnType<typeof useThemeColors>;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  const Icon = config.icon;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, dyn.fieldLabel]}>{config.label}</Text>
      <View style={[styles.inputWrap, dyn.inputWrap]}>
        <Icon size={16} color={t.textMuted} />
        <TextInput
          style={[styles.input, dyn.input]}
          placeholder={config.placeholder}
          placeholderTextColor={t.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={config.secure && !showPassword}
          keyboardType={config.keyboardType ?? 'default'}
          autoCapitalize={config.autoCapitalize ?? 'sentences'}
        />
        {config.secure && onTogglePassword && (
          <Pressable onPress={onTogglePassword}>
            {showPassword ? <EyeSlashIcon size={16} color={t.textMuted} /> : <EyeIcon size={16} color={t.textMuted} />}
          </Pressable>
        )}
      </View>
    </View>
  );
}

interface AuthScreenProps {
  initialMode: Mode;
}

// Shared login/signup screen — a single card with both forms living
// side by side, toggled by sliding a colored overlay panel across to
// cover whichever form isn't active (desktop web only; mobile/native
// gets a plain single-form-plus-text-toggle fallback, since a 50/50
// split card has no room for form fields at phone widths). `/login` and
// `/register` both render this with a different `initialMode` so
// existing deep links keep working — the in-card toggle itself is a
// local state change, not a navigation.
export default function AuthScreen({ initialMode }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const signIn = useAppStore(s => s.signIn);
  const t = useThemeColors();
  const { isDesktop } = useBreakpoint();
  const isWeb = Platform.OS === 'web';
  const isSplit = isWeb && isDesktop;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const animDirection = useRef<'toSignup' | 'toLogin'>(initialMode === 'signup' ? 'toSignup' : 'toLogin');

  useEffect(() => { injectTurnKeyframes(); }, []);

  const flipTo = (next: Mode) => {
    if (next === mode || isAnimating) return;
    animDirection.current = next === 'signup' ? 'toSignup' : 'toLogin';
    setMode(next);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), TURN_MS);
  };

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

  // ---- Login form state ----
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) {
      showMessage({ message: 'Enter your email and password', type: 'warning' });
      return;
    }
    setLoginLoading(true);
    try {
      const user = await authApi.login(loginEmail.trim(), loginPassword);
      signIn(user);
      router.replace('/(tabs)');
    } catch (err) {
      showMessage({ message: err instanceof Error ? err.message : 'Sign in failed', type: 'danger' });
    } finally {
      setLoginLoading(false);
    }
  };

  // ---- Signup form state ----
  const [signupForm, setSignupForm] = useState({ name: '', businessName: '', phone: '', email: '', password: '' });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const setSignupField = (key: string) => (val: string) => setSignupForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.password) {
      showMessage({ message: 'Fill in your name, email, and password', type: 'warning' });
      return;
    }
    setSignupLoading(true);
    try {
      const user = await authApi.register({
        name: signupForm.name.trim(),
        businessName: signupForm.businessName.trim() || undefined,
        phone: signupForm.phone.trim() || undefined,
        email: signupForm.email.trim(),
        password: signupForm.password,
      });
      signIn(user);
      router.replace('/(tabs)');
    } catch (err) {
      showMessage({ message: err instanceof Error ? err.message : 'Registration failed', type: 'danger' });
    } finally {
      setSignupLoading(false);
    }
  };

  const LOGIN_FIELDS: FieldConfig[] = [
    { key: 'email', label: 'Email address', placeholder: 'you@company.co.ke', icon: EnvelopeSimpleIcon, keyboardType: 'email-address', autoCapitalize: 'none' },
    { key: 'password', label: 'Password', placeholder: 'Your password', icon: LockIcon, secure: true, autoCapitalize: 'none' },
  ];
  const SIGNUP_FIELDS: FieldConfig[] = [
    { key: 'name', label: 'Your name', placeholder: 'Blaze Murimi', icon: UserIcon, autoCapitalize: 'words' },
    { key: 'businessName', label: 'Business name', placeholder: 'Blaze Solutions Ltd', icon: BuildingsIcon, autoCapitalize: 'words' },
    { key: 'phone', label: 'Phone (M-Pesa)', placeholder: '+254 700 000 000', icon: PhoneIcon, keyboardType: 'phone-pad', autoCapitalize: 'none' },
    { key: 'email', label: 'Email address', placeholder: 'you@company.co.ke', icon: EnvelopeSimpleIcon, keyboardType: 'email-address', autoCapitalize: 'none' },
    { key: 'password', label: 'Password', placeholder: 'Choose a strong password', icon: LockIcon, secure: true, autoCapitalize: 'none' },
  ];

  function renderLoginFields() {
    return LOGIN_FIELDS.map(f => (
      <FormField
        key={f.key}
        config={f}
        value={f.key === 'email' ? loginEmail : loginPassword}
        onChangeText={f.key === 'email' ? setLoginEmail : setLoginPassword}
        dyn={dyn}
        t={t}
        showPassword={f.secure ? showLoginPassword : undefined}
        onTogglePassword={f.secure ? () => setShowLoginPassword(v => !v) : undefined}
      />
    ));
  }

  function renderSignupFields() {
    return SIGNUP_FIELDS.map(f => (
      <FormField
        key={f.key}
        config={f}
        value={(signupForm as any)[f.key]}
        onChangeText={setSignupField(f.key)}
        dyn={dyn}
        t={t}
        showPassword={f.secure ? showSignupPassword : undefined}
        onTogglePassword={f.secure ? () => setShowSignupPassword(v => !v) : undefined}
      />
    ));
  }

  const overlayAnimationName = animDirection.current === 'toSignup' ? 'sokoprice-auth-turn-left' : 'sokoprice-auth-turn-right';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}
    >
      <Head>
        <title>{mode === 'signup' ? 'Create Account' : 'Sign In'} — SokoPrice</title>
        <meta name="description" content="Sign in or create a free SokoPrice account to compare vendor prices in Nairobi." />
      </Head>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.centerCol, isSplit && styles.centerColSplit]}>
          <Pressable onPress={() => router.back()} style={[styles.back, dyn.back]}>
            <ArrowLeftIcon size={20} color={t.textPrimary} />
          </Pressable>

          {isSplit ? (
            <View style={styles.splitCard}>
              <View style={styles.splitPanel}>
                <Text style={[styles.formTitle, { color: colors.navy[800] }]}>Sign in</Text>
                {renderLoginFields()}
                <Pressable onPress={() => { router.push('/(auth)/forgot-password'); }} style={styles.forgotWrap}>
                  <Text style={styles.forgot}>Forgot password?</Text>
                </Pressable>
                <Pressable
                  onPress={handleLogin}
                  style={[styles.submitBtn, loginLoading && { opacity: 0.7 }]}
                  disabled={loginLoading}
                >
                  <Text style={styles.submitBtnText}>{loginLoading ? 'Signing in…' : 'Sign in'}</Text>
                </Pressable>
              </View>

              <View style={styles.splitPanel}>
                <Text style={[styles.formTitle, { color: colors.navy[800] }]}>Create account</Text>
                {renderSignupFields()}
                <Pressable
                  onPress={handleRegister}
                  style={[styles.submitBtn, signupLoading && { opacity: 0.7 }, { marginTop: 8 }]}
                  disabled={signupLoading}
                >
                  <Text style={styles.submitBtnText}>{signupLoading ? 'Creating account…' : 'Create account'}</Text>
                </Pressable>
              </View>

              {/* Sliding overlay — rest position matches the current
                  mode so there's no snap once a keyframe animation
                  finishes; the keyframe only plays during the brief
                  isAnimating window right after a toggle. */}
              <View
                style={[
                  styles.overlayPanel,
                  {
                    transform: [{ translateX: mode === 'signup' ? '0%' : '100%' }] as any,
                    animationName: isAnimating ? overlayAnimationName : undefined,
                    animationDuration: `${TURN_MS}ms`,
                    animationTimingFunction: 'linear',
                    animationFillMode: 'forwards',
                  } as any,
                ]}
              >
                {mode === 'signup' ? (
                  <>
                    <Text style={styles.overlayTitle}>Already have an account?</Text>
                    <Text style={styles.overlayBody}>Sign in to pick up right where you left off.</Text>
                    <Pressable onPress={() => flipTo('login')} style={styles.overlayBtn}>
                      <ArrowLeftIcon size={16} color={colors.white} weight="bold" />
                      <Text style={styles.overlayBtnText}>Back to sign in</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.overlayTitle}>New here?</Text>
                    <Text style={styles.overlayBody}>Create a free account to start tracking Nairobi market prices.</Text>
                    <Pressable onPress={() => flipTo('signup')} style={styles.overlayBtn}>
                      <Text style={styles.overlayBtnText}>Create account</Text>
                      <ArrowRightIcon size={16} color={colors.white} weight="bold" />
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={[styles.form, dyn.form]}>
              <Text style={[styles.formTitle, dyn.title]}>{mode === 'signup' ? 'Create account' : 'Sign in'}</Text>
              {mode === 'signup' ? renderSignupFields() : renderLoginFields()}
              {mode === 'login' && (
                <Pressable onPress={() => { router.push('/(auth)/forgot-password'); }} style={styles.forgotWrap}>
                  <Text style={styles.forgot}>Forgot password?</Text>
                </Pressable>
              )}
              <Pressable
                onPress={mode === 'signup' ? handleRegister : handleLogin}
                style={[styles.submitBtn, (mode === 'signup' ? signupLoading : loginLoading) && { opacity: 0.7 }]}
                disabled={mode === 'signup' ? signupLoading : loginLoading}
              >
                <Text style={styles.submitBtnText}>
                  {mode === 'signup'
                    ? (signupLoading ? 'Creating account…' : 'Create account')
                    : (loginLoading ? 'Signing in…' : 'Sign in')}
                </Text>
              </Pressable>
              <Pressable onPress={() => flipTo(mode === 'signup' ? 'login' : 'signup')} style={styles.toggleLink}>
                <Text style={styles.toggleLinkText}>
                  {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                </Text>
              </Pressable>
            </View>
          )}
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
  centerColSplit: {
    maxWidth: 760,
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
  formTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFontMedium,
    marginBottom: 18,
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
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 16,
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
  submitBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.white,
  },
  toggleLink: {
    alignItems: 'center',
    paddingTop: 18,
  },
  toggleLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.amber[600],
    fontWeight: '500',
  },
  // Non-split (mobile / native) single-panel form
  form: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 0.5,
    borderColor: 'transparent',
    padding: 20,
  },
  // Split (desktop web) two-panel card
  splitCard: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.white,
    position: 'relative',
  },
  splitPanel: {
    width: '50%',
    padding: 28,
  },
  overlayPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    padding: 32,
    justifyContent: 'center',
    backgroundImage: `linear-gradient(160deg, ${colors.navy[700]}, ${colors.navy[900]})`,
  } as any,
  overlayTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
    marginBottom: 10,
  },
  overlayBody: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    marginBottom: 22,
  },
  overlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  overlayBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.white,
  },
});
