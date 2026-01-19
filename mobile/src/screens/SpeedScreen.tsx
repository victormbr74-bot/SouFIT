import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

export function SpeedScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Speed" subtitle="Registro manual e histórico" />

      <Card title="Resumo de corridas">
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.metric, { color: theme.textPrimary }]}>0 km</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Distância total</Text>
          </View>
          <View>
            <Text style={[styles.metric, { color: theme.textPrimary }]}>--:--</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Melhor ritmo</Text>
          </View>
        </View>
      </Card>

      <EmptyState
        icon="🏃"
        title="Nenhuma corrida registrada"
        description="Adicione seu primeiro treino de velocidade para desbloquear o histórico."
        actionLabel="Adicionar corrida"
      />
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metric: {
    fontSize: 26,
    fontWeight: '700'
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4
  }
});
