import { z } from 'zod';

// -- Basic Geometry Primitives --

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
}).strict();
export type Position = z.infer<typeof PositionSchema>;

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
}).strict();
export type Size = z.infer<typeof SizeSchema>;

export const RectSchema = PositionSchema.extend({
  width: z.number().positive(),
  height: z.number().positive(),
}).strict();
export type Rect = z.infer<typeof RectSchema>;

// -- Board & Grid Configuration --

export const GridConfigSchema = z.object({
  /** Width of the entire horizontally paginated surface context (usually screen width) */
  surfaceWidth: z.number().positive(),
  /** Width of a single column */
  columnWidth: z.number().positive(),
  /** Height of a single row */
  rowHeight: z.number().positive(),
  /** Number of columns per page/screen */
  columnsPerPage: z.number().int().positive(),
  /** Number of rows per page/screen */
  rowsPerPage: z.number().int().positive(),
  /** Optional gap between items horizontally */
  gapX: z.number().nonnegative().default(0),
  /** Optional gap between items vertically */
  gapY: z.number().nonnegative().default(0),
  /** Padding around the edges of a page */
  padding: z.number().nonnegative().default(0),
}).strict();
export type GridConfig = z.infer<typeof GridConfigSchema>;

// -- Animation & Physics --

export const SpringConfigSchema = z.object({
  stiffness: z.number().positive(),
  damping: z.number().positive(),
  mass: z.number().positive().default(1),
  overshootClamping: z.boolean().default(false),
  restDisplacementThreshold: z.number().positive().default(0.01),
  restSpeedThreshold: z.number().positive().default(2),
}).strict();
export type SpringConfig = z.infer<typeof SpringConfigSchema>;

// -- State Types (No Zod validation needed for internal Reanimated shared value representations) --

/**
 * Represents the layout permutation of the board.
 * keys are stringified item IDs, values are their current logical index.
 */
export type OrderMap = Record<string, number>;
