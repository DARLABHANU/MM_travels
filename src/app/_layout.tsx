import Mapbox from '@rnmapbox/maps';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Token is loaded from .env (EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN) — never hardcode secrets in source
const MAPBOX_TOKEN = (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '').trim();

console.log("INITIALIZING MAPBOX WITH TOKEN:", MAPBOX_TOKEN ? `${MAPBOX_TOKEN.substring(0, 15)}...` : "MISSING_TOKEN");

if (MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.')) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
} else {
  console.warn('Mapbox Token is missing or invalid in environment variables.');
}

// 2. CRITICAL: Default export the RootLayout component guaranteeing execution context
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
