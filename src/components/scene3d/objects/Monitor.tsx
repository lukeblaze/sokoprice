import React from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

function MonitorPrimitive() {
  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.1, 0.7, 0.06]} />
        <meshStandardMaterial color={colors.navy[700]} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.35, 0.032]}>
        <planeGeometry args={[1.0, 0.6]} />
        <meshStandardMaterial color={colors.navy[800]} roughness={0.4} emissive={colors.amber[400]} emissiveIntensity={0.08} />
      </mesh>
      <mesh castShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
        <meshStandardMaterial color={colors.gray[600]} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, -0.22, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.3]} />
        <meshStandardMaterial color={colors.gray[600]} roughness={0.7} />
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
