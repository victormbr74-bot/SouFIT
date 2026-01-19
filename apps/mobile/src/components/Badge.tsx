import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const { theme } = useTheme();

  const backgroundColor = {
    primary: `${theme.primary}22`,
    accent: `${theme.accent}22`,
    success: `${theme.success}22`,
    warning: `${theme.warning}22`,
    danger: `${theme.danger}22`,
    muted: `${theme.textSecondary}22`
  }[variant];

  const textColor = {
    primary: theme.primary,
    accent: theme.accent,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    muted: theme.textSecondary
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 12,
    fontWeight: '600'
  }
});
