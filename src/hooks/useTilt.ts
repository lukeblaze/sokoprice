import { useRef, useEffect } from 'react';
import { Platform, type View } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Desktop-web-only 3D tilt: rotates the element toward the cursor based on
// pointer position within its bounds. No-op on native (Platform.OS check)
// and inert on touch devices since mousemove never fires there.
export function useTilt(maxTilt = 6) {
  const ref = useRef<View>(null);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const liftScale = useSharedValue(1);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotateX.value = withSpring(-py * maxTilt, { damping: 20, stiffness: 220 });
      rotateY.value = withSpring(px * maxTilt, { damping: 20, stiffness: 220 });
    };
    const handleEnter = () => {
      liftScale.value = withSpring(1.015, { damping: 18 });
    };
    const handleLeave = () => {
      rotateX.value = withSpring(0, { damping: 20 });
      rotateY.value = withSpring(0, { damping: 20 });
      liftScale.value = withSpring(1, { damping: 18 });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [maxTilt]);

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: liftScale.value },
    ],
  }));

  return { ref, tiltStyle };
}
