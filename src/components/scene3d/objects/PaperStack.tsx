import React, { useMemo } from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

const SHEET_COUNT = 6;

function PaperStackPrimitive() {
  // Tiny per-sheet jitter so the stack doesn't read as one solid block —
  // computed once at mount, not re-randomized every render.
  const sheets = useMemo(
    () =>
      Array.from({ length: SHEET_COUNT }, (_, i) => ({
        y: i * 0.035,
        jitterX: (Math.random() - 0.5) * 0.02,
        jitterZ: (Math.random() - 0.5) * 0.02,
        jitterRot: (Math.random() - 0.5) * 0.03,
      })),
    []
  );

  return (
    <group>
      {sheets.map((s, i) => (
        <mesh key={i} castShadow position={[s.jitterX, s.y, s.jitterZ]} rotation={[0, s.jitterRot, 0]}>
          <boxGeometry args={[0.6, 0.03, 0.82]} />
          <meshStandardMaterial color={colors.gray[50]} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export function PaperStack({ position }: { position: [number, number, number] }) {
  const { groupRef, onPointerDown } = useDragRotate();
  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {modelConfig.paperStack ? (
        <GLTFModel url={modelConfig.paperStack} fallback={<PaperStackPrimitive />} />
      ) : (
        <PaperStackPrimitive />
      )}
    </group>
  );
}
