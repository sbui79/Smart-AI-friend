import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
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
  ringColor?: string;
}

const STAGE_SIZE = 240;
const PERSPECTIVE = 800;

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

// Reactions that end in a full 3D spin instead of a wiggle
const SPIN_ACTIONS = ['play', 'gift', 'poke'];

// Half-cycle duration and pause between cycles for each idle pose (ms)
const IDLE_TIMING: Record<Exclude<IdlePose, 'still'>, { duration: number; pause: number }> = {
  egg: { duration: 220, pause: 1800 },
  sleep: { duration: 1800, pause: 0 },
  hop: { duration: 280, pause: 900 },
  bob: { duration: 1000, pause: 0 },
  sway: { duration: 1600, pause: 0 },
};

// How far each awake pose turns its body while looking around
const LOOK_ANGLE: Partial<Record<IdlePose, number>> = {
  egg: 10,
  hop: 24,
  bob: 22,
  sway: 14,
};

// How much the ground shadow shrinks at the top of each idle hop
const IDLE_SHADOW_SCALE: Record<IdlePose, number> = {
  egg: 1,
  sleep: 1,
  hop: 0.7,
  bob: 0.9,
  sway: 1,
  still: 1,
};

const PARTICLE_OFFSETS = [-60, 0, 60];

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
      duration: 1200,
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
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -120 * travel] }) },
            { scale: progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.3, 1] }) },
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
 * Shows the creature in a glossy 3D-style bubble with an idle loop, a ground shadow,
 * squash-and-stretch reactions to care, tap-to-giggle and drag-to-turn
 */
export const AnimatedCreature: React.FC<AnimatedCreatureProps> = ({
  sprite,
  pose,
  dimmed,
  reaction,
  ringColor,
}) => {
  const reduceMotion = useReduceMotion();
  const idle = useRef(new Animated.Value(0)).current;
  const look = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0)).current;
  const land = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const zzz = useRef(new Animated.Value(0)).current;
  // Driven by touch on the JS thread, so it lives on its own view
  const drag = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<{ id: string; emoji: string; offsetX: number; delay: number }[]>([]);

  // Swipe sideways to turn the creature in 3D; it springs back when released
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => drag.setValue(gesture.dx),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: () =>
        Animated.spring(drag, { toValue: 0, friction: 4, tension: 60, useNativeDriver: false }).start(),
      onPanResponderTerminate: () =>
        Animated.spring(drag, { toValue: 0, friction: 4, tension: 60, useNativeDriver: false }).start(),
    })
  ).current;

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

  // Turn left and right now and then, as if looking around
  useEffect(() => {
    look.setValue(0);
    if (reduceMotion || !LOOK_ANGLE[pose]) return;

    const turn = (toValue: number, duration: number) =>
      Animated.timing(look, { toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true });
    const loop = Animated.loop(
      Animated.sequence([
        turn(1, 1400),
        Animated.delay(700),
        turn(-1, 2800),
        Animated.delay(700),
        turn(0, 1400),
        Animated.delay(1500),
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
    land.setValue(0);
    wiggle.setValue(0);
    spin.setValue(0);

    // Crouch, leap, fall and squash on landing
    const leap = Animated.sequence([
      Animated.timing(land, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(land, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(jump, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.timing(jump, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(land, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.spring(land, { toValue: 0, friction: 3, tension: 160, useNativeDriver: true }),
    ]);

    const flourish = SPIN_ACTIONS.includes(action)
      ? Animated.timing(spin, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
      : Animated.sequence(
          [-1, 1, -1, 1, 0].map(toValue =>
            Animated.timing(wiggle, { toValue, duration: 70, useNativeDriver: true })
          )
        );

    Animated.parallel([leap, flourish]).start(() => spin.setValue(0));
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
        return [{ rotate: idle.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-10deg', '10deg'] }) }];
      case 'sleep':
        return [
          { scale: idle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
          { rotateX: idle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '12deg'] }) },
        ];
      case 'hop':
        return [
          { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -24] }) },
          { scaleX: idle.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 1.07, 0.97] }) },
          { scaleY: idle.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 0.92, 1.05] }) },
        ];
      case 'bob':
        return [
          { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
          { scale: idle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
        ];
      case 'sway':
        return [
          { rotate: idle.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) },
          { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
        ];
      default:
        return [];
    }
  })();

  const lookAngle = LOOK_ANGLE[pose] ?? 0;

  // The shadow shrinks and fades as the creature rises off the ground
  const shadowScale = Animated.multiply(
    jump.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }),
    idle.interpolate({ inputRange: [0, 1], outputRange: [1, IDLE_SHADOW_SCALE[pose]] })
  );

  return (
    <View style={[styles.bubble, ringColor ? { borderColor: ringColor, shadowColor: ringColor } : null]}>
      <View style={styles.bubbleLight} />
      <View style={styles.bubbleHighlight} />

      <Animated.View
        testID="ground-shadow"
        style={[
          styles.groundShadow,
          {
            opacity: jump.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }),
            transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
          },
        ]}
      />

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [
            { perspective: PERSPECTIVE },
            {
              rotateY: drag.interpolate({
                inputRange: [-150, 150],
                outputRange: ['-60deg', '60deg'],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <Pressable
          onPress={() => pose !== 'still' && react(pose === 'sleep' ? 'none' : 'poke')}
          disabled={pose === 'still'}
          accessibilityRole="button"
          accessibilityLabel="Tap your friend"
          accessibilityHint="Swipe sideways to turn them around"
        >
          <Animated.View
            style={{
              transform: [
                { perspective: PERSPECTIVE },
                { translateY: jump.interpolate({ inputRange: [0, 1], outputRange: [0, -64] }) },
                { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) },
                { rotateY: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                {
                  scaleX: Animated.multiply(
                    jump.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }),
                    land.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] })
                  ),
                },
                {
                  scaleY: Animated.multiply(
                    jump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }),
                    land.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] })
                  ),
                },
              ],
            }}
          >
            <Animated.Text
              style={[
                styles.sprite,
                dimmed && styles.dimmed,
                {
                  transform: [
                    { perspective: PERSPECTIVE },
                    ...idleTransform,
                    {
                      rotateY: look.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [`-${lookAngle}deg`, `${lookAngle}deg`],
                      }),
                    },
                  ],
                },
              ]}
            >
              {sprite}
            </Animated.Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      {pose === 'sleep' && (
        <Animated.Text
          style={[
            styles.zzz,
            !reduceMotion && {
              opacity: zzz.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: zzz.interpolate({ inputRange: [0, 1], outputRange: [8, -28] }) },
                { scale: zzz.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) },
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
  bubble: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    borderRadius: STAGE_SIZE / 2,
    borderWidth: 4,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    // Soft glow in the mood color
    shadowColor: theme.colors.border,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  // A lit inner sphere, shifted up, leaves a soft darker rim at the bottom for depth
  bubbleLight: {
    position: 'absolute',
    top: 6,
    width: STAGE_SIZE * 0.86,
    height: STAGE_SIZE * 0.86,
    borderRadius: STAGE_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  // Glossy shine in the top-left
  bubbleHighlight: {
    position: 'absolute',
    top: 28,
    left: 42,
    width: 70,
    height: 30,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    transform: [{ rotate: '-28deg' }],
  },
  // A faint ellipse whose own iOS shadow is blurred, so the edge stays soft
  groundShadow: {
    position: 'absolute',
    bottom: 42,
    width: 96,
    height: 14,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  sprite: {
    fontSize: 140,
    marginBottom: 12,
  },
  dimmed: {
    opacity: 0.6,
  },
  zzz: {
    position: 'absolute',
    top: 20,
    right: 26,
    fontSize: theme.typography.fontSize['3xl'],
  },
  particle: {
    position: 'absolute',
    top: 40,
    fontSize: theme.typography.fontSize['3xl'],
  },
});

export default AnimatedCreature;
