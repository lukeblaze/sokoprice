import React from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

function PrinterPrimitive() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.1, 0.55, 0.75]} />
        <meshStandardMaterial color={colors.gray[100]} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.31, -0.05]}>
        <boxGeometry args={[0.85, 0.08, 0.55]} />
        <meshStandardMaterial color={colors.gray[400]} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, -0.32, 0.5]}>
        <boxGeometry args={[0.75, 0.06, 0.35]} />
        <meshStandardMaterial color={colors.gray[300]} roughness={0.7} />
      </mesh>
      {/* Sheet feeding out of the front slot */}
      <mesh castShadow position={[0, -0.1, 0.42]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.4]} />
        <meshStandardMaterial color={colors.white} roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 0.03, 0.39]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color={colors.green[400]} emissive={colors.green[400]} emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Printer({ position }: { position: [number, number, number] }) {
  const { groupRef, onPointerDown } = useDragRotate();
  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {modelConfig.printer ? (
        <GLTFModel url={modelConfig.printer} fallback={<PrinterPrimitive />} />
      ) : (
        <PrinterPrimitive />
      )}
    </group>
  );
}
