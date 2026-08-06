import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function usePressScale(to = 0.96) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(to, { damping: 15 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return { animStyle, onPressIn, onPressOut };
}
