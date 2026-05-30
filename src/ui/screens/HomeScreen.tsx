import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useCreatureStore } from '../../core/state/store';

export const HomeScreen = ({ navigation }: any) => {
  const { creature, createCreature, isLoading } = useCreatureStore();

  const handleCreateCreature = async () => {
    await createCreature('My Pet');
    if (useCreatureStore.getState().creature) {
      navigation.navigate('Creature');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart AI Friend</Text>
      <Text style={styles.subtitle}>Your virtual companion</Text>

      {!creature ? (
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateCreature}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Start New Egg'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Creature')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing['2xl'],
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
