import { GridConfig, Position, Rect } from '../types/domain';

/**
 * Calculates the total number of items that can fit on a single page.
 */
export const getItemsPerPage = (config: GridConfig): number => {
  return config.columnsPerPage * config.rowsPerPage;
};

/**
 * Maps a flat 1D array index to a 2D continuous coordinate on the paginated surface.
 * @param index The flat array index (0-based)
 * @param config The layout parameters defining columns, rows, sizes, and padding
 * @returns The exact {x, y} coordinate representing the top-left of the item relative to the root continuous layout
 */
export const indexToContinuousPosition = (index: number, config: GridConfig): Position => {
  const itemsPerPage = getItemsPerPage(config);
  
  if (itemsPerPage <= 0 || index < 0) {
    return { x: config.padding, y: config.padding };
  }

  // Determine which page we are on
  const pageIndex = Math.floor(index / itemsPerPage);
  
  // Find the index relative to the current page
  const indexOnPage = index % itemsPerPage;
  
  // Calculate abstract row and column
  const row = Math.floor(indexOnPage / config.columnsPerPage);
  const col = indexOnPage % config.columnsPerPage;

  // The base x coordinate offset for the entire page in the continuous scrollview
  const pageXOffset = pageIndex * config.surfaceWidth;

  // Calculate local coordinates within the page, including gaps and padding
  const x = pageXOffset + config.padding + col * (config.columnWidth + config.gapX);
  const y = config.padding + row * (config.rowHeight + config.gapY);

  return { x, y };
};

/**
 * Validates whether a given {x, y} coordinate falls within the bounds of exactly one active slot,
 * and if so, returns the logical index of that slot.
 * @param position The current {x, y} continuous coordinate (e.g., from an active drag gesture relative to the ScrollView)
 * @param config Grid configuration spanning multiple pages
 * @param totalItems The maximum length of the active array to prevent returning out-of-bounds indices
 * @returns The target index if valid, or -1 if the position falls outside all bounded active areas (e.g. padding/gutters)
 */
export const positionToIndex = (position: Position, config: GridConfig, totalItems: number): number => {
  const { x, y } = position;

  // Determine which logical page this point belongs to
  const pageIndex = Math.floor(x / config.surfaceWidth);
  
  // Calculate relative X on the current abstract page
  const localX = x - (pageIndex * config.surfaceWidth);

  // Check top/left padding violation
  if (localX < config.padding || y < config.padding) {
    return -1;
  }

  const itemsPerPage = getItemsPerPage(config);

  // Determine column based on width + gap
  const rawCol = Math.floor((localX - config.padding) / (config.columnWidth + config.gapX));
  
  // Determine row based on height + gap
  const rawRow = Math.floor((y - config.padding) / (config.rowHeight + config.gapY));

  // Range checks for page boundaries
  if (rawCol < 0 || rawCol >= config.columnsPerPage || rawRow < 0 || rawRow >= config.rowsPerPage) {
    return -1;
  }

  // Calculate exact coordinates of the target cell to check if we are in the gutter (gap space)
  const cellLeft = config.padding + rawCol * (config.columnWidth + config.gapX);
  const cellTop = config.padding + rawRow * (config.rowHeight + config.gapY);
  
  // If the coordinate falls into the gap between columns, it's invalid
  if (localX > cellLeft + config.columnWidth) {
    return -1;
  }
  
  // If the coordinate falls into the gap between rows, it's invalid
  if (y > cellTop + config.rowHeight) {
    return -1;
  }

  const targetIndex = (pageIndex * itemsPerPage) + (rawRow * config.columnsPerPage) + rawCol;

  // Final check: cannot swap into a slot that exceeds the array length
  if (targetIndex >= totalItems || targetIndex < 0) {
    return -1;
  }

  return targetIndex;
};

/**
 * Calculates the intersecting area between two rectangles.
 * This can be used as an alternative to `positionToIndex` for overlap-based detection
 * rather than strict point-based detection.
 */
export const calculateIntersectionArea = (rectA: Rect, rectB: Rect): number => {
  const overlapX = Math.max(0, Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x));
  const overlapY = Math.max(0, Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y));
  
  return overlapX * overlapY;
};

/**
 * Generates an array of indices spanning from 0 to length - 1.
 * Useful for initializing the base identity order.
 */
export const generateBaseOrder = (length: number): number[] => {
  return Array.from({ length }, (_, i) => i);
};
