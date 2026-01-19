import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

interface ProgressBarProps {
  label?: string;
  value: number;
  max?: number;
  showPercent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ label, value, max = 100, showPercent = true, style }: ProgressBarProps) {
  const { theme } = useTheme();
  const safeValue = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? safeValue / max : 0;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}
        {showPercent ? (
          <Text style={[styles.value, { color: theme.textPrimary }]}>{Math.round(percentage * 100)}%</Text>
        ) : null}
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { width: `${percentage * 100}%`, backgroundColor: theme.primary }]} />
      </View>
      <Text style={[styles.amount, { color: theme.textSecondary }]}>{`${safeValue.toFixed(0)} / ${max}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  label: {
    fontSize: 12
  },
  value: {
    fontSize: 12,
    fontWeight: '600'
  },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 999
  },
  amount: {
    marginTop: 6,
    fontSize: 12
  }
});
