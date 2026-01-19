import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

export function SettingsScreen() {
  const { theme, themeLabel, skinLabel } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Configurações" subtitle="Personalize o app Solo Leveling" />
      <Card>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Tema ativo</Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{skinLabel} ({themeLabel})</Text>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Sincronização</Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>Modo offline • Preparado para sensores</Text>
      </Card>
      <Card title="Importação e exportação">
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]}>
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Importar dados do SouFIT Web</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]}>
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Exportar dados para backup</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    paddingBottom: 32
  },
  label: {
    fontSize: 12,
    marginBottom: 4
  },
  value: {
    fontSize: 16,
    fontWeight: '600'
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  buttonText: {
    fontWeight: '700'
  }
});
