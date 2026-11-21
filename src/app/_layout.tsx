import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { BeeHelper } from '../components/BeeHelper';
import { colors } from '../theme';

// Ajustes finos de texto que solo existen en la web: letra más nítida y títulos equilibrados.
function useWebTextPolish() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent =
      'html,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}' +
      '[role=heading],[aria-level]{text-wrap:balance}' +
      'div[dir=auto]{text-wrap:pretty}';
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
}

export default function RootLayout() {
  useWebTextPolish();
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Esperamos a las tipografías para que la página no «salte» al cargarlas.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
      <BeeHelper />
    </View>
  );
}
