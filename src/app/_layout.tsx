import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Federo_400Regular } from '@expo-google-fonts/federo';
import {
  AlegreyaSans_400Regular,
  AlegreyaSans_500Medium,
  AlegreyaSans_700Bold,
  AlegreyaSans_800ExtraBold,
} from '@expo-google-fonts/alegreya-sans';
import { BeeHelper } from '../components/BeeHelper';
import { colors } from '../theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Federo_400Regular,
    AlegreyaSans_400Regular,
    AlegreyaSans_500Medium,
    AlegreyaSans_700Bold,
    AlegreyaSans_800ExtraBold,
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
