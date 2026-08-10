import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { impactLight } from '../haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('impactLight', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not call the native module on web', async () => {
    Platform.OS = 'web';
    await impactLight();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('calls the native module on native platforms', async () => {
    Platform.OS = 'ios';
    (Haptics.impactAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await impactLight();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('swallows errors thrown by the native module (e.g. no haptics support)', async () => {
    Platform.OS = 'ios';
    (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('UnavailabilityError'));
    await expect(impactLight()).resolves.toBeUndefined();
  });
});
