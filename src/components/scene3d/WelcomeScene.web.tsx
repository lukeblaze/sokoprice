import React from 'react';
import { Canvas } from '@react-three/fiber';
import { colors } from '@/theme/tokens';
import { Desk } from './objects/Desk';
import { Monitor } from './objects/Monitor';
import { Printer } from './objects/Printer';
import { PaperStack } from './objects/PaperStack';
import { Cart } from './objects/Cart';
import { Badge } from './objects/Badge';
import { FloatingShapes } from './objects/FloatingShapes';

// Bright, soft studio rig — matches the reference's airy light-gray
// look rather than a moody dark scene, so ambient is doing most of the
// work with a gentle key/fill/rim on top for just enough shape/shadow.
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.9} color={colors.white} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={0.75}
        color={colors.white}
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-5, 2, -3]} intensity={0.3} color={colors.green[50]} />
      <directionalLight position={[0, -2, 5]} intensity={0.25} color={colors.white} />
    </>
  );
}

function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
      <planeGeometry args={[14, 14]} />
      <shadowMaterial transparent opacity={0.18} />
    </mesh>
  );
}

// Real interactive 3D welcome hero (web only) — six low-poly,
// claymation-styled "procurement" objects the user can drag to rotate,
// each gently bobbing/auto-rotating when left alone, plus ambient
// floating background shapes. See
// src/components/scene3d/useDragRotate.ts for the interaction model and
// modelConfig.ts for how to swap in real glTF assets later.
export default function WelcomeScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [5.5, 4.6, 7.2], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <Lighting />
      <Ground />
      <FloatingShapes />
      <Desk position={[0, -0.15, 0]} />
      <Monitor position={[-2.5, 1.5, -0.6]} />
      <Printer position={[2.7, 0.5, -0.9]} />
      <PaperStack position={[1.7, -0.75, 1.5]} />
      <Cart position={[-2.7, -0.95, 1.1]} />
      <Badge position={[2.1, 2.05, 0.7]} />
    </Canvas>
  );
}
