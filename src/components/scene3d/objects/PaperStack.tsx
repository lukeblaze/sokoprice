import React, { useMemo } from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

const BOOK_COLORS = [colors.navy[600], colors.white, colors.navy[600], colors.white];

function PaperStackPrimitive() {
  // Stack of bound documents/books, tiny per-book jitter so it doesn't
  // read as one solid block — computed once at mount.
  const books = useMemo(
    () =>
      BOOK_COLORS.map((color, i) => ({
        y: i * 0.05,
        jitterX: (Math.random() - 0.5) * 0.03,
        jitterZ: (Math.random() - 0.5) * 0.03,
        jitterRot: (Math.random() - 0.5) * 0.06,
        color,
      })),
    []
  );

  return (
    <group rotation={[0, 0.3, 0]}>
      {books.map((b, i) => (
        <group key={i} position={[b.jitterX, b.y, b.jitterZ]} rotation={[0, b.jitterRot, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.045, 0.85]} />
            <meshStandardMaterial color={b.color} roughness={0.6} />
          </mesh>
          {/* Green accent stripe near the spine */}
          <mesh position={[0, 0.024, -0.32]}>
            <boxGeometry args={[0.62, 0.003, 0.06]} />
            <meshStandardMaterial color={colors.green[400]} roughness={0.5} />
          </mesh>
        </group>
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
