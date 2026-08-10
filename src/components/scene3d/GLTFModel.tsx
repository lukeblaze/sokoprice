import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

// A load failure (missing file, malformed .glb) must never crash the
// whole welcome scene — it just means that one object stays on its
// code-built primitive.
class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, { errored: boolean }> {
  state = { errored: false };
  static getDerivedStateFromError() {
    return { errored: true };
  }
  render() {
    return this.state.errored ? this.props.fallback : this.props.children;
  }
}

function LoadedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// Renders a real glTF model for a scene object when modelConfig.ts sets
// a URL for it; otherwise callers don't render this at all and use
// their primitive directly. See modelConfig.ts for how to wire one in.
export function GLTFModel({ url, fallback }: { url: string; fallback: React.ReactNode }) {
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedModel url={url} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
