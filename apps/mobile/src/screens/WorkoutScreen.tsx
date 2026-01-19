import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

const workouts = [
  { id: 'w1', name: 'Treino HIIT', description: 'Aquecimento + circuitos com peso corporal', status: 'Pendente' },
  { id: 'w2', name: 'Força Inferior', description: 'Agachamentos, afundos e panturrilhas', status: 'Pendente' },
  { id: 'w3', name: 'Core Samurai', description: 'Prancha dinâmica e movimentos isométricos', status: 'Concluído' }
];

export function WorkoutScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Treinos" subtitle="Conclua para ganhar pontos" />
      {workouts.map(workout => (
        <Card key={workout.id} title={workout.name} style={styles.card}>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{workout.description}</Text>
          <View style={styles.workoutFooter}>
            <Badge label={workout.status} variant={workout.status === 'Concluído' ? 'success' : 'primary'} />
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
              <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
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
  description: {
    fontSize: 14,
    marginBottom: 12
  },
  workoutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999
  },
  buttonText: {
    fontWeight: '600'
  },
  card: {
    marginBottom: 8
  }
});
