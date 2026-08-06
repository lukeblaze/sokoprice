import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import { Text } from './Text';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { CheckIcon } from 'phosphor-react-native';
import { colors, radii, typography } from '@/theme/tokens';

export interface PickerSheetOption {
  label: string;
  value: string;
}

export interface PickerSheetHandle {
  present: () => void;
  dismiss: () => void;
}

interface Props {
  title: string;
  options: PickerSheetOption[];
  value: string;
  onSelect: (value: string) => void;
}

// Native/mobile-web: real bottom sheet. `@gorhom/bottom-sheet`'s gesture-driven
// drag-to-dismiss doesn't translate reliably to react-native-web's pointer
// model, so desktop web gets a plain centered modal instead.
export const PickerSheet = forwardRef<PickerSheetHandle, Props>(
  ({ title, options, value, onSelect }, ref) => {
    if (Platform.OS === 'web') {
      return <WebPickerSheet ref={ref} title={title} options={options} value={value} onSelect={onSelect} />;
    }
    return <NativePickerSheet ref={ref} title={title} options={options} value={value} onSelect={onSelect} />;
  }
);
PickerSheet.displayName = 'PickerSheet';

const NativePickerSheet = forwardRef<PickerSheetHandle, Props>(
  ({ title, options, value, onSelect }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.expand(),
      dismiss: () => sheetRef.current?.close(),
    }));

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
      []
    );

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {options.map(opt => (
            <Pressable
              key={opt.value}
              style={styles.row}
              onPress={() => { onSelect(opt.value); sheetRef.current?.close(); }}
            >
              <Text style={styles.rowLabel}>{opt.label}</Text>
              {opt.value === value && <CheckIcon size={18} color={colors.amber[600]} weight="bold" />}
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);
NativePickerSheet.displayName = 'NativePickerSheet';

const WebPickerSheet = forwardRef<PickerSheetHandle, Props>(
  ({ title, options, value, onSelect }, ref) => {
    const [visible, setVisible] = React.useState(false);

    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }));

    return (
      <Modal visible={visible} transparent animationType="none" onRequestClose={() => setVisible(false)}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.webBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <Animated.View entering={SlideInDown.springify().damping(19).mass(0.7)} style={styles.webCardWrap}>
            <Pressable style={styles.webCard} onPress={e => e.stopPropagation()}>
              <Text style={styles.title}>{title}</Text>
              {options.map(opt => (
                <Pressable
                  key={opt.value}
                  style={({ hovered }) => [styles.row, hovered && styles.rowHovered]}
                  onPress={() => { onSelect(opt.value); setVisible(false); }}
                >
                  <Text style={styles.rowLabel}>{opt.label}</Text>
                  {opt.value === value && <CheckIcon size={18} color={colors.amber[600]} weight="bold" />}
                </Pressable>
              ))}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
);
WebPickerSheet.displayName = 'WebPickerSheet';

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
  },
  handle: {
    backgroundColor: colors.gray[300],
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  webBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webCardWrap: {
    width: '100%',
    maxWidth: 360,
  },
  webCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
  },
  rowHovered: {
    backgroundColor: colors.gray[50],
  },
  rowLabel: {
    fontSize: typography.sizes.base,
    color: colors.navy[800],
  },
});
