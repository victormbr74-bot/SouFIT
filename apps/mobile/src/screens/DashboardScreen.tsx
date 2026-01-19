import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

const recentActivities = [
  'Treino de explosão registrado.',
  'Corrida de 4,2km adicionada ao histórico.',
  'Missão diária "Treino Diario" concluída.'
];

export function DashboardScreen() {
  const { theme, skinLabel } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Dashboard" subtitle={`Skin atual: ${skinLabel}`} />

      <Card title="XP do Caçador">
        <View style={styles.detailRow}>
          <View>
            <Text style={[styles.largeNumber, { color: theme.textPrimary }]}>3.850</Text>
            <Text style={[styles.muted, { color: theme.textSecondary }]}>Rank S1 • 3 subníveis restantes</Text>
          </View>
          <Badge label="Nova skin desbloqueada" variant="accent" />
        </View>
        <ProgressBar label="Progresso para S2" value={320} max={500} />
      </Card>

      <Card title="Streak">
        <Text style={[styles.largeNumber, { color: theme.success }]}>11 dias</Text>
        <Text style={[styles.muted, { color: theme.textSecondary }]}>Todos os dias ativos com atividades registradas.</Text>
        <ProgressBar label="Consistência mensal" value={18} max={30} />
      </Card>

      <Card title="Atividades recentes">
        {recentActivities.map(activity => (
          <Text key={activity} style={[styles.activityText, { color: theme.textPrimary }]}>
            • {activity}
          </Text>
        ))}
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  largeNumber: {
    fontSize: 32,
    fontWeight: '700'
  },
  muted: {
    fontSize: 12,
    marginTop: 2
  },
  activityText: {
    fontSize: 14,
    marginBottom: 6
  }
});
