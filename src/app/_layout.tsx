import { Stack } from 'expo-router';

import { EntriesProvider } from '../store/entries';

export default function RootLayout() {
  return (
    <EntriesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new" options={{ presentation: 'modal' }} />
      </Stack>
    </EntriesProvider>
  );
}
