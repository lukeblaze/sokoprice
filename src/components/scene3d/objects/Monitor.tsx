import React, { useMemo } from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

const BAR_HEIGHTS = [0.07, 0.12, 0.09, 0.15];

function MonitorPrimitive() {
  const bars = useMemo(
    () => BAR_HEIGHTS.map((h, i) => ({ h, x: 0.1 + i * 0.08, color: i % 2 === 0 ? colors.green[400] : colors.amber[400] })),
    []
  );
  // Donut chart approximated as a ring of small wedge-like boxes —
  // avoids pulling in TorusGeometry's segment-count tuning for a mark
  // this small while still reading clearly as a ring.
  const ringSegments = useMemo(
    () => Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const r = 0.11;
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        rot: angle,
        color: i < 6 ? colors.navy[600] : colors.green[400],
      };
    }),
    []
  );

  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.1, 0.7, 0.06]} />
        <meshStandardMaterial color={colors.white} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.35, 0.032]}>
        <planeGeometry args={[1.0, 0.6]} />
        <meshStandardMaterial color={colors.gray[50]} roughness={0.4} emissive={colors.gray[50]} emissiveIntensity={0.4} />
      </mesh>
      {/* Donut chart, upper-left of the screen */}
      <group position={[-0.28, 0.42, 0.033]}>
        {ringSegments.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, 0]} rotation={[0, 0, s.rot]}>
            <boxGeometry args={[0.045, 0.018, 0.005]} />
            <meshStandardMaterial color={s.color} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Bar chart, lower-right of the screen */}
      <group position={[0.05, 0.2, 0.033]}>
        {bars.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, 0]}>
            <boxGeometry args={[0.05, b.h, 0.006]} />
            <meshStandardMaterial color={b.color} roughness={0.5} />
          </mesh>
        ))}
      </group>
      <mesh castShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
        <meshStandardMaterial color={colors.gray[300]} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, -0.22, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.3]} />
        <meshStandardMaterial color={colors.gray[300]} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Monitor({ position }: { position: [number, number, number] }) {
  const { groupRef, onPointerDown } = useDragRotate();
  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {modelConfig.monitor ? (
        <GLTFModel url={modelConfig.monitor} fallback={<MonitorPrimitive />} />
      ) : (
        <MonitorPrimitive />
      )}
    </group>
  );
}
