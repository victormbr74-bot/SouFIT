import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

const macros = [
  { label: 'Calorias', value: '1895 kcal' },
  { label: 'Proteína', value: '163 g' },
  { label: 'Carbs', value: '168 g' },
  { label: 'Gordura', value: '60 g' }
];

const meals = [
  { name: 'Café da manhã', time: '07:00', description: 'Ovos mexidos e aveia' },
  { name: 'Pré-treino', time: '10:30', description: 'Banana e pasta de amendoim' },
  { name: 'Almoço', time: '13:00', description: 'Frango grelhado com arroz integral' }
];

export function DietScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Dieta" subtitle="Plano Solo Leveling" />

      <Card title="Macros do dia">
        <View style={styles.macroGrid}>
          {macros.map(macro => (
            <View key={macro.label} style={styles.macroItem}>
              <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{macro.label}</Text>
              <Text style={[styles.macroValue, { color: theme.textPrimary }]}>{macro.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card title="Refeições">
        {meals.map(meal => (
          <View key={meal.name} style={styles.mealRow}>
            <View>
              <Text style={[styles.mealName, { color: theme.textPrimary }]}>{meal.name}</Text>
              <Text style={[styles.mealDescription, { color: theme.textSecondary }]}>{meal.description}</Text>
            </View>
            <Text style={[styles.mealTime, { color: theme.accent }]}>{meal.time}</Text>
          </View>
        ))}
      </Card>

      <EmptyState title="Nenhum registro de dieta" description="Registre sua refeição diária para acompanhar macros e calorias." />
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
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  macroItem: {
    width: '48%',
    marginBottom: 12
  },
  macroLabel: {
    fontSize: 12
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700'
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600'
  },
  mealDescription: {
    fontSize: 12
  },
  mealTime: {
    fontSize: 14,
    fontWeight: '600'
  }
});
