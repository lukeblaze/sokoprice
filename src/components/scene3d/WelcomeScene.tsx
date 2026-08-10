// Native resolution for the welcome scene module. The real interactive
// 3D scene (WelcomeScene.web.tsx) only ships on web — native keeps the
// existing 2D carousel in app/welcome.tsx instead, so this file only
// exists so the module stays resolvable/typed if ever imported without
// a platform guard. It is never actually rendered.
export default function WelcomeScene() {
  return null;
}
