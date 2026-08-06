import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { ArrowLeftIcon, ArrowRightIcon } from 'phosphor-react-native';
import { colors, radii } from '@/theme/tokens';
import { useAppStore } from '@/store';

interface Slide {
  src: string;
  bg: string;
  title: string;
  caption: string;
}

const SLIDES: Slide[] = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/HP_Pavilion_dv2000_laptop.jpg/960px-HP_Pavilion_dv2000_laptop.jpg',
    bg: colors.navy[800],
    title: 'Compare prices instantly',
    caption: 'See real prices from every vendor in Nairobi side by side — no more guessing, no more overpaying.',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Tanzanian_lady_fixing_electronics_staff.jpg/960px-Tanzanian_lady_fixing_electronics_staff.jpg',
    bg: colors.amber[700],
    title: 'Real vendors, real deals',
    caption: 'Verified sellers list their stock in minutes and reach thousands of buyers across the city.',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/45/LED_Screen_Computer.jpg',
    bg: colors.green[600],
    title: 'Track every price move',
    caption: '30-day trend charts show you exactly when a price is worth jumping on.',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/APC_Back-UPS_ES525.jpg/960px-APC_Back-UPS_ES525.jpg',
    bg: colors.navy[700],
    title: 'Never miss a drop',
    caption: 'Set an alert once — we’ll ping you the moment your price hits.',
  },
];

type Role = 'center' | 'left' | 'right' | 'back';

function roleStyle(role: Role, isMobile: boolean) {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '60%' : '92%',
        bottom: isMobile ? '22%' : 0,
        scale: isMobile ? 1.25 : 1.68,
        blur: 0,
        opacity: 1,
        zIndex: 20,
      };
    case 'left':
      return {
        left: isMobile ? '20%' : '30%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        scale: 1,
        blur: 2,
        opacity: 0.85,
        zIndex: 10,
      };
    case 'right':
      return {
        left: isMobile ? '80%' : '70%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        scale: 1,
        blur: 2,
        opacity: 0.85,
        zIndex: 10,
      };
    case 'back':
      return {
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '32%' : '12%',
        scale: 1,
        blur: 4,
        opacity: 1,
        zIndex: 5,
      };
  }
}

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimating = useRef(false);
  const completeOnboarding = useAppStore(s => s.completeOnboarding);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    SLIDES.forEach(s => { const img = new (window as any).Image(); img.src = s.src; });
  }, []);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setActiveIndex(prev => (dir === 'next' ? (prev + 1) % 4 : (prev + 3) % 4));
    setTimeout(() => { isAnimating.current = false; }, 650);
  };

  const roles: Record<number, Role> = {
    [activeIndex]: 'center',
    [(activeIndex + 3) % 4]: 'left',
    [(activeIndex + 1) % 4]: 'right',
    [(activeIndex + 2) % 4]: 'back',
  };

  const slide = SLIDES[activeIndex];
  const webTransition = Platform.OS === 'web'
    ? ({ transitionProperty: 'transform, filter, opacity, left, bottom, height', transitionDuration: '650ms', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' } as any)
    : {};

  return (
    <View style={[styles.screen, { backgroundColor: slide.bg }, Platform.OS === 'web' ? ({ transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)' } as any) : {}]}>
      <Head>
        <title>SokoPrice — Compare vendor prices in Nairobi</title>
        <meta name="description" content="The fastest way to compare prices across Nairobi vendors, track trends, and never overpay again." />
      </Head>

      {/* Giant ghost brand text */}
      <View style={styles.ghostWrap} pointerEvents="none">
        <Text
          style={[
            styles.ghostText,
            Platform.OS === 'web'
              ? ({ fontSize: 'clamp(48px, 16vw, 220px)' } as any)
              : { fontSize: isMobile ? 56 : 130 },
          ]}
          numberOfLines={1}
        >
          SOKOPRICE
        </Text>
      </View>

      {/* Top-left brand label */}
      <Text style={styles.brandLabel}>SOKOPRICE</Text>

      {/* Top-right sign-in link */}
      <Pressable onPress={() => { completeOnboarding(); router.push('/(auth)/login'); }} style={styles.signInLink}>
        <Text style={styles.signInText}>Sign in</Text>
      </Pressable>

      {/* Carousel */}
      <View style={styles.carousel} pointerEvents="none">
        {SLIDES.map((s, i) => {
          const role = roles[i];
          const rs = roleStyle(role, isMobile);
          const itemWidth = isMobile ? 120 : 160;
          const blurStyle = Platform.OS === 'web' && rs.blur > 0
            ? ({ filter: `blur(${rs.blur}px)` } as any)
            : {};
          return (
            <View
              key={s.src}
              style={[
                styles.slideItem,
                {
                  width: itemWidth,
                  left: rs.left as any,
                  height: rs.height as any,
                  bottom: rs.bottom as any,
                  opacity: rs.opacity,
                  zIndex: rs.zIndex,
                  transform: [{ translateX: -itemWidth / 2 }, { scale: rs.scale }],
                },
                blurStyle,
                webTransition,
              ]}
            >
              <Image source={{ uri: s.src }} style={styles.slideImage} resizeMode="contain" />
            </View>
          );
        })}
      </View>

      {/* Bottom-left caption + nav */}
      <View style={styles.bottomLeft}>
        <Text style={styles.slideTitle}>{slide.title.toUpperCase()}</Text>
        {!isMobile && <Text style={styles.slideCaption}>{slide.caption}</Text>}
        <View style={styles.navRow}>
          <Pressable
            onPress={() => navigate('prev')}
            style={({ hovered }) => [styles.navBtn, hovered && styles.navBtnHovered]}
          >
            <ArrowLeftIcon size={22} color={colors.white} weight="bold" />
          </Pressable>
          <Pressable
            onPress={() => navigate('next')}
            style={({ hovered }) => [styles.navBtn, hovered && styles.navBtnHovered]}
          >
            <ArrowRightIcon size={22} color={colors.white} weight="bold" />
          </Pressable>
        </View>
      </View>

      {/* Bottom-right CTA */}
      <Pressable onPress={() => { completeOnboarding(); router.push('/(auth)/register'); }} style={styles.ctaWrap}>
        {({ hovered }) => (
          <>
            <Text style={[styles.ctaText, hovered && { opacity: 1 }]}>Get started</Text>
            <ArrowRightIcon size={22} color={colors.white} weight="bold" />
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' ? ({ height: '100vh', minHeight: '100vh' } as any) : {}),
  },
  ghostWrap: {
    position: 'absolute',
    top: '16%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  ghostText: {
    fontSize: 130,
    fontFamily: 'Anton_400Regular',
    color: 'rgba(255,255,255,0.14)',
    letterSpacing: -2,
  },
  brandLabel: {
    position: 'absolute',
    top: 24,
    left: 20,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    zIndex: 60,
  },
  signInLink: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 60,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  signInText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  carousel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  slideItem: {
    position: 'absolute',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.lg,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    maxWidth: 340,
    zIndex: 60,
  },
  slideTitle: {
    fontSize: 26,
    fontFamily: 'Anton_400Regular',
    color: colors.white,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  slideCaption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 18,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnHovered: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    zIndex: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    fontSize: 28,
    fontFamily: 'Anton_400Regular',
    color: colors.white,
    letterSpacing: -0.5,
    opacity: 0.95,
  },
});
