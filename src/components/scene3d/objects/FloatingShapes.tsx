import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { colors } from '@/theme/tokens';

interface ShapeDef {
  type: 'box' | 'triangle' | 'dot';
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}

// Purely decorative ambient geometry scattered behind the main objects —
// no drag interaction, just a slow independent rotation + gentle bob per
// shape, matching the reference's floating background confetti.
const SHAPES: ShapeDef[] = [
  { type: 'box', position: [-3.6, 1.8, -2], scale: 0.18, speed: 0.3, color: colors.gray[200] },
  { type: 'triangle', position: [-3.2, -1.6, -1.6], scale: 0.22, speed: 0.4, color: colors.gray[300] },
  { type: 'dot', position: [3.4, -0.4, -2.2], scale: 0.14, speed: 0.25, color: colors.gray[200] },
  { type: 'box', position: [3.6, 2.4, -1.4], scale: 0.15, speed: 0.35, color: colors.white },
  { type: 'triangle', position: [0.6, 3.0, -2.4], scale: 0.16, speed: 0.3, color: colors.gray[200] },
  { type: 'dot', position: [-1.6, 2.6, -2], scale: 0.1, speed: 0.4, color: colors.gray[300] },
  { type: 'box', position: [-4.0, -0.2, -1.8], scale: 0.12, speed: 0.45, color: colors.gray[100] },
];

function FloatingShape({ def }: { def: ShapeDef }) {
  const ref = useRef<Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((_state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.x += delta * def.speed * 0.6;
    mesh.rotation.y += delta * def.speed;
    phase.current += delta * 0.7;
    mesh.position.y = def.position[1] + Math.sin(phase.current) * 0.12;
  });

  return (
    <mesh ref={ref} position={def.position} scale={def.scale}>
      {def.type === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {def.type === 'triangle' && <coneGeometry args={[0.8, 1, 3]} />}
      {def.type === 'dot' && <icosahedronGeometry args={[0.7, 0]} />}
      <meshStandardMaterial color={def.color} roughness={0.85} />
    </mesh>
  );
}

export function FloatingShapes() {
  return (
    <>
      {SHAPES.map((def, i) => (
        <FloatingShape key={i} def={def} />
      ))}
    </>
  );
}
