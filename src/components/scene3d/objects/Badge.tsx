import React, { useMemo } from 'react';
import * as THREE from 'three';
import { colors } from '@/theme/tokens';
import { useDragRotate } from '../useDragRotate';
import { GLTFModel } from '../GLTFModel';
import { modelConfig } from '../modelConfig';

// Procedural "certification seal" outline — radius oscillates around a
// base circle to produce the scalloped/wavy edge, built entirely from
// Three.js primitives (no external SVG/model asset needed).
function useScallopedShape(rBase: number, bumpAmp: number, bumps: number, segments = 96) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const r = rBase + bumpAmp * Math.cos(bumps * theta);
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return shape;
  }, [rBase, bumpAmp, bumps, segments]);
}

function BadgePrimitive() {
  const outerShape = useScallopedShape(0.38, 0.045, 14);
  const seal = useMemo(
    () =>
      new THREE.ExtrudeGeometry(outerShape, {
        depth: 0.07,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012,
        bevelSegments: 2,
      }),
    [outerShape]
  );

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow geometry={seal}>
        <meshStandardMaterial color={colors.green[400]} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.082]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial color={colors.green[600]} roughness={0.6} />
      </mesh>
      {/* Checkmark, two rotated bars forming a V */}
      <mesh position={[-0.05, -0.02, 0.09]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.045, 0.18, 0.025]} />
        <meshStandardMaterial color={colors.white} roughness={0.4} />
      </mesh>
      <mesh position={[0.06, 0.03, 0.09]} rotation={[0, 0, -Math.PI / 3.2]}>
        <boxGeometry args={[0.045, 0.28, 0.025]} />
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
