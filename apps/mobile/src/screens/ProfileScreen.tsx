import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeProvider';

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { theme, themes, themeKey, setTheme, skinLabel } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Perfil do Caçador" subtitle={`Skin ativa: ${skinLabel}`} />
      <Card title="Rank">
        <View style={styles.profileRow}>
          <View>
            <Text style={[styles.rank, { color: theme.primary }]}>S2</Text>
            <Text style={[styles.smallText, { color: theme.textSecondary }]}>Subnível 3 • 3.850 pontos</Text>
          </View>
          <Text style={[styles.smallText, { color: theme.textPrimary }]}>Streak: 11 dias</Text>
        </View>
      </Card>

      <Card title="Tema e classe">
        <Text style={[styles.smallText, { color: theme.textSecondary }]}>Escolha uma cor para todo o app:</Text>
        <View style={styles.themeGrid}>
          {themes.map(option => {
            const selected = option.key === themeKey;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected ? option.tokens.primary : option.tokens.card,
                    borderColor: selected ? option.tokens.accent : option.tokens.border
                  }
                ]}
                onPress={() => setTheme(option.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.themeLabel, { color: option.tokens.textPrimary }]}>{option.skin}</Text>
                <Text style={[styles.themeMeta, { color: option.tokens.textSecondary }]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card title="Mais">
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.accent }]} onPress={() => navigation.navigate('Diet')}>
          <Text style={[styles.actionText, { color: theme.textPrimary }]}>Dieta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Settings')}>
          <Text style={[styles.actionText, { color: theme.textPrimary }]}>Configurações</Text>
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
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rank: {
    fontSize: 44,
    fontWeight: '700'
  },
  smallText: {
    fontSize: 12,
    marginTop: 4
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'space-between'
  },
  themeOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 8
  },
  themeLabel: {
    fontWeight: '700'
  },
  themeMeta: {
    fontSize: 12,
    marginTop: 2
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12
  },
  actionText: {
    fontWeight: '600'
  }
});
