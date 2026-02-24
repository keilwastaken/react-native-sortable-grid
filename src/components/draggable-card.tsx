import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDragGestures } from '../hooks/use-drag-gestures';
import { UseBoardPhysicsReturn } from '../hooks/use-board-physics';
import { GridConfig } from '../types/domain';
import { createPositionSpringConfig } from '../math/spring-configs';

export interface DraggableCardProps {
  /** The unique identifier for this item */
  id: string;
  /** The physics engine state and control returned by useBoardPhysics */
  physics: UseBoardPhysicsReturn;
  /** The mathematical constraints of the continuous board */
  config: GridConfig;
  /** Total number of active items in the grid for bound assertion */
  totalItems: number;
  /** Custom styles for the wrapper container */
  style?: ViewStyle;
  /** The content to render inside the card */
  children: React.ReactNode;
}

export const DraggableCard = React.memo(({
  id,
  physics,
  config,
  totalItems,
  style,
  children
}: DraggableCardProps) => {

  const gesture = useDragGestures({
    itemId: id,
    physics,
    config,
    totalItems,
  });

  const animatedStyle = useAnimatedStyle(() => {
    // Read the shared values for this specific card
    const targetPos = physics.positions.value[id];
    const itemScale = physics.scales.value[id] ?? 1;
    const itemRotation = physics.rotations.value[id] ?? 0;
    const isActive = physics.activeId.value === id;

    // We only retrieve constraints if mathematically positioned
    const x = targetPos?.x ?? 0;
    const y = targetPos?.y ?? 0;

    // Fetch default spring configurations
    const springConf = createPositionSpringConfig(
      Number(process.env.DEFAULT_SPRING_STIFFNESS) || 200,
      Number(process.env.DEFAULT_SPRING_DAMPING) || 20
    );

    return {
      position: 'absolute',
      // If the item is being actively dragged, assign translation instantly with zero latency.
      // If it is resting or being swapped, animate it to its logical index slot via physics spring.
      left: isActive ? x : withSpring(x, springConf),
      top: isActive ? y : withSpring(y, springConf),
      width: config.columnWidth,
      height: config.rowHeight,
      // The Z-index must be higher for the active drag target so it floats above neighbors
      zIndex: isActive ? 999 : 1,
      // Rotations and Scales are already sprang natively by the gesture hook triggers
      transform: [
        { scale: itemScale },
        { rotate: `${itemRotation}deg` }
      ]
    };
  }, [id, config]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
});

DraggableCard.displayName = 'DraggableCard';

const styles = StyleSheet.create({
  card: {
    // Base styles ensuring the card cannot accidentally capture sub-gestures 
    // outside of our composed pan/long-press
  },
});
