import React from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

function BadgePrimitive() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 24]} />
        <meshStandardMaterial color={colors.green[400]} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.041, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 24]} />
        <meshStandardMaterial color={colors.green[600]} roughness={0.6} />
      </mesh>
      {/* Checkmark, two rotated bars forming a V */}
      <mesh position={[-0.06, 0.052, -0.02]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.05, 0.22, 0.03]} />
        <meshStandardMaterial color={colors.white} roughness={0.4} />
      </mesh>
      <mesh position={[0.08, 0.052, 0.05]} rotation={[0, 0, -Math.PI / 3.2]}>
        <boxGeometry args={[0.05, 0.34, 0.03]} />
        <meshStandardMaterial color={colors.white} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Badge({ position }: { position: [number, number, number] }) {
  const { groupRef, onPointerDown } = useDragRotate({ autoRotateSpeed: 0.25 });
  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {modelConfig.badge ? (
        <GLTFModel url={modelConfig.badge} fallback={<BadgePrimitive />} />
      ) : (
        <BadgePrimitive />
      )}
    </group>
  );
}
