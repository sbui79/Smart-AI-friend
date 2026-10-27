import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { useCreatureStore } from '../../../core/state/store';
import { SPECIES } from '../../../core/engine/species';

describe('HomeScreen', () => {
  const navigation = { navigate: jest.fn() };
  let createCreature: jest.Mock;

  beforeEach(() => {
    createCreature = jest.fn().mockResolvedValue(undefined);
    useCreatureStore.setState({ creature: null, isLoading: false, error: null, createCreature });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows every pet to choose from, plus a surprise option', () => {
    render(<HomeScreen navigation={navigation} />);

    expect(screen.getByLabelText('Surprise')).toBeTruthy();
    for (const species of SPECIES) {
      expect(screen.getByLabelText(species.name)).toBeTruthy();
    }
  });

  it('hatches the chosen pet', async () => {
    render(<HomeScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Dragon'));
    expect(screen.getByText(SPECIES.find(species => species.id === 'dragon')!.description)).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Creature name'), 'Spike');
    await act(async () => {
      fireEvent.press(screen.getByText('Start New Egg'));
    });

    expect(createCreature).toHaveBeenCalledWith('Spike', 'dragon');
  });

  it('picks a random pet for a surprise egg', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    render(<HomeScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.press(screen.getByText('Start New Egg'));
    });

    expect(createCreature).toHaveBeenCalledWith('My Pet', SPECIES[SPECIES.length - 1].id);
  });
});
