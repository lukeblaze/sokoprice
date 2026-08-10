import React from 'react';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

const WHEEL_POSITIONS: [number, number, number][] = [
  [-0.28, -0.28, -0.24],
  [0.28, -0.28, -0.24],
  [-0.28, -0.28, 0.24],
  [0.28, -0.28, 0.24],
];

function CartPrimitive() {
  return (
    <group rotation={[0, 0.4, 0]}>
      {/* Basket */}
      <mesh castShadow position={[0, 0.15, 0]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.75, 0.42, 0.55]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.7} />
      </mesh>
      {/* Wheels */}
      {WHEEL_POSITIONS.map((p, i) => (
        <mesh key={i} castShadow position={p} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color={colors.gray[800]} roughness={0.5} />
        </mesh>
      ))}
      {/* Handle */}
      <mesh castShadow position={[0, 0.55, -0.35]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.05]} />
        <meshStandardMaterial color={colors.gray[700]} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.32, 0.4, -0.3]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color={colors.gray[700]} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.32, 0.4, -0.3]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color={colors.gray[700]} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Cart({ position }: { position: [number, number, number] }) {
  const { groupRef, onPointerDown } = useDragRotate();
  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {modelConfig.cart ? (
        <GLTFModel url={modelConfig.cart} fallback={<CartPrimitive />} />
      ) : (
        <CartPrimitive />
      )}
    </group>
  );
}
