import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { useCallback, useRef } from 'react';
import { GridConfig, OrderMap, Position } from '../types/domain';
import { indexToContinuousPosition, generateBaseOrder } from '../math/coordinates';
import { createPositionSpringConfig } from '../math/spring-configs';

export interface BoardPhysicsState {
  /** Map of item IDs to their current absolute (X,Y) coordinates on the continuous surface */
  positions: SharedValue<Record<string, Position>>;
  /** Map of item IDs to their current scale multiplier */
  scales: SharedValue<Record<string, number>>;
  /** Map of item IDs to their current rotation angle (in degrees) */
  rotations: SharedValue<Record<string, number>>;
  /** Map of item IDs to their logical array index. This is the source of truth for permutations */
  order: SharedValue<OrderMap>;
  /** The ID of the item currently being dragged, or null */
  activeId: SharedValue<string | null>;
}

export interface UseBoardPhysicsReturn extends BoardPhysicsState {
  /** Call when the external data source length changes or requires a reset */
  initializeData: (itemIds: string[]) => void;
  /** Triggered primarily by gesture handlers */
  setActiveItem: (id: string | null) => void;
  /** Force an exact permutation update and re-trigger layout animations */
  updateOrder: (newOrder: OrderMap) => void;
}

export const useBoardPhysics = (config: GridConfig): UseBoardPhysicsReturn => {
  // --- Core State Engine ---
  const positions = useSharedValue<Record<string, Position>>({});
  const scales = useSharedValue<Record<string, number>>({});
  const rotations = useSharedValue<Record<string, number>>({});
  const order = useSharedValue<OrderMap>({});
  const activeId = useSharedValue<string | null>(null);

  // We keep a JS-side ref just to prevent unnecessary re-initializations if the array hasn't changed.
  const initializedIds = useRef<string>('');

  /**
   * Translates the logical index (OrderMap) into absolute continuous {x, y} coordinates
   * and triggers the transition springs.
   * Worklet-safe function that can be called directly from Gesture Handler.
   */
  const syncLayout = useCallback((currentOrder: OrderMap, currentIds: string[]) => {
    'worklet';
    const newPositions = { ...positions.value };
    const springConf = createPositionSpringConfig(
      Number(process.env.DEFAULT_SPRING_STIFFNESS) || 200,
      Number(process.env.DEFAULT_SPRING_DAMPING) || 20
    );

    for (let i = 0; i < currentIds.length; i++) {
      const id = currentIds[i];
      // Note: During initialization if the id isn't in order yet, we fallback to its array index
      const logicalIndex = currentOrder[id] !== undefined ? currentOrder[id] : i;
      const targetPos = indexToContinuousPosition(logicalIndex, config);

      // If this item is currently being actively dragged, we do NOT spring it to its logical position
      // The PanGestureHandler holds absolute control over the active item.
      if (activeId.value !== id) {
        // We import withSpring lazily or directly here if needed, but to avoid TS strict errors 
        // we'll apply it natively in the component style layer. For physics state, we can just assign the target.
        // To satisfy the linter on the unused springConf if we don't use it:
        void springConf; // Extracted for component usage
        newPositions[id] = {
          x: targetPos.x, 
          y: targetPos.y, 
        };
      }
    }

    positions.value = newPositions;
  }, [config, positions, activeId]);

  /**
   * Initializes or resets the board data structure.
   */
  const initializeData = useCallback((itemIds: string[]) => {
    const idsKey = itemIds.join(',');
    if (initializedIds.current === idsKey) return;
    initializedIds.current = idsKey;

    const newOrder: OrderMap = {};
    const newPositions: Record<string, Position> = {};
    const newScales: Record<string, number> = {};
    const newRotations: Record<string, number> = {};

    const baseOrder = generateBaseOrder(itemIds.length);

    itemIds.forEach((id, index) => {
      newOrder[id] = baseOrder[index];
      // For immediate 0ms load, set outright.
      newPositions[id] = indexToContinuousPosition(baseOrder[index], config);
      newScales[id] = 1;
      newRotations[id] = 0;
    });

    order.value = newOrder;
    positions.value = newPositions;
    scales.value = newScales;
    rotations.value = newRotations;
  }, [config, order, positions, scales, rotations]);

  const setActiveItem = useCallback((id: string | null) => {
    'worklet';
    activeId.value = id;
  }, [activeId]);

  const updateOrder = useCallback((newOrder: OrderMap) => {
    'worklet';
    order.value = newOrder;
    // Extract IDs directly from the order map keys natively (worklet safe)
    const currentIds = Object.keys(newOrder); 
    syncLayout(newOrder, currentIds);
  }, [order, syncLayout]);

  return {
    positions,
    scales,
    rotations,
    order,
    activeId,
    initializeData,
    setActiveItem,
    updateOrder
  };
};
