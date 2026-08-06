import { useRef, useEffect } from 'react';
import { Platform, type View } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// Desktop-web-only magnetic pull: the element nudges toward the cursor
// within a small max offset, snapping back on mouse leave.
export function useMagnetic(strength = 0.25, maxOffset = 8) {
  const ref = useRef<View>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clamp((e.clientX - cx) * strength, -maxOffset, maxOffset);
      const dy = clamp((e.clientY - cy) * strength, -maxOffset, maxOffset);
      translateX.value = withSpring(dx, { damping: 15, stiffness: 250 });
      translateY.value = withSpring(dy, { damping: 15, stiffness: 250 });
    };
    const handleLeave = () => {
      translateX.value = withSpring(0, { damping: 15 });
      translateY.value = withSpring(0, { damping: 15 });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength, maxOffset]);

  const magneticStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return { ref, magneticStyle };
}
