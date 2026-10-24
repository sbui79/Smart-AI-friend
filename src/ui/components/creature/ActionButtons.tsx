import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface ActionButtonsProps {
  isAsleep: boolean;
  onAction: (action: string) => void;
}

const ACTIONS = [
  { action: 'feed', label: 'Feed', icon: '🍎' },
  { action: 'play', label: 'Play', icon: '🎾' },
  { action: 'clean', label: 'Clean', icon: '🫧' },
  { action: 'pet', label: 'Pet', icon: '🤚' },
  { action: 'train', label: 'Train', icon: '🎯' },
  { action: 'gift', label: 'Gift', icon: '🎁' },
];

/**
 * ActionButtons Component
 * Grid of care actions; only petting is allowed while the creature sleeps
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({ isAsleep, onAction }) => {
  return (
    <View style={styles.grid}>
      {ACTIONS.map(({ action, label, icon }) => {
        const disabled = isAsleep && action !== 'pet';
        return (
          <TouchableOpacity
            key={action}
            style={[styles.button, disabled && styles.disabled]}
            onPress={() => onAction(action)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.label}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.sm,
  },
  button: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: theme.typography.fontSize['2xl'],
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
});

export default ActionButtons;
