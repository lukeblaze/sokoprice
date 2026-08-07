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
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRightIcon } from 'phosphor-react-native';
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

const LOOP_INTERVAL = 4200;
const TRANSITION_MS = 750;

// Fractal-noise film-grain texture, layered over the whole hero for a
// premium, non-flat surface instead of a plain color fill.
const GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

const SWAY_KEYFRAMES_ID = 'sokoprice-sway-keyframes';

function injectSwayKeyframes() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(SWAY_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = SWAY_KEYFRAMES_ID;
  style.textContent = `
    @keyframes sokoprice-sway {
      0%, 100% { transform: perspective(900px) rotateY(-8deg) translateY(0px); }
      50% { transform: perspective(900px) rotateY(8deg) translateY(-6px); }
    }
  `;
  document.head.appendChild(style);
}

type Role = 'center' | 'left' | 'right' | 'back';

function roleStyle(role: Role, isMobile: boolean) {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '58%' : '90%',
        bottom: isMobile ? '24%' : '2%',
        scale: isMobile ? 1.2 : 1.6,
        blur: 0,
        opacity: 1,
        zIndex: 20,
        shadow: 0.5,
      };
    case 'left':
      return {
        left: isMobile ? '14%' : '26%',
        height: isMobile ? '15%' : '26%',
        bottom: isMobile ? '30%' : '14%',
        scale: 1,
        blur: 3,
        opacity: 0.7,
        zIndex: 10,
        shadow: 0.25,
      };
    case 'right':
      return {
        left: isMobile ? '86%' : '74%',
        height: isMobile ? '15%' : '26%',
        bottom: isMobile ? '30%' : '14%',
        scale: 1,
        blur: 3,
        opacity: 0.7,
        zIndex: 10,
        shadow: 0.25,
      };
    case 'back':
      return {
        left: '50%',
        height: isMobile ? '12%' : '20%',
        bottom: isMobile ? '30%' : '14%',
        scale: 1,
        blur: 6,
        opacity: 0.9,
        zIndex: 5,
        shadow: 0.15,
      };
  }
}

function SlideFigure({
  role,
  src,
  isMobile,
}: {
  role: Role;
  src: string;
  isMobile: boolean;
}) {
  const rs = roleStyle(role, isMobile);
  const itemWidth = isMobile ? 118 : 170;
  const blurStyle = Platform.OS === 'web' && rs.blur > 0
    ? ({ filter: `blur(${rs.blur}px)` } as any)
    : {};
  const webTransition = Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, filter, opacity, left, bottom, height',
        transitionDuration: `${TRANSITION_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
      } as any)
    : {};

  // Continuous "living figurine" sway on the center slot — plain CSS
  // @keyframes (see injectSwayKeyframes below) rather than a JS-driven
  // animation, since it only needs to run on web and CSS handles an
  // infinite loop more cheaply than re-rendering every frame.
  const swayStyle = Platform.OS === 'web' && role === 'center'
    ? ({
        animationName: 'sokoprice-sway',
        animationDuration: '4800ms',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      } as any)
    : undefined;

  return (
    <View
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
      {/* Grounding shadow — sells the "object floating in space" read */}
      <View style={[styles.floorShadow, { opacity: rs.shadow, width: itemWidth * 0.8, left: itemWidth * 0.1 }]} />
      <View style={[styles.slideImageWrap, swayStyle]}>
        <Image source={{ uri: src }} style={styles.slideImage} resizeMode="contain" />
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimating = useRef(false);
  const completeOnboarding = useAppStore(s => s.completeOnboarding);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    injectSwayKeyframes();
    SLIDES.forEach(s => { const img = new (window as any).Image(); img.src = s.src; });
  }, []);

  // Fully automatic loop — no manual controls driving the carousel.
  useEffect(() => {
    const id = setInterval(() => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      setActiveIndex(prev => (prev + 1) % SLIDES.length);
      setTimeout(() => { isAnimating.current = false; }, TRANSITION_MS);
    }, LOOP_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const roles: Record<number, Role> = {
    [activeIndex]: 'center',
    [(activeIndex + 3) % 4]: 'left',
    [(activeIndex + 1) % 4]: 'right',
    [(activeIndex + 2) % 4]: 'back',
  };

  const slide = SLIDES[activeIndex];
  const bgTransition = Platform.OS === 'web'
    ? ({ transition: `background-color ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)` } as any)
    : {};

  return (
    <View style={[styles.screen, { backgroundColor: slide.bg }, bgTransition]}>
      <Head>
        <title>SokoPrice — Compare vendor prices in Nairobi</title>
        <meta name="description" content="The fastest way to compare prices across Nairobi vendors, track trends, and never overpay again." />
      </Head>

      {/* Grain texture */}
      {Platform.OS === 'web' && (
        <View
          pointerEvents="none"
          style={[
            styles.grain,
            { backgroundImage: `url("${GRAIN_DATA_URI}")`, backgroundSize: '200px 200px' } as any,
          ]}
        />
      )}

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

      {/* Carousel — auto-looping, no manual nav */}
      <View style={styles.carousel} pointerEvents="none">
        {SLIDES.map((s, i) => (
          <SlideFigure key={s.src} role={roles[i]} src={s.src} isMobile={isMobile} />
        ))}
      </View>

      {/* Bottom gradient scrim for text legibility */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.35)']}
        style={styles.bottomScrim}
      />

      {/* Bottom-left caption + loop progress */}
      <View style={styles.bottomLeft}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.slideTitle}>{slide.title.toUpperCase()}</Text>
        {!isMobile && <Text style={styles.slideCaption}>{slide.caption}</Text>}
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
  grain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
    zIndex: 50,
  },
  ghostWrap: {
    position: 'absolute',
    top: '14%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  ghostText: {
    fontSize: 130,
    fontFamily: 'Anton_400Regular',
    color: 'rgba(255,255,255,0.16)',
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
  slideImageWrap: {
    width: '100%',
    height: '100%',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.lg,
  },
  floorShadow: {
    position: 'absolute',
    bottom: -6,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...(Platform.OS === 'web' ? ({ filter: 'blur(8px)' } as any) : {}),
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
    zIndex: 4,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    maxWidth: 340,
    zIndex: 60,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 30,
    backgroundColor: colors.amber[400],
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
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 30,
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
