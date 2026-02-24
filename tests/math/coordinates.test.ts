import {
  indexToContinuousPosition,
  positionToIndex,
  calculateIntersectionArea,
  getItemsPerPage,
  generateBaseOrder
} from '../../src/math/coordinates';
import { GridConfig } from '../../src/types/domain';

const MOCK_CONFIG: GridConfig = {
  surfaceWidth: 400, // E.g., device width
  columnWidth: 100,
  rowHeight: 100,
  columnsPerPage: 3,
  rowsPerPage: 4,
  padding: 10,
  gapX: 10,
  gapY: 10,
};

describe('Math > coordinates.ts', () => {
  describe('getItemsPerPage()', () => {
    it('calculates total correctly', () => {
      expect(getItemsPerPage(MOCK_CONFIG)).toBe(12);
    });
  });

  describe('indexToContinuousPosition()', () => {
    it('returns padding offset for index 0', () => {
      const pos = indexToContinuousPosition(0, MOCK_CONFIG);
      expect(pos).toEqual({ x: 10, y: 10 });
    });

    it('returns padding for negative indices', () => {
      const pos = indexToContinuousPosition(-5, MOCK_CONFIG);
      expect(pos).toEqual({ x: 10, y: 10 });
    });

    it('calculates x and y correctly for second item (index 1)', () => {
      // row 0, col 1
      const pos = indexToContinuousPosition(1, MOCK_CONFIG);
      // x = 10 + 1 * (100+10) = 120
      // y = 10 + 0 = 10
      expect(pos).toEqual({ x: 120, y: 10 });
    });

    it('calculates correct y for second row (index 3)', () => {
      // row 1, col 0
      const pos = indexToContinuousPosition(3, MOCK_CONFIG);
      // x = 10 + 0 = 10
      // y = 10 + 1 * (100+10) = 120
      expect(pos).toEqual({ x: 10, y: 120 });
    });

    it('pads the coordinate with surfaceWidth for item on Page 2 (index 12)', () => {
      // index 12 is the 1st item of the 2nd page
      const pos = indexToContinuousPosition(12, MOCK_CONFIG);
      // x = 400 * 1 + 10 = 410
      // y = 10
      expect(pos).toEqual({ x: 410, y: 10 });
    });
  });

  describe('positionToIndex()', () => {
    it('returns 0 for top-left padded coordinate', () => {
      const targetIndex = positionToIndex({ x: 10, y: 10 }, MOCK_CONFIG, 20);
      expect(targetIndex).toBe(0);
    });

    it('returns -1 for coordinates strictly inside top padding area', () => {
      const targetIndex = positionToIndex({ x: 5, y: 5 }, MOCK_CONFIG, 20);
      expect(targetIndex).toBe(-1);
    });

    it('returns -1 for coordinates landing inside horizontal gaps', () => {
      // cell width 100, gap 10 => gap is from 110 to 120
      const targetIndex = positionToIndex({ x: 115, y: 10 }, MOCK_CONFIG, 20);
      expect(targetIndex).toBe(-1);
    });

    it('returns -1 for coordinates landing inside vertical gaps', () => {
      // row height 100, gap 10 => gap is from 110 to 120
      const targetIndex = positionToIndex({ x: 10, y: 115 }, MOCK_CONFIG, 20);
      expect(targetIndex).toBe(-1);
    });

    it('returns 1 for valid coordinate inside second block', () => {
      // cell 2: x=120..220
      const targetIndex = positionToIndex({ x: 150, y: 50 }, MOCK_CONFIG, 20);
      expect(targetIndex).toBe(1);
    });

    it('correctly associates index 12 to second logical page coordinates', () => {
      // point on page 2: (410, 10).
      const targetIndex = positionToIndex({ x: 450, y: 50 }, MOCK_CONFIG, 20);
      expect(targetIndex).toBe(12);
    });

    it('returns -1 if coordinate maps to index greater than or equal to totalItems', () => {
      // x=10, y=10 => target=0 but total is 0
      const targetIndex = positionToIndex({ x: 10, y: 10 }, MOCK_CONFIG, 0);
      expect(targetIndex).toBe(-1);
    });

    it('returns -1 if mapped column or row exceeds per-page limit', () => {
      // Surface is 400, items are tightly packed, check wide margin beyond col 3
      const targetIndex = positionToIndex({ x: 380, y: 10 }, MOCK_CONFIG, 20);
      // We only have 3 columns (colWidth=100) -> 0..2. A point far to right is col 3.
      expect(targetIndex).toBe(-1);
    });
  });

  describe('calculateIntersectionArea()', () => {
    it('returns 0 for non-intersecting rects', () => {
      const r1 = { x: 0, y: 0, width: 10, height: 10 };
      const r2 = { x: 20, y: 20, width: 10, height: 10 };
      expect(calculateIntersectionArea(r1, r2)).toBe(0);
    });

    it('returns matching area for fully overlapping rects', () => {
      const r1 = { x: 0, y: 0, width: 10, height: 10 };
      expect(calculateIntersectionArea(r1, r1)).toBe(100);
    });

    it('returns partial area for half-overlapping rects', () => {
      const r1 = { x: 0, y: 0, width: 10, height: 10 };
      const r2 = { x: 5, y: 0, width: 10, height: 10 };
      expect(calculateIntersectionArea(r1, r2)).toBe(50);
    });
  });

  describe('generateBaseOrder()', () => {
    it('generates an array from 0 to n-1', () => {
      expect(generateBaseOrder(5)).toEqual([0, 1, 2, 3, 4]);
    });
    
    it('returns an empty array for length 0', () => {
      expect(generateBaseOrder(0)).toEqual([]);
    });
  });
});
