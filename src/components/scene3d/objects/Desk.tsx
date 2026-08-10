import React, { useMemo } from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

const LEG_POSITIONS: [number, number, number][] = [
  [-1.15, -0.95, -0.55],
  [1.15, -0.95, -0.55],
  [-1.15, -0.95, 0.55],
  [1.15, -0.95, 0.55],
];

const BAR_HEIGHTS = [0.16, 0.28, 0.2, 0.34, 0.24];

function DeskPrimitive() {
  const bars = useMemo(
    () => BAR_HEIGHTS.map((h, i) => ({ h, x: -0.3 + i * 0.15, color: i % 2 === 0 ? colors.green[400] : colors.amber[400] })),
    []
  );

  return (
    <group>
      {/* Desk surface + legs */}
      <mesh receiveShadow castShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[2.6, 0.12, 1.4]} />
        <meshStandardMaterial color={colors.amber[600]} roughness={0.7} metalness={0.02} />
      </mesh>
      {LEG_POSITIONS.map((p, i) => (
        <mesh key={i} castShadow position={p}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color={colors.white} roughness={0.75} />
        </mesh>
      ))}

      {/* Laptop base */}
      <mesh castShadow position={[0, -0.4, 0.05]}>
        <boxGeometry args={[0.95, 0.05, 0.65]} />
        <meshStandardMaterial color={colors.gray[300]} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Desk props — pen holder, small plant, coffee mug, notepad+pen */}
      <group position={[-0.85, -0.4, 0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />
          <meshStandardMaterial color={colors.gray[300]} roughness={0.6} />
        </mesh>
        <mesh position={[-0.02, 0.13, 0.01]} rotation={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color={colors.navy[600]} roughness={0.5} />
        </mesh>
        <mesh position={[0.03, 0.13, -0.02]} rotation={[0, 0, -0.08]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color={colors.green[400]} roughness={0.5} />
        </mesh>
      </group>

      <group position={[-0.62, -0.36, 0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.1, 12]} />
          <meshStandardMaterial color={colors.gray[100]} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <icosahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color={colors.green[400]} roughness={0.75} />
        </mesh>
      </group>

      <mesh castShadow position={[0.75, -0.35, 0.18]}>
        <cylinderGeometry args={[0.07, 0.06, 0.16, 16]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.5} metalness={0.1} />
      </mesh>

      <group position={[0.4, -0.42, 0.35]} rotation={[0, -0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.02, 0.26]} />
          <meshStandardMaterial color={colors.white} roughness={0.8} />
        </mesh>
        <mesh position={[0.14, 0.02, -0.08]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.02, 0.22, 0.02]} />
          <meshStandardMaterial color={colors.navy[600]} roughness={0.4} />
        </mesh>
      </group>

      {/* Laptop screen, tilted back like an open lid */}
      <group position={[0, -0.02, -0.28]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.95, 0.62, 0.04]} />
          <meshStandardMaterial color={colors.gray[300]} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.023]}>
          <planeGeometry args={[0.85, 0.52]} />
          <meshStandardMaterial
            color={colors.white}
            roughness={0.4}
            emissive={colors.gray[50]}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Mini bar-chart dashboard marks */}
        {bars.map((b, i) => (
          <mesh key={i} position={[b.x, -0.2 + b.h / 2, 0.03]}>
            <boxGeometry args={[0.08, b.h, 0.01]} />
            <meshStandardMaterial color={b.color} roughness={0.5} />
          </mesh>
        ))}
        {/* Line-graph segments */}
        <mesh position={[-0.05, 0.18, 0.032]} rotation={[0, 0, 0.32]}>
          <boxGeometry args={[0.28, 0.014, 0.01]} />
          <meshStandardMaterial color={colors.green[400]} roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 0.24, 0.032]} rotation={[0, 0, -0.22]}>
          <boxGeometry args={[0.22, 0.014, 0.01]} />
          <meshStandardMaterial color={colors.green[400]} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function Desk({ position }: { position: [number, number, number] }) {
  const { groupRef, onPointerDown } = useDragRotate({ autoRotateSpeed: 0.08 });
  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {modelConfig.desk ? (
        <GLTFModel url={modelConfig.desk} fallback={<DeskPrimitive />} />
      ) : (
        <DeskPrimitive />
      )}
    </group>
  );
}
