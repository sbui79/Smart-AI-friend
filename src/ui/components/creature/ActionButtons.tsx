import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface ActionButtonsProps {
  isAsleep: boolean;
  medicineDue?: boolean;
  onAction: (action: string) => void;
}

const ACTIONS = [
  { action: 'feed', label: 'Feed', icon: '🍎' },
  { action: 'play', label: 'Play', icon: '🎾' },
  { action: 'clean', label: 'Clean', icon: '🫧' },
  { action: 'pet', label: 'Pet', icon: '🤚' },
  { action: 'train', label: 'Train', icon: '🎯' },
  { action: 'gift', label: 'Gift', icon: '🎁' },
  { action: 'medicine', label: 'Medicine', icon: '💊' },
  { action: 'wake', label: 'Wake up', icon: '☀️' },
  { action: 'rock', label: 'Rock to sleep', icon: '🌙' },
];

// Actions available while the creature sleeps
const SLEEP_ACTIONS = ['pet', 'wake'];

/**
 * ActionButtons Component
 * Grid of care actions; while asleep the creature can only be petted or woken up.
 * Medicine is highlighted when a dose is due.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({ isAsleep, medicineDue, onAction }) => {
  return (
    <View style={styles.grid}>
      {ACTIONS.map(({ action, label, icon }) => {
        const disabled =
          (isAsleep && !SLEEP_ACTIONS.includes(action)) || (!isAsleep && action === 'wake');
        const highlighted = action === 'medicine' && medicineDue;
        return (
          <TouchableOpacity
            key={action}
            style={[styles.button, highlighted && styles.highlighted, disabled && styles.disabled]}
            onPress={() => onAction(action)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={highlighted ? 'Medicine is due now' : undefined}
            accessibilityState={{ disabled }}
          >
            {highlighted && (
              <View style={styles.badge} testID="medicine-due-badge">
                <Text style={styles.badgeText}>Now</Text>
              </View>
            )}
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
              {label}
            </Text>
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
  highlighted: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -4,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
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
