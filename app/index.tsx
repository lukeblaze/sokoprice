import { Redirect } from 'expo-router';

// In production: check SecureStore for auth token
// and redirect to login if not authenticated.
// For now, go straight to the main app.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
