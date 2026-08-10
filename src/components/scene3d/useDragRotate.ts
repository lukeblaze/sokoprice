import { useCallback, useEffect, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { Group } from 'three';

interface UseDragRotateOptions {
  autoRotateSpeed?: number;
  bobAmplitude?: number;
  bobSpeed?: number;
  dragSensitivity?: number;
}

// Per-object drag-to-rotate with a gentle idle bob + slow auto-rotate
// when not being dragged. Rotation/position are written straight to the
// group ref inside the pointer handlers and useFrame rather than through
// React state, since per-frame setState would trigger needless
// re-renders for a value only the imperative Three.js scene graph needs.
//
// Pointer listeners are attached to `window` (not the mesh) so a drag
// keeps tracking even once the cursor leaves the object's small
// screen-space hit area — R3F's own onPointerMove only fires while the
// pointer stays over the raycasted mesh.
export function useDragRotate(options: UseDragRotateOptions = {}) {
  const {
    autoRotateSpeed = 0.15,
    bobAmplitude = 0.08,
    bobSpeed = 1.1,
    dragSensitivity = 0.012,
  } = options;

  const groupRef = useRef<Group>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotationAtDragStart = useRef({ x: 0, y: 0 });
  const idlePhase = useRef(Math.random() * Math.PI * 2); // desyncs bob across objects
  const baseY = useRef<number | null>(null);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (!isDragging.current || !groupRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      groupRef.current.rotation.y = rotationAtDragStart.current.y + dx * dragSensitivity;
      groupRef.current.rotation.x = rotationAtDragStart.current.x + dy * dragSensitivity;
    }
    function handlePointerUp() {
      isDragging.current = false;
    }
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragSensitivity]);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    if (groupRef.current) {
      rotationAtDragStart.current = { x: groupRef.current.rotation.x, y: groupRef.current.rotation.y };
    }
  }, []);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (baseY.current === null) baseY.current = group.position.y;

    if (!isDragging.current) {
      idlePhase.current += delta * bobSpeed;
      group.position.y = baseY.current + Math.sin(idlePhase.current) * bobAmplitude;
      group.rotation.y += delta * autoRotateSpeed;
    }
  });

  return { groupRef, onPointerDown };
}
