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

// Small "screenshot" of the real app UI, precisely positioned over a
// device photo's screen area (coordinates measured by sampling the
// source image's pixels for the actual on-screen bounding box).
interface ScreenOverlay {
  uri: string;
  top: string;
  left: string;
  width: string;
  height: string;
  clipPath?: string; // web-only — conforms the overlay to an angled (non-rectangular) screen
}

interface Slide {
  src: string;
  title: string;
  caption: string;
  aspect: number; // width / height, so the box doesn't distort the cutout
  screenOverlay?: ScreenOverlay;
}

const HP_LAPTOP_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/HP_Pavilion_dv2000_laptop.jpg/960px-HP_Pavilion_dv2000_laptop.jpg';
const MONITOR_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/4/45/LED_Screen_Computer.jpg';
const ROUTER_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ethernet_switch_Atlantis_A02-F5P_5_ports_backend.jpg/960px-Ethernet_switch_Atlantis_A02-F5P_5_ports_backend.jpg';
const MOUSE_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/A_wireless_computer_mouse.jpg/960px-A_wireless_computer_mouse.jpg';

// Status bar (time/signal/wifi/battery) sits inside the same navy
// header band as the app content, like a real phone screenshot.
const PHONE_UI_SVG = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 320 680'>
  <defs>
    <clipPath id='p-img1'><rect x='32' y='164' width='64' height='64' rx='10'/></clipPath>
    <clipPath id='p-img2'><rect x='32' y='270' width='64' height='64' rx='10'/></clipPath>
    <clipPath id='p-img3'><rect x='32' y='376' width='64' height='64' rx='10'/></clipPath>
  </defs>
  <rect width='320' height='680' fill='#F7F5F0'/>
  <rect width='320' height='76' fill='#0D1B2A'/>
  <text x='16' y='16' font-family='Arial, sans-serif' font-size='10' font-weight='600' fill='#FFFFFF'>9:41</text>
  <rect x='250' y='10' width='3' height='5' fill='#FFFFFF'/>
  <rect x='255' y='7' width='3' height='8' fill='#FFFFFF'/>
  <rect x='260' y='4' width='3' height='11' fill='#FFFFFF'/>
  <rect x='265' y='1' width='3' height='14' fill='#FFFFFF'/>
  <path d='M278 15 a9 9 0 0 1 13 0' stroke='#FFFFFF' stroke-width='1.6' fill='none'/>
  <path d='M281.5 11.5 a4.5 4.5 0 0 1 6 0' stroke='#FFFFFF' stroke-width='1.6' fill='none'/>
  <circle cx='284.5' cy='15.5' r='1.2' fill='#FFFFFF'/>
  <rect x='296' y='5' width='19' height='10' rx='2.5' fill='none' stroke='#FFFFFF' stroke-width='1.2'/>
  <rect x='315' y='8' width='2' height='4' fill='#FFFFFF'/>
  <rect x='298' y='7' width='14' height='6' fill='#FFFFFF'/>
  <text x='20' y='42' font-family='Arial, sans-serif' font-size='10' fill='#FFFFFF' fill-opacity='0.55'>Good morning</text>
  <text x='20' y='62' font-family='Arial, sans-serif' font-size='18' font-weight='700' fill='#FFFFFF'>SokoPrice</text>
  <circle cx='284' cy='46' r='15' fill='#FFFFFF' fill-opacity='0.12'/>
  <circle cx='284' cy='46' r='3' fill='#E8A020'/>
  <rect x='18' y='96' width='284' height='38' rx='19' fill='#FFFFFF'/>
  <circle cx='42' cy='115' r='7' fill='none' stroke='#8E969E' stroke-width='2'/>
  <rect x='18' y='150' width='284' height='92' rx='14' fill='#FFFFFF'/>
  <image xlink:href='${HP_LAPTOP_PHOTO}' x='32' y='164' width='64' height='64' preserveAspectRatio='xMidYMid slice' clip-path='url(#p-img1)'/>
  <text x='108' y='182' font-family='Arial, sans-serif' font-size='13' font-weight='600' fill='#0D1B2A'>HP EliteBook 850</text>
  <text x='108' y='200' font-family='Arial, sans-serif' font-size='10' fill='#8E969E'>6 vendors comparing</text>
  <text x='108' y='222' font-family='Arial, sans-serif' font-size='17' font-weight='700' fill='#E8A020'>KES 68,500</text>
  <rect x='240' y='164' width='46' height='18' rx='9' fill='#E8F5EE'/>
  <text x='248' y='177' font-family='Arial, sans-serif' font-size='9' font-weight='600' fill='#1A7A43'>-3.2%</text>
  <rect x='18' y='256' width='284' height='92' rx='14' fill='#FFFFFF'/>
  <image xlink:href='${MONITOR_PHOTO}' x='32' y='270' width='64' height='64' preserveAspectRatio='xMidYMid slice' clip-path='url(#p-img2)'/>
  <text x='108' y='288' font-family='Arial, sans-serif' font-size='13' font-weight='600' fill='#0D1B2A'>Samsung 27" Monitor</text>
  <text x='108' y='306' font-family='Arial, sans-serif' font-size='10' fill='#8E969E'>4 vendors comparing</text>
  <text x='108' y='328' font-family='Arial, sans-serif' font-size='17' font-weight='700' fill='#E8A020'>KES 24,900</text>
  <rect x='240' y='270' width='46' height='18' rx='9' fill='#FDECEA'/>
  <text x='249' y='283' font-family='Arial, sans-serif' font-size='9' font-weight='600' fill='#C53030'>+1.4%</text>
  <rect x='18' y='362' width='284' height='92' rx='14' fill='#FFFFFF'/>
  <image xlink:href='${ROUTER_PHOTO}' x='32' y='376' width='64' height='64' preserveAspectRatio='xMidYMid slice' clip-path='url(#p-img3)'/>
  <text x='108' y='394' font-family='Arial, sans-serif' font-size='13' font-weight='600' fill='#0D1B2A'>TP-Link Router</text>
  <text x='108' y='412' font-family='Arial, sans-serif' font-size='10' fill='#8E969E'>9 vendors comparing</text>
  <text x='108' y='434' font-family='Arial, sans-serif' font-size='17' font-weight='700' fill='#E8A020'>KES 3,200</text>
  <rect x='240' y='376' width='46' height='18' rx='9' fill='#E8F5EE'/>
  <text x='248' y='389' font-family='Arial, sans-serif' font-size='9' font-weight='600' fill='#1A7A43'>-5.0%</text>
  <rect x='0' y='614' width='320' height='66' fill='#FFFFFF'/>
  <rect x='0' y='614' width='320' height='1' fill='#EDF0F2'/>
  <circle cx='52' cy='647' r='12' fill='#E8A020' fill-opacity='0.15'/>
  <circle cx='52' cy='647' r='4' fill='#E8A020'/>
  <circle cx='126' cy='647' r='4' fill='#D8DCE0'/>
  <circle cx='200' cy='647' r='4' fill='#D8DCE0'/>
  <circle cx='268' cy='647' r='4' fill='#D8DCE0'/>
</svg>`;

// Browser window chrome (traffic-light controls + address bar) across
// the top, like a real browser tab showing the site — then the same
// desktop layout below it.
const LAPTOP_UI_SVG = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 500 300'>
  <defs>
    <clipPath id='l-img1'><rect x='124' y='102' width='50' height='50' rx='8'/></clipPath>
    <clipPath id='l-img2'><rect x='316' y='102' width='50' height='50' rx='8'/></clipPath>
    <clipPath id='l-img3'><rect x='124' y='208' width='50' height='50' rx='8'/></clipPath>
    <clipPath id='l-img4'><rect x='316' y='208' width='50' height='50' rx='8'/></clipPath>
  </defs>
  <rect width='500' height='24' fill='#E8ECF0'/>
  <circle cx='14' cy='12' r='4' fill='#E53E3E'/>
  <circle cx='28' cy='12' r='4' fill='#E8A020'/>
  <circle cx='42' cy='12' r='4' fill='#2D9E5F'/>
  <rect x='70' y='5' width='360' height='14' rx='7' fill='#FFFFFF'/>
  <text x='84' y='15' font-family='Arial, sans-serif' font-size='8' fill='#4A5568'>sokoprice.co.ke</text>
  <rect y='24' width='500' height='276' fill='#F7F5F0'/>
  <rect y='24' width='92' height='276' fill='#0D1B2A'/>
  <rect x='18' y='44' width='24' height='24' rx='6' fill='#E8A020'/>
  <text x='18' y='90' font-family='Arial, sans-serif' font-size='11' font-weight='700' fill='#FFFFFF'>SokoPrice</text>
  <rect x='14' y='116' width='64' height='26' rx='7' fill='#E8A020'/>
  <rect x='14' y='152' width='64' height='26' rx='7' fill='#FFFFFF' fill-opacity='0.08'/>
  <rect x='14' y='188' width='64' height='26' rx='7' fill='#FFFFFF' fill-opacity='0.08'/>
  <rect x='14' y='224' width='64' height='26' rx='7' fill='#FFFFFF' fill-opacity='0.08'/>
  <rect x='112' y='44' width='280' height='28' rx='14' fill='#FFFFFF'/>
  <circle cx='132' cy='58' r='6' fill='none' stroke='#8E969E' stroke-width='1.6'/>
  <rect x='112' y='90' width='180' height='94' rx='12' fill='#FFFFFF'/>
  <image xlink:href='${HP_LAPTOP_PHOTO}' x='124' y='102' width='50' height='50' preserveAspectRatio='xMidYMid slice' clip-path='url(#l-img1)'/>
  <text x='184' y='116' font-family='Arial, sans-serif' font-size='10' font-weight='600' fill='#0D1B2A'>HP EliteBook</text>
  <text x='184' y='130' font-family='Arial, sans-serif' font-size='13' font-weight='700' fill='#E8A020'>68,500</text>
  <rect x='124' y='164' width='40' height='14' rx='7' fill='#E8F5EE'/>
  <text x='130' y='174' font-family='Arial, sans-serif' font-size='8' font-weight='600' fill='#1A7A43'>-3.2%</text>
  <rect x='304' y='90' width='180' height='94' rx='12' fill='#FFFFFF'/>
  <image xlink:href='${MONITOR_PHOTO}' x='316' y='102' width='50' height='50' preserveAspectRatio='xMidYMid slice' clip-path='url(#l-img2)'/>
  <text x='376' y='116' font-family='Arial, sans-serif' font-size='10' font-weight='600' fill='#0D1B2A'>27" Monitor</text>
  <text x='376' y='130' font-family='Arial, sans-serif' font-size='13' font-weight='700' fill='#E8A020'>24,900</text>
  <rect x='316' y='164' width='40' height='14' rx='7' fill='#FDECEA'/>
  <text x='323' y='174' font-family='Arial, sans-serif' font-size='8' font-weight='600' fill='#C53030'>+1.4%</text>
  <rect x='112' y='196' width='180' height='94' rx='12' fill='#FFFFFF'/>
  <image xlink:href='${ROUTER_PHOTO}' x='124' y='208' width='50' height='50' preserveAspectRatio='xMidYMid slice' clip-path='url(#l-img3)'/>
  <text x='184' y='222' font-family='Arial, sans-serif' font-size='10' font-weight='600' fill='#0D1B2A'>TP-Link Router</text>
  <text x='184' y='236' font-family='Arial, sans-serif' font-size='13' font-weight='700' fill='#E8A020'>3,200</text>
  <rect x='124' y='270' width='40' height='14' rx='7' fill='#E8F5EE'/>
  <text x='130' y='280' font-family='Arial, sans-serif' font-size='8' font-weight='600' fill='#1A7A43'>-5.0%</text>
  <rect x='304' y='196' width='180' height='94' rx='12' fill='#FFFFFF'/>
  <image xlink:href='${MOUSE_PHOTO}' x='316' y='208' width='50' height='50' preserveAspectRatio='xMidYMid slice' clip-path='url(#l-img4)'/>
  <text x='376' y='222' font-family='Arial, sans-serif' font-size='10' font-weight='600' fill='#0D1B2A'>Roccat Mouse</text>
  <text x='376' y='236' font-family='Arial, sans-serif' font-size='13' font-weight='700' fill='#E8A020'>4,500</text>
  <rect x='316' y='270' width='40' height='14' rx='7' fill='#E8F5EE'/>
  <text x='323' y='280' font-family='Arial, sans-serif' font-size='8' font-weight='600' fill='#1A7A43'>-2.1%</text>
</svg>`;

const PHONE_UI_DATA_URI = `data:image/svg+xml,${encodeURIComponent(PHONE_UI_SVG)}`;
const LAPTOP_UI_DATA_URI = `data:image/svg+xml,${encodeURIComponent(LAPTOP_UI_SVG)}`;

// Real product cutouts (transparent PNGs) so the carousel reads as
// floating 3D objects instead of framed photographs.
const SLIDES: Slide[] = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/MacBook_Pro_transparency.png',
    title: 'Compare prices instantly',
    caption: 'See real prices from every vendor in Nairobi side by side — no more guessing, no more overpaying.',
    aspect: 800 / 643,
    // Screen measured by pixel-sampling the source photo: a trapezoid
    // (68,42)-(555,42)-(583,342)-(70,353) out of 800x643. A clip-path
    // inset toward center made this worse — it cropped real content
    // (the browser chrome, most of the sidebar) off the mockup instead
    // of just trimming excess. This box is shrunk to 80% of the
    // measured region and centered within it instead, so the whole
    // mockup (nothing cropped) sits with a safety margin inside the
    // screen rather than risking the raw measurement's edges.
    screenOverlay: {
      uri: LAPTOP_UI_DATA_URI,
      left: '14.9%',
      top: '11.3%',
      width: '51.5%',
      height: '38.8%',
    },
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/GalaxyA80Phone_Transparent.png',
    title: 'Real vendors, real deals',
    caption: 'Verified sellers list their stock in minutes and reach thousands of buyers across the city.',
    aspect: 334 / 711,
    // Screen measured (3,20)-(330,700) out of 334x711, shrunk to 80%
    // and centered — see the laptop comment above for why.
    screenOverlay: {
      uri: PHONE_UI_DATA_URI,
      left: '10.7%',
      top: '12.4%',
      width: '78.3%',
      height: '76.6%',
    },
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
// `heightPct` is a plain number: SlideFigure converts it to an
// explicit pixel height itself (via useWindowDimensions) rather than
// leaning on CSS `aspectRatio`/`vh` resolution, which proved unreliable
// on this box (position:absolute, auto width, height driven by a
// re-rendering/transitioning cycle) — the box's rendered aspect ratio
// kept drifting from the photo's, which threw off the device-screen
// overlay position. Plain numeric width/height sidesteps that class of
// CSS resolution issue entirely.
function roleStyle(role: Role, isMobile: boolean) {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        heightPct: isMobile ? 78 : 104,
        bottom: isMobile ? '15%' : '-4%',
        blur: 0,
        opacity: 1,
        zIndex: 20,
        shadow: 0.55,
      };
    case 'left':
      return {
        left: isMobile ? '10%' : '20%',
        heightPct: isMobile ? 16 : 24,
        bottom: isMobile ? '32%' : '16%',
        blur: 3,
        opacity: 0.6,
        zIndex: 10,
        shadow: 0.22,
      };
    case 'right':
      return {
        left: isMobile ? '90%' : '80%',
        heightPct: isMobile ? 16 : 24,
        bottom: isMobile ? '32%' : '16%',
        blur: 3,
        opacity: 0.6,
        zIndex: 10,
        shadow: 0.22,
      };
    case 'back':
      return {
        left: '50%',
        heightPct: isMobile ? 13 : 19,
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
  screenOverlay,
}: {
  role: Role;
  src: string;
  aspect: number;
  isMobile: boolean;
  screenOverlay?: ScreenOverlay;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const rs = roleStyle(role, isMobile);
  const heightPx = windowHeight * (rs.heightPct / 100);
  const widthPx = heightPx * aspect;
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

  return (
    <View
      style={[
        styles.slideItem,
        {
          left: rs.left as any,
          bottom: rs.bottom as any,
          width: widthPx,
          height: heightPx,
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
        {/* App-UI "ad" on the device screen — nested here so it inherits
            the same sway transform as the photo instead of floating
            independently of it. */}
        {screenOverlay && (
          <View
            style={[
              styles.screenOverlay,
              {
                top: screenOverlay.top as any,
                left: screenOverlay.left as any,
                width: screenOverlay.width as any,
                height: screenOverlay.height as any,
              },
              Platform.OS === 'web' && screenOverlay.clipPath
                ? ({ clipPath: screenOverlay.clipPath } as any)
                : {},
            ]}
          >
            <Image source={{ uri: screenOverlay.uri }} style={styles.slideImage} resizeMode="cover" />
          </View>
        )}
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isWeb = Platform.OS === 'web';
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

  // With a video background on web, legibility depends on the dark
  // scrim over it, not the app's light/dark toggle — so text stays a
  // fixed light palette there. Native has no video (see below), so it
  // keeps following the app theme like the rest of the site.
  const textPrimary = isWeb ? colors.white : t.textPrimary;
  const textSecondary = isWeb ? 'rgba(255,255,255,0.85)' : t.textSecondary;
  const hairlineBorder = isWeb ? 'rgba(255,255,255,0.3)' : t.border;
  const dotColor = isWeb ? 'rgba(255,255,255,0.35)' : t.border;
  const ghostColor = isWeb ? 'rgba(255,255,255,0.16)' : (t.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.07)');
  const bottomScrimColor = isWeb ? 'rgba(4,9,20,0.68)' : (t.isDark ? 'rgba(4,10,24,0.6)' : 'rgba(249,250,251,0.92)');
  const screenBg = isWeb ? colors.navy[800] : t.bg;
  const bgTransition = Platform.OS === 'web'
    ? ({ transition: `background-color ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)` } as any)
    : {};

  return (
    <View style={[styles.screen, { backgroundColor: screenBg }, bgTransition]}>
      <Head>
        <title>SokoPrice — Compare vendor prices in Nairobi</title>
        <meta name="description" content="The fastest way to compare prices across Nairobi vendors, track trends, and never overpay again." />
      </Head>

      {/* Background video — vendors and shoppers using the platform.
          Web only: RN has no intrinsic <video> element, and native
          keeps the flat theme-colored background below instead. */}
      {isWeb && React.createElement('video', {
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        src: '/welcome-bg.mp4',
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        },
      })}

      {/* Scrim over the video so foreground text stays legible */}
      {isWeb && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(4,9,20,0.45)', 'rgba(4,9,20,0.6)']}
          style={styles.videoScrim}
        />
      )}

      {/* Grain texture */}
      {Platform.OS === 'web' && (
        <View
          pointerEvents="none"
          style={[
            styles.grain,
            { backgroundImage: `url("${GRAIN_DATA_URI}")`, backgroundSize: '200px 200px', opacity: isWeb ? 0.15 : (t.isDark ? 0.4 : 0.18) } as any,
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
      <Text style={[styles.brandLabel, { color: textPrimary }]}>SOKOPRICE</Text>

      {/* Top-right sign-in link */}
      <Pressable onPress={() => { completeOnboarding(); router.push('/(auth)/login'); }} style={[styles.signInLink, { borderColor: hairlineBorder }]}>
        <Text style={[styles.signInText, { color: textPrimary }]}>Sign in</Text>
      </Pressable>

      {/* Carousel — auto-looping, no manual nav */}
      <View style={styles.carousel} pointerEvents="none">
        {SLIDES.map((s, i) => (
          <SlideFigure key={s.src} role={roles[i]} src={s.src} aspect={s.aspect} isMobile={isMobile} screenOverlay={s.screenOverlay} />
        ))}
      </View>

      {/* Bottom gradient scrim for text legibility */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', bottomScrimColor]}
        style={styles.bottomScrim}
      />

      {/* Bottom-left caption + loop progress */}
      <View style={styles.bottomLeft}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: dotColor }, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
        <Text style={[styles.slideTitle, { color: textPrimary }]}>{slide.title.toUpperCase()}</Text>
        {!isMobile && <Text style={[styles.slideCaption, { color: textSecondary }]}>{slide.caption}</Text>}
      </View>

      {/* Bottom-right CTA */}
      <Pressable onPress={() => { completeOnboarding(); router.push('/(auth)/register'); }} style={styles.ctaWrap}>
        {({ hovered }) => (
          <>
            <Text style={[styles.ctaText, { color: textPrimary }, hovered && { opacity: 1 }]}>Get started</Text>
            <ArrowRightIcon size={22} color={textPrimary} weight="bold" />
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
  videoScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
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
  screenOverlay: {
    position: 'absolute',
    overflow: 'hidden',
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
