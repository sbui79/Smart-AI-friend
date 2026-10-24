import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface StatBarProps {
  label: string;
  value: number;  // 0-100
}

/**
 * StatBar Component
 * Horizontal meter that turns amber, then red, as a stat gets low
 */
export const StatBar: React.FC<StatBarProps> = ({ label, value }) => {
  const rounded = Math.round(value);
  const color =
    rounded < 20 ? theme.colors.error : rounded < 50 ? theme.colors.warning : theme.colors.success;

  return (
    <View style={styles.row} accessibilityLabel={`${label} ${rounded} percent`}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${rounded}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.value}>{rounded}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    width: 96,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceSecondary,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  value: {
    width: 36,
    textAlign: 'right',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
});

export default StatBar;
