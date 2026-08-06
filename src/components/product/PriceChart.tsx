import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { colors, typography } from '@/theme/tokens';
import { formatKES, formatShortDate } from '@/utils/format';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Circle } from '@shopify/react-native-skia';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';

// Only ever mounted (native) or dynamically imported (web, after
// LoadSkiaWeb() resolves) — see app/product/[id].tsx.
export default function PriceChart({ dataPoints }: { dataPoints: Array<{ date: string; avgPrice: number }> }) {
  const { state, isActive } = useChartPressState({ x: '', y: { avgPrice: 0 } });
  const [tooltip, setTooltip] = useState<{ date: string; price: number } | null>(null);

  useAnimatedReaction(
    () => ({ active: isActive, x: state.x.value.value, y: state.y.avgPrice.value.value }),
    (curr) => {
      if (curr.active) {
        runOnJS(setTooltip)({ date: curr.x, price: curr.y });
      } else {
        runOnJS(setTooltip)(null);
      }
    },
    [isActive]
  );

  if (!dataPoints || dataPoints.length === 0) return null;

  const prices = dataPoints.map(d => d.avgPrice);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>
            {tooltip ? formatShortDate(tooltip.date) : 'Tap chart to inspect'}
          </Text>
          <Text style={styles.headerPrice}>
            {formatKES(tooltip ? tooltip.price : dataPoints[dataPoints.length - 1].avgPrice)}
          </Text>
        </View>
        <View style={styles.rangeLabels}>
          <Text style={styles.label}>High {formatKES(maxP)}</Text>
          <Text style={styles.label}>Low {formatKES(minP)}</Text>
        </View>
      </View>
      <View style={styles.canvas}>
        <CartesianChart
          data={dataPoints}
          xKey="date"
          yKeys={['avgPrice']}
          chartPressState={state}
          domainPadding={{ top: 20, bottom: 20, left: 8, right: 8 }}
        >
          {({ points }) => (
            <>
              <Line
                points={points.avgPrice}
                color={colors.amber[400]}
                strokeWidth={2.5}
                curveType="natural"
                animate={{ type: 'timing', duration: 300 }}
              />
              {isActive && (
                <>
                  <Circle cx={state.x.position} cy={state.y.avgPrice.position} r={7} color={colors.navy[800]} opacity={0.15} />
                  <Circle cx={state.x.position} cy={state.y.avgPrice.position} r={4} color={colors.navy[800]} />
                </>
              )}
            </>
          )}
        </CartesianChart>
      </View>
      <View style={styles.xLabels}>
        {[0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].map(idx => (
          <Text key={idx} style={styles.xLabel}>
            {formatShortDate(dataPoints[idx]?.date ?? '')}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLabel: {
    fontSize: 11,
    color: colors.gray[400],
  },
  headerPrice: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.displayFont,
    color: colors.navy[800],
    marginTop: 2,
  },
  rangeLabels: {
    alignItems: 'flex-end',
    gap: 2,
  },
  label: {
    fontSize: 10,
    color: colors.gray[400],
  },
  canvas: {
    height: 160,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  xLabel: {
    fontSize: 10,
    color: colors.gray[400],
  },
});
