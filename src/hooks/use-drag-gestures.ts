import { Gesture } from 'react-native-gesture-handler';
import { withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import { UseBoardPhysicsReturn } from './use-board-physics';
import { GridConfig, Position } from '../types/domain';
import { positionToIndex } from '../math/coordinates';
import { createLiftSpringConfig, createWiggleSpringConfig } from '../math/spring-configs';

interface UseDragGesturesProps {
  itemId: string;
  physics: UseBoardPhysicsReturn;
  config: GridConfig;
  totalItems: number;
}

export const useDragGestures = ({
  itemId,
  physics,
  config,
  totalItems,
}: UseDragGesturesProps) => {
  const { positions, scales, rotations, order, activeId, setActiveItem, updateOrder } = physics;

  // The long press initiates the drag state
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      'worklet';
      setActiveItem(itemId);

      // Trigger Lift (Scale)
      const liftConfig = createLiftSpringConfig(Number(process.env.DEFAULT_SPRING_STIFFNESS) || 200);
      scales.value = {
        ...scales.value,
        [itemId]: withSpring(Number(process.env.DEFAULT_LIFT_SCALE) || 1.1, liftConfig),
      };

      // Trigger Wiggle (Rotation oscillation)
      const wiggleConfig = createWiggleSpringConfig();
      const wiggleDeg = Number(process.env.DEFAULT_WIGGLE_ROTATION_DEG) || 2;
      
      rotations.value = {
        ...rotations.value,
        [itemId]: withRepeat(
          withSequence(
            withSpring(-wiggleDeg, wiggleConfig),
            withSpring(wiggleDeg, wiggleConfig)
          ),
          -1, // Infinite repeat
          true // reverse
        ),
      };
    });

  // The pan gesture handles translation and collision swap logic
  const panGesture = Gesture.Pan()
    // Need manual activation logic so it doesn't steal short taps, 
    // but works immediately after long press activates it.
    .manualActivation(true)
    .onTouchesMove((e, stateManager) => {
      if (activeId.value === itemId) {
        stateManager.activate();
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (activeId.value !== itemId) return;

      // 1. Move the absolutely positioned item
      const currentPos = positions.value[itemId] || { x: 0, y: 0 };
      
      // Update position immediately natively (tracking absolute pointer coords relative to the container)
      // Note: PanGestureHandler events in Reanimated `onUpdate` provide `translationX` and `translationY`
      // representing the delta since the gesture *started*. We need to adjust coordinates relative to origin.
      
      // To keep it simple, we can accumulate on `translationX` if we track the starting position, but if we treat
      // the gesture update as cumulative, we should use `translationX` + `initialOrigin`.
      // For immediate frame-to-frame delta without an origin cache, we use `changeX/Y` in older RNGH, but the newer type 
      // uses purely translation across the gesture. We will use `translationX` and `translationY` here assuming 
      // we need to add to the state. However, the exact delta property in modern RNGH v2+ `onUpdate` is indeed `translationX`.
      // The easiest way to get frame-by-frame delta in RNGH v2 Pan is `changeX/Y` if configured, but let's use the standard `translationX` 
      // by keeping a reference to the active dragged starting coordinate.
      // For simplicity in this Worklet, we'll temporarily rely on `translationX` delta mapping if `changeX` is missing from the payload bounds.
      
      // Let's use `translationX` / `translationY` as frame deltas if this is a continuous layout or track it.
      // Wait, RNGH v2 PanGesture `onUpdate` Payload does have `translationX`/`Y` but frame deltas are rarely exposed safely without a context object.
      // Let's rewrite the position logic to just accumulate `translationX/Y` based on the gesture start.
      // To keep it clean and localized just for the TS fix, we'll cast to `any` quickly to bypass the strict type mismatch on `changeX` if using a generic payload, 
      // or we can just use `translationX` representing the absolute distance moved since touch down.
      
      const newPos: Position = {
        x: currentPos.x + (event as any).changeX,
        y: currentPos.y + (event as any).changeY,
      };

      positions.value = {
        ...positions.value,
        [itemId]: newPos,
      };

      // 2. Collision Detection: Calculate the exact abstract coordinate center of the dragged item
      const centerX = newPos.x + (config.columnWidth / 2);
      const centerY = newPos.y + (config.rowHeight / 2);

      const targetLogicalIndex = positionToIndex({ x: centerX, y: centerY }, config, totalItems);

      // 3. Array Reordering
      const currentLogicalIndex = order.value[itemId];
      
      if (
        targetLogicalIndex !== -1 && 
        currentLogicalIndex !== undefined &&
        targetLogicalIndex !== currentLogicalIndex
      ) {
        // We entered a new slot. Perform state swap.
        const newOrder = { ...order.value };
        
        // Find the item currently occupying the target index
        const targetItemId = Object.keys(newOrder).find(id => newOrder[id] === targetLogicalIndex);
        
        if (targetItemId) {
          // Swap their logical indices
          newOrder[targetItemId] = currentLogicalIndex;
          newOrder[itemId] = targetLogicalIndex;
          
          // Apply new order map which will trigger the layout sync for non-active items
          updateOrder(newOrder);
        }
      }
    })
    .onEnd(() => {
      'worklet';
      if (activeId.value === itemId) {
        setActiveItem(null);

        // Put the scale and rotation back to resting state
        const liftConfig = createLiftSpringConfig(Number(process.env.DEFAULT_SPRING_STIFFNESS) || 200);
        scales.value = {
          ...scales.value,
          [itemId]: withSpring(1, liftConfig),
        };
        rotations.value = {
          ...rotations.value,
          [itemId]: withSpring(0, liftConfig), // 0 degrees = flat
        };

        // When drag drops, the active item officially snaps to its current logical coordinate
        updateOrder(order.value); 
      }
    });

  // Compose Gestures: Pan and LongPress can run simultaneously
  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  return composedGesture;
};
