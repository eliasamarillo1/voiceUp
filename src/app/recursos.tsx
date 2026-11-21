import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { techniques } from '../data/techniques';
import { Page } from '../components/ui';
import { TechniqueExplorer } from '../components/TechniqueExplorer';
import { fonts, colors } from '../theme';

// Biblioteca de recursos vocales: explorar, aprender qué es cada uno y llegar a sus ejercicios.
export default function TechniquesLibrary() {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <Page>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Text style={styles.back}>← Biblioteca</Text>
        </Pressable>
        <Text style={styles.title}>Recursos vocales</Text>
        <Text style={styles.sub}>
          {techniques.length} recursos para explorar. Elige uno para ver qué es, probar un ejercicio
          rápido y entrenarlo con vídeos.
        </Text>
        <TechniqueExplorer />
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.bold,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: { color: colors.text, fontSize: 38, fontFamily: fonts.display },
  sub: {
    color: colors.muted,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 24,
  },
});
