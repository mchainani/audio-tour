import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AudioSessionProvider } from '@/features/audio/audio-session';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <AudioSessionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </AudioSessionProvider>
  );
}
