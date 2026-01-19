import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ title, footer, children, style }: CardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      {title ? <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text> : null}
      <View style={styles.content}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  title: {
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 16
  },
  content: {
    flex: 1
  },
  footer: {
    marginTop: 16
  }
});
