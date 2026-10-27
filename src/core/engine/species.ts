import { EvolutionStage } from './types';

export interface SpeciesDefinition {
  id: string;
  name: string;
  description: string;
  // Placeholder sprites for each life stage after hatching, until real artwork is available
  sprites: Record<Exclude<EvolutionStage, 'egg'>, string>;
}

// Every species hatches from the same egg, so the surprise is in the hatching
export const EGG_SPRITE = '🥚';

export const DEFAULT_SPECIES_ID = 'default';

export const SPECIES: SpeciesDefinition[] = [
  {
    // Keeps the original id so creatures saved before species existed stay chicks
    id: DEFAULT_SPECIES_ID,
    name: 'Chick',
    description: 'Cheerful and chirpy, grows into a wise old owl',
    sprites: { baby: '🐣', child: '🐥', teen: '🐤', adult: '🐦', elder: '🦉' },
  },
  {
    id: 'puppy',
    name: 'Puppy',
    description: 'Loyal and playful, always happy to see you',
    sprites: { baby: '🐶', child: '🐶', teen: '🐕', adult: '🐕', elder: '🦮' },
  },
  {
    id: 'kitten',
    name: 'Kitten',
    description: 'Curious and cuddly, loves a good nap',
    sprites: { baby: '🐱', child: '🐱', teen: '🐈', adult: '🐈', elder: '🐈‍⬛' },
  },
  {
    id: 'bunny',
    name: 'Bunny',
    description: 'Soft and bouncy, hops everywhere',
    sprites: { baby: '🐰', child: '🐰', teen: '🐇', adult: '🐇', elder: '🐇' },
  },
  {
    id: 'dragon',
    name: 'Dragon',
    description: 'Starts as a tiny lizard and grows into a mighty dragon',
    sprites: { baby: '🦎', child: '🦎', teen: '🐲', adult: '🐉', elder: '🐉' },
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    description: 'A little pony with a magical secret',
    sprites: { baby: '🐴', child: '🐴', teen: '🦄', adult: '🦄', elder: '🦄' },
  },
  {
    id: 'dinosaur',
    name: 'Dinosaur',
    description: 'A gentle giant from long, long ago',
    sprites: { baby: '🦕', child: '🦕', teen: '🦖', adult: '🦖', elder: '🦕' },
  },
  {
    id: 'fox',
    name: 'Fox',
    description: 'Clever and quick, with a fluffy tail',
    sprites: { baby: '🦊', child: '🦊', teen: '🦊', adult: '🦊', elder: '🦊' },
  },
  {
    id: 'panda',
    name: 'Panda',
    description: 'Calm and gentle, never says no to bamboo',
    sprites: { baby: '🐼', child: '🐼', teen: '🐼', adult: '🐼', elder: '🐼' },
  },
  {
    id: 'penguin',
    name: 'Penguin',
    description: 'Waddles, slides and loves the cold',
    sprites: { baby: '🐧', child: '🐧', teen: '🐧', adult: '🐧', elder: '🐧' },
  },
  {
    id: 'turtle',
    name: 'Turtle',
    description: 'Slow and steady, lives a long, long time',
    sprites: { baby: '🐢', child: '🐢', teen: '🐢', adult: '🐢', elder: '🐢' },
  },
];

/**
 * Look up a species, falling back to the default for unknown ids
 */
export function getSpecies(id: string): SpeciesDefinition {
  return SPECIES.find(species => species.id === id) ?? SPECIES[0];
}

/**
 * The sprite to show for a species at a life stage
 */
export function spriteFor(speciesId: string, stage: EvolutionStage): string {
  return stage === 'egg' ? EGG_SPRITE : getSpecies(speciesId).sprites[stage];
}
