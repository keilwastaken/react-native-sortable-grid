import { SpringConfig } from '../types/domain';

/**
 * Generates the spring configuration for the continuous positional translation
 * when a card snaps to a new position.
 */
export const createPositionSpringConfig = (stiffness: number, damping: number): SpringConfig => {
  return {
    stiffness,
    damping,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  };
};

/**
 * Generates the spring configuration for the iOS-style "lift" (scale) effect.
 * Needs to be slightly stiffer than translation for immediate tactile feedback.
 */
export const createLiftSpringConfig = (baseStiffness: number): SpringConfig => {
  return {
    stiffness: baseStiffness * 1.5,
    damping: 15, // Less damping = slightly bouncier pop
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  };
};

/**
 * Generates the spring configuration for the ±2° continuous "wiggle" rotation.
 * Needs high elasticity to create the oscillation effect if toggled repeatedly on a timer.
 */
export const createWiggleSpringConfig = (): SpringConfig => {
  return {
    // A soft, low-damped spring facilitates the wiggle wobble
    stiffness: 100,
    damping: 5,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  };
};
