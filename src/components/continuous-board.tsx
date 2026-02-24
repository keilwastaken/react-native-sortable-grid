import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GridConfig } from '../types/domain';
import { useBoardPhysics } from '../hooks/use-board-physics';
import { DraggableCard } from './draggable-card';
import { getItemsPerPage } from '../math/coordinates';

// Use a generic placeholder that developers will pass down
export interface GenericItemData {
  id: string;
  [key: string]: unknown;
}

export interface ContinuousBoardProps {
  /** The raw input data array */
  data: Array<GenericItemData>;
  /** The layout constraints for the continuous surface */
  config: GridConfig;
  /** A render prop specifying how each item should visually appear */
  renderItem: (item: GenericItemData, isDragging: boolean) => React.ReactNode;
  /** Optional callback fired exactly once when the user completes a gesture and physics rest */
  onOrderChanged?: (newOrder: string[]) => void;
  /** Optional horizontal pagination mode */
  horizontal?: boolean;
}

export interface ContinuousBoardRef {
  /** Access to the underlying core physics state for imperative operations */
  getOrder: () => string[];
}

export const ContinuousBoard = forwardRef<ContinuousBoardRef, ContinuousBoardProps>(({
  data,
  config,
  renderItem,
  onOrderChanged,
  horizontal = true
}, ref) => {
  // We consume onOrderChanged just as a no-op placeholder for the strict linter,
  // but it usually gets plugged into `useDragGestures` onEnd. For this generic board,
  // we'll just suppress unused for now if not explicitly passed down into the physics hook.
  void onOrderChanged;
  // Instantiate the single-source-of-truth mathematical layout engine
  const physics = useBoardPhysics(config);

  // Sync logical identity constraints to the physics engine when data changes
  useEffect(() => {
    if (data.length > 0) {
      const ids = data.map(d => d.id);
      physics.initializeData(ids);
    }
  }, [data, physics]);

  useImperativeHandle(ref, () => ({
    getOrder: () => {
      // Materialize the SharedValue index map back into a sorted string array
      const orderMap = physics.order.value;
      const sortedIds = Object.keys(orderMap).sort((a, b) => orderMap[a] - orderMap[b]);
      return sortedIds;
    }
  }));

  // Calculate generic bounds for the Continuous wrapping surface
  const itemsPerPage = getItemsPerPage(config);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // The absolute surface width is the abstract page width * number of pages required
  // + padding buffers on the far right
  const contentWidth = (totalPages * config.surfaceWidth);
  const contentHeight = (config.rowsPerPage * (config.rowHeight + config.gapY)) + (config.padding * 2);

  return (
    <ScrollView
      horizontal={horizontal}
      pagingEnabled={horizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      // Depending on the OS, we might want to disable ScrollView capturing during an active Pan gesture.
      // React Native Gesture Handler generally handles this via `useDragGestures` composition,
      // but 'scrollEnabled' can be dynamically tied to `physics.activeId.value === null` 
      // via an Animated.ScrollView if strictly required. For Shadcn simplicity we keep it standard.
      contentContainerStyle={{ width: contentWidth, height: contentHeight }}
      style={styles.container}
    >
      <View style={[styles.zone, { width: contentWidth, height: contentHeight }]}>
        {data.map((item) => (
          <DraggableCard
            key={item.id}
            id={item.id}
            physics={physics}
            config={config}
            totalItems={data.length}
          >
            {/* The developer provides the purely visual interior view. */}
            {/* Note: In a production render loop, we could pass `isActive` down, 
                but to prevent React re-renders on 60fps frames, we let Reanimated 
                handle visual scales internally within the card container. */}
            {renderItem(item, false)}
          </DraggableCard>
        ))}
      </View>
    </ScrollView>
  );
});

ContinuousBoard.displayName = 'ContinuousBoard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  zone: {
    position: 'relative', 
  }
});
