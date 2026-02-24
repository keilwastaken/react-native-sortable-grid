import { renderHook, act } from '@testing-library/react-native';
import { useBoardPhysics } from '../../src/hooks/use-board-physics';
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

describe('Hooks > useBoardPhysics', () => {
  it('initializes position, scale, rotation, and order correctly', () => {
    const { result } = renderHook(() => useBoardPhysics(MOCK_CONFIG));

    act(() => {
      // Init with ['A', 'B']
      result.current.initializeData(['A', 'B']);
    });

    const positions = result.current.positions.value;
    const scales = result.current.scales.value;
    const rotations = result.current.rotations.value;
    const order = result.current.order.value;

    expect(order['A']).toBe(0);
    expect(order['B']).toBe(1);

    expect(scales['A']).toBe(1);
    expect(rotations['B']).toBe(0);

    // Coordinate mapping correctness from math module guarantees
    // A starts at index 0 => x=10, y=10
    expect(positions['A'].x).toBe(10);
    expect(positions['A'].y).toBe(10);
  });

  it('updates the active item identifier safely', () => {
    const { result } = renderHook(() => useBoardPhysics(MOCK_CONFIG));
    
    act(() => {
      // Worklet invocation shim
      result.current.setActiveItem('A');
    });

    expect(result.current.activeId.value).toBe('A');
  });

  it('updateOrder natively triggers the syncLayout physics', () => {
    const { result } = renderHook(() => useBoardPhysics(MOCK_CONFIG));
    
    act(() => {
      result.current.initializeData(['A', 'B']);
    });

    // We start with { A: 0, B: 1 }. Let's drag A to index 1.
    // So the new order map says: A->1, B->0.
    act(() => {
      result.current.updateOrder({ 'A': 1, 'B': 0 });
    });

    expect(result.current.order.value['A']).toBe(1);
    expect(result.current.order.value['B']).toBe(0);

    // Because this triggers the UI thread spring immediately synchronously on the mock env, 
    // the value resolves to the target immediately.
    // B goes to index 0 (10, 10).
    expect(result.current.positions.value['B'].x).toBe(10);
  });
});
