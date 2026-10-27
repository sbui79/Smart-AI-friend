import { DEFAULT_SPECIES_ID, EGG_SPRITE, SPECIES, getSpecies, spriteFor } from '../species';
import { EvolutionStage } from '../types';

const HATCHED_STAGES: Exclude<EvolutionStage, 'egg'>[] = ['baby', 'child', 'teen', 'adult', 'elder'];

describe('species', () => {
  it('offers the original chick plus 10 more pets', () => {
    expect(SPECIES).toHaveLength(11);
    expect(SPECIES[0].id).toBe(DEFAULT_SPECIES_ID);
  });

  it('gives every species a unique id and name', () => {
    expect(new Set(SPECIES.map(species => species.id)).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map(species => species.name)).size).toBe(SPECIES.length);
  });

  it.each(SPECIES.map(species => [species.name, species]))(
    '%s has a sprite for every life stage and a description',
    (_, species) => {
      for (const stage of HATCHED_STAGES) {
        expect(species.sprites[stage]).toBeTruthy();
      }
      expect(species.description).toBeTruthy();
    }
  );

  it('hatches every species from the same egg', () => {
    for (const species of SPECIES) {
      expect(spriteFor(species.id, 'egg')).toBe(EGG_SPRITE);
    }
  });

  it('keeps existing chicks looking the same', () => {
    expect(spriteFor(DEFAULT_SPECIES_ID, 'baby')).toBe('🐣');
    expect(spriteFor(DEFAULT_SPECIES_ID, 'elder')).toBe('🦉');
  });

  it('grows a dragon from a lizard', () => {
    expect(spriteFor('dragon', 'baby')).toBe('🦎');
    expect(spriteFor('dragon', 'adult')).toBe('🐉');
  });

  it('falls back to the chick for an unknown species', () => {
    expect(getSpecies('griffin').id).toBe(DEFAULT_SPECIES_ID);
    expect(spriteFor('griffin', 'baby')).toBe('🐣');
  });
});
