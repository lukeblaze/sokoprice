import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/tokens';

interface Props {
  points: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
}

// Builds a smooth-ish path through the points using simple quadratic
// midpoint smoothing — cheap enough to run per-card without a charting lib.
function buildPath(coords: Array<[number, number]>): string {
  if (coords.length < 2) return '';
  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [x0, y0] = coords[i - 1];
    const [x1, y1] = coords[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q ${x0} ${y0} ${mx} ${my}`;
  }
  const last = coords[coords.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

export function Sparkline({ points, width = 64, height = 24, strokeWidth = 1.75 }: Props) {
  const id = useMemo(() => `sparkline-${Math.random().toString(36).slice(2)}`, []);

  const { linePath, fillPath, isUp } = useMemo(() => {
    if (points.length < 2) return { linePath: '', fillPath: '', isUp: true };
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const pad = strokeWidth;
    const coords: Array<[number, number]> = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = pad + (1 - (p - min) / range) * (height - pad * 2);
      return [x, y];
    });
    const line = buildPath(coords);
    const fill = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { linePath: line, fillPath: fill, isUp: points[points.length - 1] >= points[0] };
  }, [points, width, height, strokeWidth]);

  if (!linePath) return <View style={{ width, height }} />;

  const stroke = isUp ? colors.green[400] : colors.red[400];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={stroke} stopOpacity={0.25} />
          <Stop offset="1" stopColor={stroke} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill={`url(#${id})`} stroke="none" />
      <Path d={linePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
