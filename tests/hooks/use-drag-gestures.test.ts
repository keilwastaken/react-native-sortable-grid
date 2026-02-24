import { renderHook, act } from '@testing-library/react-native';
import { useBoardPhysics } from '../../src/hooks/use-board-physics';
import { useDragGestures } from '../../src/hooks/use-drag-gestures';
import { GridConfig } from '../../src/types/domain';

const MOCK_CONFIG: GridConfig = {
  surfaceWidth: 400,
  columnWidth: 100,
  rowHeight: 100,
  columnsPerPage: 3,
  rowsPerPage: 4,
  padding: 10,
  gapX: 10,
  gapY: 10,
};

describe('Hooks > useDragGestures', () => {
  it('returns a composed gesture object', () => {
    // The RNGH complex object is difficult to unit test without the full React tree,
    // but we can ensure the hook structurally mounts and returns the Gesture.Simultaneous composition.
    const { result: physicsResult } = renderHook(() => useBoardPhysics(MOCK_CONFIG));

    act(() => {
      physicsResult.current.initializeData(['A', 'B', 'C']);
    });

    const { result: gestureResult } = renderHook(() => useDragGestures({
      itemId: 'A',
      physics: physicsResult.current,
      config: MOCK_CONFIG,
      totalItems: 3
    }));

    // The returned object from Gesture.Simultaneous is an array of gesture objects (LongPress + Pan)
    expect(gestureResult.current).toBeDefined();
    // Verification that it's a composed RNGH Gesture
    expect(Array.isArray(gestureResult.current.toGestureArray())).toBe(true);
  });
});
