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
import { useThemeColors } from '@/hooks/useThemeColors';

interface Slide {
  src: string;
  title: string;
  caption: string;
  aspect: number; // width / height, so the box doesn't distort the cutout
}

// Real product cutouts (transparent PNGs) so the carousel reads as
// floating 3D objects instead of framed photographs.
const SLIDES: Slide[] = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/MacBook_Pro_transparency.png',
    title: 'Compare prices instantly',
    caption: 'See real prices from every vendor in Nairobi side by side — no more guessing, no more overpaying.',
    aspect: 800 / 643,
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/GalaxyA80Phone_Transparent.png',
    title: 'Real vendors, real deals',
    caption: 'Verified sellers list their stock in minutes and reach thousands of buyers across the city.',
    aspect: 334 / 711,
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Roccat_Kova.png/960px-Roccat_Kova.png',
    title: 'Track every price move',
    caption: '30-day trend charts show you exactly when a price is worth jumping on.',
    aspect: 960 / 620,
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/TP-Link_WR841ND_WiFi_router_transparent.png',
    title: 'Never miss a drop',
    caption: 'Set an alert once — we’ll ping you the moment your price hits.',
    aspect: 1526 / 1426,
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
      0%, 100% { transform: perspective(1100px) rotateY(-9deg) translateY(0px); }
      50% { transform: perspective(1100px) rotateY(9deg) translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
}

type Role = 'center' | 'left' | 'right' | 'back';

// Center is enlarged dramatically so the object dominates the screen,
// like the reference site — side/back slots stay small and receded.
function roleStyle(role: Role, isMobile: boolean) {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '78%' : '104%',
        bottom: isMobile ? '15%' : '-4%',
        blur: 0,
        opacity: 1,
        zIndex: 20,
        shadow: 0.55,
      };
    case 'left':
      return {
        left: isMobile ? '10%' : '20%',
        height: isMobile ? '16%' : '24%',
        bottom: isMobile ? '32%' : '16%',
        blur: 3,
        opacity: 0.6,
        zIndex: 10,
        shadow: 0.22,
      };
    case 'right':
      return {
        left: isMobile ? '90%' : '80%',
        height: isMobile ? '16%' : '24%',
        bottom: isMobile ? '32%' : '16%',
        blur: 3,
        opacity: 0.6,
        zIndex: 10,
        shadow: 0.22,
      };
    case 'back':
      return {
        left: '50%',
        height: isMobile ? '13%' : '19%',
        bottom: isMobile ? '32%' : '16%',
        blur: 6,
        opacity: 0.85,
        zIndex: 5,
        shadow: 0.12,
      };
  }
}

function SlideFigure({
  role,
  src,
  aspect,
  isMobile,
}: {
  role: Role;
  src: string;
  aspect: number;
  isMobile: boolean;
}) {
  const rs = roleStyle(role, isMobile);
  const blurStyle = Platform.OS === 'web' && rs.blur > 0
    ? ({ filter: `blur(${rs.blur}px)` } as any)
    : {};
  const webTransition = Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, filter, opacity, left, bottom, height, width',
        transitionDuration: `${TRANSITION_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
      } as any)
    : {};

  // Continuous "living object" sway on the center slot — plain CSS
  // @keyframes (see injectSwayKeyframes below) rather than a JS-driven
  // animation, since it only needs to run on web and CSS handles an
  // infinite loop more cheaply than re-rendering every frame.
  const swayStyle = Platform.OS === 'web' && role === 'center'
    ? ({
        animationName: 'sokoprice-sway',
        animationDuration: '5200ms',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      } as any)
    : undefined;

  // Height is a screen-relative percentage (set by role); width derives
  // from the image's real aspect ratio via `aspectRatio` so cutouts of
  // very different shapes (a wide laptop vs. a tall phone) both sit
  // naturally instead of stretching to fill a fixed box.
  return (
    <View
      style={[
        styles.slideItem,
        {
          left: rs.left as any,
          height: rs.height as any,
          bottom: rs.bottom as any,
          aspectRatio: aspect,
          opacity: rs.opacity,
          zIndex: rs.zIndex,
        },
        blurStyle,
        webTransition,
      ]}
    >
      {/* Grounding shadow — sells the "object floating in space" read */}
      <View style={[styles.floorShadow, { opacity: rs.shadow }]} />
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
  const t = useThemeColors();

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
  const scrimColor = t.isDark ? 'rgba(4,10,24,0.6)' : 'rgba(249,250,251,0.92)';
  const ghostColor = t.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.07)';
  const bgTransition = Platform.OS === 'web'
    ? ({ transition: `background-color ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)` } as any)
    : {};

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }, bgTransition]}>
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
            { backgroundImage: `url("${GRAIN_DATA_URI}")`, backgroundSize: '200px 200px', opacity: t.isDark ? 0.4 : 0.18 } as any,
          ]}
        />
      )}

      {/* Giant ghost brand text */}
      <View style={styles.ghostWrap} pointerEvents="none">
        <Text
          style={[
            styles.ghostText,
            { color: ghostColor },
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
      <Text style={[styles.brandLabel, { color: t.textPrimary }]}>SOKOPRICE</Text>

      {/* Top-right sign-in link */}
      <Pressable onPress={() => { completeOnboarding(); router.push('/(auth)/login'); }} style={[styles.signInLink, { borderColor: t.border }]}>
        <Text style={[styles.signInText, { color: t.textPrimary }]}>Sign in</Text>
      </Pressable>

      {/* Carousel — auto-looping, no manual nav */}
      <View style={styles.carousel} pointerEvents="none">
        {SLIDES.map((s, i) => (
          <SlideFigure key={s.src} role={roles[i]} src={s.src} aspect={s.aspect} isMobile={isMobile} />
        ))}
      </View>

      {/* Bottom gradient scrim for text legibility */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', scrimColor]}
        style={styles.bottomScrim}
      />

      {/* Bottom-left caption + loop progress */}
      <View style={styles.bottomLeft}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: t.border }, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
        <Text style={[styles.slideTitle, { color: t.textPrimary }]}>{slide.title.toUpperCase()}</Text>
        {!isMobile && <Text style={[styles.slideCaption, { color: t.textSecondary }]}>{slide.caption}</Text>}
      </View>

      {/* Bottom-right CTA */}
      <Pressable onPress={() => { completeOnboarding(); router.push('/(auth)/register'); }} style={styles.ctaWrap}>
        {({ hovered }) => (
          <>
            <Text style={[styles.ctaText, { color: t.textPrimary }, hovered && { opacity: 1 }]}>Get started</Text>
            <ArrowRightIcon size={22} color={t.textPrimary} weight="bold" />
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
    letterSpacing: -2,
  },
  brandLabel: {
    position: 'absolute',
    top: 24,
    left: 20,
    fontSize: 12,
    fontWeight: '700',
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
  },
  signInText: {
    fontSize: 13,
    fontWeight: '600',
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
    transform: [{ translateX: '-50%' as any }],
  },
  slideImageWrap: {
    width: '100%',
    height: '100%',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  floorShadow: {
    position: 'absolute',
    bottom: '2%',
    left: '15%',
    width: '70%',
    height: '4%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...(Platform.OS === 'web' ? ({ filter: 'blur(10px)' } as any) : {}),
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
  },
  dotActive: {
    width: 30,
    backgroundColor: colors.amber[400],
  },
  slideTitle: {
    fontSize: 26,
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  slideCaption: {
    fontSize: 13,
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
    letterSpacing: -0.5,
    opacity: 0.95,
  },
});
