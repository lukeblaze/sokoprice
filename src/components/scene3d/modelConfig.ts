// Optional real-asset overrides for the welcome scene's primitive-built
// objects. Every entry defaults to `null` (use the code-built low-poly
// version). To swap in a real glTF model for an object: drop the .glb
// file in `sokoprice/public/models/` and set that entry to its URL
// (e.g. '/models/laptop.glb') — no other code changes needed. A bad
// path or malformed file falls back to the primitive automatically
// (see GLTFModel.tsx).
export type SceneObjectKey = 'desk' | 'monitor' | 'printer' | 'paperStack' | 'cart' | 'badge';

export const modelConfig: Record<SceneObjectKey, string | null> = {
  desk: null,
  monitor: null,
  printer: null,
  paperStack: null,
  cart: null,
  badge: null,
};
