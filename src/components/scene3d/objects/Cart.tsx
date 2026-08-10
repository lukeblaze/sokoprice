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
      {/* Basket — wireframe to read as a wire shopping-cart mesh rather
          than a solid crate, matching the reference. */}
      <mesh position={[0, 0.15, 0]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.75, 0.42, 0.55]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.5} wireframe />
      </mesh>

      {/* Packages inside the basket */}
      <mesh castShadow position={[-0.1, 0.28, 0]} rotation={[0.1, 0.15, 0]}>
        <boxGeometry args={[0.26, 0.2, 0.22]} />
        <meshStandardMaterial color={colors.amber[300]} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.16, 0.24, 0.02]} rotation={[0.05, -0.2, 0.05]}>
        <boxGeometry args={[0.2, 0.15, 0.18]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.6} />
      </mesh>

      {/* Wheels */}
      {WHEEL_POSITIONS.map((p, i) => (
        <mesh key={i} castShadow position={p} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color={colors.gray[600]} roughness={0.5} />
        </mesh>
      ))}
      {/* Handle */}
      <mesh castShadow position={[0, 0.55, -0.35]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.05]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.32, 0.4, -0.3]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.32, 0.4, -0.3]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color={colors.navy[600]} roughness={0.5} />
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
