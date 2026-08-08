import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// expo-haptics has no web implementation — ExpoHaptics resolves to null via
// requireOptionalNativeModule, so impactAsync() throws UnavailabilityError
// synchronously. Called from an unguarded `await` inside an onPress handler,
// that becomes an unhandled rejection that crashes the screen with the dev
// error overlay. Haptic feedback is a nice-to-have; it must never be able to
// break the action it's attached to.
export async function impactLight(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Best-effort — ignore devices/simulators without haptics support.
  }
}
