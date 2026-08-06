import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// `Platform.OS === 'web'` is true both in a real browser AND during Expo
// Router's Node-based SSR/static-export pass for the web target — CanvasKit's
// WASM loader only works in an actual browser, so gate on `window` too.
const isBrowser = Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined';

let webSkiaPromise: Promise<void> | null = null;

function loadSkiaWeb(): Promise<void> {
  if (!webSkiaPromise) {
    // CanvasKit's default WASM lookup resolves relative to the current route
    // (e.g. `/product/canvaskit.wasm`), which 404s on any nested route. Force
    // it to the site root, where the file is published from `public/`.
    webSkiaPromise = import('@shopify/react-native-skia/lib/module/web').then(({ LoadSkiaWeb }) =>
      LoadSkiaWeb({ locateFile: (file: string) => `/${file}` })
    );
  }
  return webSkiaPromise;
}

// Kick off the CanvasKit WASM load as early as possible (non-blocking) so
// it's likely ready by the time a Skia-backed chart mounts. No-op on native
// and during SSR.
if (isBrowser) {
  loadSkiaWeb();
}

// Native: Skia is always ready immediately. Browser: true once CanvasKit's
// WASM has finished loading — gate Skia-backed components on this to avoid a
// blank canvas. SSR: stays false (chart isn't rendered server-side anyway).
export function useSkiaWebReady(): boolean {
  const [ready, setReady] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (!isBrowser) return;
    let cancelled = false;
    loadSkiaWeb().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
