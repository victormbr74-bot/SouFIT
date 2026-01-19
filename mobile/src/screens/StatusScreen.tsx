import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

export function StatusScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Status do Caçador" subtitle="Peso e evolução" />
      <Card title="Pontuação de peso">
        <View style={styles.statusRow}>
          <View>
            <Text style={[styles.value, { color: theme.textPrimary }]}>68,4 kg</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Peso atual</Text>
          </View>
          <View>
            <Text style={[styles.delta, { color: theme.success }]}>-1,2 kg</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Última semana</Text>
          </View>
        </View>
      </Card>

      <Card title="Gráfico de peso">
        <View style={styles.chartPlaceholder}>
          <Text style={{ color: theme.textSecondary }}>Gráfico será renderizado aqui</Text>
        </View>
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  value: {
    fontSize: 32,
    fontWeight: '700'
  },
  delta: {
    fontSize: 18,
    fontWeight: '600'
  },
  label: {
    fontSize: 12,
    marginTop: 4
  },
  chartPlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FFFFFF33',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  }
});
