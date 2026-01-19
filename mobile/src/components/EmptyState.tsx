import { GestureResponderEvent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: (event: GestureResponderEvent) => void;
}

export function EmptyState({ icon = '⋆', title, description, actionLabel, onActionPress }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.icon, { color: theme.glow }]}>{icon}</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16
  },
  icon: {
    fontSize: 36,
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999
  },
  buttonText: {
    fontWeight: '600'
  }
});
