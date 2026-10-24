import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AnimatedCreature, IdlePose, idlePoseFor } from '../AnimatedCreature';

describe('AnimatedCreature', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Leave the Reduce Motion lookup pending so it doesn't update state after each test
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(() => {}));
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const poses: IdlePose[] = ['egg', 'sleep', 'hop', 'bob', 'sway', 'still'];

  it.each(poses)('renders the sprite in the %s pose', pose => {
    render(<AnimatedCreature sprite="🐣" pose={pose} />);
    expect(screen.getByText('🐣')).toBeTruthy();
  });

  it('shows floating Zzz only while asleep', () => {
    const { rerender } = render(<AnimatedCreature sprite="🐣" pose="sleep" />);
    expect(screen.getByText('💤')).toBeTruthy();

    rerender(<AnimatedCreature sprite="🐣" pose="hop" />);
    expect(screen.queryByText('💤')).toBeNull();
  });

  it('floats reaction emoji for a care action', () => {
    render(<AnimatedCreature sprite="🐣" pose="hop" reaction={{ action: 'feed', id: 1 }} />);
    expect(screen.getAllByText('😋')).toHaveLength(3);
  });

  it('giggles with hearts when tapped', () => {
    render(<AnimatedCreature sprite="🐣" pose="bob" />);
    fireEvent.press(screen.getByLabelText('Tap your friend'));
    expect(screen.getAllByText('💕')).toHaveLength(3);
  });

  it('still shows reaction emoji when Reduce Motion is on', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    render(<AnimatedCreature sprite="🐣" pose="hop" />);
    await act(async () => {});

    fireEvent.press(screen.getByLabelText('Tap your friend'));
    expect(screen.getAllByText('💕')).toHaveLength(3);
  });

  it('clears reaction emoji once they float away', () => {
    render(<AnimatedCreature sprite="🐣" pose="hop" reaction={{ action: 'gift', id: 1 }} />);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('🎉')).toBeNull();
  });
});

describe('idlePoseFor', () => {
  const base = { isDead: false, isEgg: false, isAsleep: false, mood: 'neutral' as const };

  it('keeps a dead creature still', () => {
    expect(idlePoseFor({ ...base, isDead: true, isEgg: true, isAsleep: true })).toBe('still');
  });

  it('wobbles an egg, even while asleep', () => {
    expect(idlePoseFor({ ...base, isEgg: true, isAsleep: true })).toBe('egg');
  });

  it('breathes slowly while asleep', () => {
    expect(idlePoseFor({ ...base, isAsleep: true, mood: 'excited' })).toBe('sleep');
  });

  it('hops when happy or excited', () => {
    expect(idlePoseFor({ ...base, mood: 'happy' })).toBe('hop');
    expect(idlePoseFor({ ...base, mood: 'excited' })).toBe('hop');
  });

  it('sways when sad, tired or sick', () => {
    expect(idlePoseFor({ ...base, mood: 'sad' })).toBe('sway');
    expect(idlePoseFor({ ...base, mood: 'tired' })).toBe('sway');
    expect(idlePoseFor({ ...base, mood: 'sick' })).toBe('sway');
  });

  it('bobs gently when neutral', () => {
    expect(idlePoseFor(base)).toBe('bob');
  });
});
