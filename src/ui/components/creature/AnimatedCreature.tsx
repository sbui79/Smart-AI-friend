import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mood } from '../../../core/engine/types';
import { theme } from '../../theme';

export type IdlePose = 'egg' | 'sleep' | 'hop' | 'bob' | 'sway' | 'still';

export interface Reaction {
  action: string;
  id: number;
}

interface AnimatedCreatureProps {
  sprite: string;
  pose: IdlePose;
  dimmed?: boolean;
  reaction?: Reaction | null;
}

// Emoji that float up when the creature reacts to care
const REACTION_EMOJI: Record<string, string> = {
  feed: '😋',
  play: '⭐',
  clean: '✨',
  pet: '💖',
  train: '💡',
  gift: '🎉',
  poke: '💕',
};

// Half-cycle duration and pause between cycles for each idle pose (ms)
const IDLE_TIMING: Record<Exclude<IdlePose, 'still'>, { duration: number; pause: number }> = {
  egg: { duration: 220, pause: 1800 },
  sleep: { duration: 1800, pause: 0 },
  hop: { duration: 260, pause: 900 },
  bob: { duration: 1000, pause: 0 },
  sway: { duration: 1600, pause: 0 },
};

const PARTICLE_OFFSETS = [-36, 0, 36];

/**
 * Pick the idle animation that matches how the creature feels
 */
export function idlePoseFor(options: {
  isDead: boolean;
  isEgg: boolean;
  isAsleep: boolean;
  mood: Mood;
}): IdlePose {
  if (options.isDead) return 'still';
  if (options.isEgg) return 'egg';
  if (options.isAsleep) return 'sleep';
  if (options.mood === 'happy' || options.mood === 'excited') return 'hop';
  if (options.mood === 'sad' || options.mood === 'tired' || options.mood === 'sick') return 'sway';
  return 'bob';
}

/**
 * Track the system Reduce Motion setting
 */
function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  return reduceMotion;
}

/**
 * A single emoji that floats up from the creature and fades away
 */
const Particle: React.FC<{
  emoji: string;
  offsetX: number;
  delay: number;
  reduceMotion: boolean;
  onDone: () => void;
}> = ({ emoji, offsetX, delay, reduceMotion, onDone }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 1100,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => finished && onDone());
    return () => animation.stop();
  }, []);

  const travel = reduceMotion ? 0 : 1;

  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          opacity: progress.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, offsetX * travel] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -80 * travel] }) },
            { scale: progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.2, 1] }) },
          ],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

/**
 * AnimatedCreature Component
 * Brings the creature sprite to life with an idle loop, reactions to care, and tap-to-giggle
 */
export const AnimatedCreature: React.FC<AnimatedCreatureProps> = ({ sprite, pose, dimmed, reaction }) => {
  const reduceMotion = useReduceMotion();
  const idle = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const zzz = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<{ id: string; emoji: string; offsetX: number; delay: number }[]>([]);

  // Idle loop for the current pose
  useEffect(() => {
    idle.setValue(0);
    if (reduceMotion || pose === 'still') return;

    const { duration, pause } = IDLE_TIMING[pose];
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.delay(pause),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pose, reduceMotion]);

  // Floating Zzz while asleep
  useEffect(() => {
    zzz.setValue(0);
    if (pose !== 'sleep' || reduceMotion) return;

    const loop = Animated.loop(
      Animated.timing(zzz, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pose, reduceMotion]);

  const react = (action: string) => {
    const emoji = REACTION_EMOJI[action];
    if (emoji) {
      const batch = PARTICLE_OFFSETS.map((offsetX, index) => ({
        id: `${Date.now()}-${index}`,
        emoji,
        offsetX,
        delay: index * 120,
      }));
      setParticles(current => [...current, ...batch]);
    }

    if (reduceMotion) return;

    jump.setValue(0);
    wiggle.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(jump, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(jump, { toValue: 0, friction: 4, tension: 120, useNativeDriver: true }),
      ]),
      Animated.sequence(
        [-1, 1, -1, 1, 0].map(toValue =>
          Animated.timing(wiggle, { toValue, duration: 70, useNativeDriver: true })
        )
      ),
    ]).start();
  };

  // Play a reaction whenever a new care action comes in
  useEffect(() => {
    if (reaction) {
      react(reaction.action);
    }
  }, [reaction?.id]);

  const removeParticle = (id: string) => {
    setParticles(current => current.filter(particle => particle.id !== id));
  };

  const idleTransform = (() => {
    switch (pose) {
      case 'egg':
        return [{ rotate: idle.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-9deg', '9deg'] }) }];
      case 'sleep':
        return [{ scale: idle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }];
      case 'hop':
        return [
          { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
          { scaleY: idle.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 0.94, 1.03] }) },
        ];
      case 'bob':
        return [{ translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }];
      case 'sway':
        return [{ rotate: idle.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) }];
      default:
        return [];
    }
  })();

  return (
    <View style={styles.stage}>
      <Pressable
        onPress={() => pose !== 'still' && react(pose === 'sleep' ? 'none' : 'poke')}
        disabled={pose === 'still'}
        accessibilityRole="button"
        accessibilityLabel="Tap your friend"
      >
        <Animated.View
          style={{
            transform: [
              { translateY: jump.interpolate({ inputRange: [0, 1], outputRange: [0, -28] }) },
              { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] }) },
            ],
          }}
        >
          <Animated.Text style={[styles.sprite, dimmed && styles.dimmed, { transform: idleTransform }]}>
            {sprite}
          </Animated.Text>
        </Animated.View>
      </Pressable>

      {pose === 'sleep' && (
        <Animated.Text
          style={[
            styles.zzz,
            !reduceMotion && {
              opacity: zzz.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: zzz.interpolate({ inputRange: [0, 1], outputRange: [6, -16] }) },
                { scale: zzz.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.15] }) },
              ],
            },
          ]}
        >
          💤
        </Animated.Text>
      )}

      {particles.map(particle => (
        <Particle
          key={particle.id}
          emoji={particle.emoji}
          offsetX={particle.offsetX}
          delay={particle.delay}
          reduceMotion={reduceMotion}
          onDone={() => removeParticle(particle.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    fontSize: 72,
  },
  dimmed: {
    opacity: 0.6,
  },
  zzz: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: theme.typography.fontSize['2xl'],
  },
  particle: {
    position: 'absolute',
    top: 20,
    fontSize: theme.typography.fontSize['2xl'],
  },
});

export default AnimatedCreature;
