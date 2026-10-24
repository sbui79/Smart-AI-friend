import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useCreatureStore } from '../../core/state/store';

export const HomeScreen = ({ navigation }: any) => {
  const { creature, createCreature, isLoading, error } = useCreatureStore();
  const [name, setName] = useState('');

  const handleCreateCreature = async () => {
    await createCreature(name.trim() || 'My Pet');
    if (useCreatureStore.getState().creature) {
      navigation.navigate('Creature');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart AI Friend</Text>
      <Text style={styles.subtitle}>Your virtual companion</Text>

      {!creature ? (
        <>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name your friend"
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={20}
            returnKeyType="done"
            onSubmitEditing={handleCreateCreature}
            accessibilityLabel="Creature name"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateCreature}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Creating...' : 'Start New Egg'}</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Creature')}>
          <Text style={styles.buttonText}>Visit {creature.name}</Text>
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
  input: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
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
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
