import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useCreatureStore } from '../../core/state/store';
import { SPECIES } from '../../core/engine/species';

// Picking this lets the egg hatch into a random pet
const SURPRISE = 'surprise';

export const HomeScreen = ({ navigation }: any) => {
  const { creature, createCreature, isLoading, error } = useCreatureStore();
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState(SURPRISE);

  const handleCreateCreature = async () => {
    const species =
      speciesId === SURPRISE ? SPECIES[Math.floor(Math.random() * SPECIES.length)].id : speciesId;
    await createCreature(name.trim() || 'My Pet', species);
    if (useCreatureStore.getState().creature) {
      navigation.navigate('Creature');
    }
  };

  const options = [
    { id: SURPRISE, name: 'Surprise', icon: '🎲' },
    ...SPECIES.map(species => ({ id: species.id, name: species.name, icon: species.sprites.baby })),
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Smart AI Friend</Text>
        <Text style={styles.subtitle}>Your virtual companion</Text>

        {!creature ? (
          <>
            <Text style={styles.sectionLabel}>Choose your pet</Text>
            <View style={styles.speciesGrid}>
              {options.map(option => {
                const selected = option.id === speciesId;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.speciesCard, selected && styles.speciesCardSelected]}
                    onPress={() => setSpeciesId(option.id)}
                    accessibilityRole="button"
                    accessibilityLabel={option.name}
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.speciesIcon}>{option.icon}</Text>
                    <Text
                      style={[styles.speciesName, selected && styles.speciesNameSelected]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.speciesDescription}>
              {speciesId === SURPRISE
                ? 'Who knows what will hatch?'
                : SPECIES.find(species => species.id === speciesId)?.description}
            </Text>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  speciesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.sm,
  },
  speciesCard: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  speciesCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  speciesIcon: {
    fontSize: theme.typography.fontSize['3xl'],
    marginBottom: theme.spacing.xs,
  },
  speciesName: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  speciesNameSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  speciesDescription: {
    minHeight: 40,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
