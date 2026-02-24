# Execution Plan: 002-pure-math-engine

## Objective
Implement the pure, framework-agnostic mathematical foundation for the continuous sorting board. This layer will map the 1D flat array to the 2D continuous surface, calculate spring configurations (including the ±2° wiggle and 1.1x lift), handle boundary intersections, and provide array permutation logic for reordering.

## Success / Acceptance Criteria (Observable)
- [ ] `src/types/domain.ts` contains strict Zod schemas for mathematical inputs (Coordinates, Dimensions, Indices).
- [ ] `src/math/coordinates.ts` contains pure functions for index-to-position mapping and coordinate-to-index resolution.
- [ ] `src/math/spring-configs.ts` provides configurable constants and generation functions for Reanimated 3 springs (with lift and wiggle properties).
- [ ] The math layer has absolutely zero dependencies on React, React Native, gesture handler, or UI components.
- [ ] Comprehensive unit tests exist for all mathematical logic in `tests/math/`, targeting 100% coverage.

## Progress
- [x] Define Zod domain types (`Position`, `Size`, `GridConfig`).
- [x] Implement `calculateItemPosition(index, config)` in `coordinates.ts`.
- [x] Implement `resolveCoordinateToIndex(x, y, config)` in `coordinates.ts`.
- [x] Implement `calculateIntersectionArea(rectA, rectB)` (for drop-zone detection) in `coordinates.ts`.
- [x] Provide spring generation functions in `spring-configs.ts` according to `.env` parameters.
- [x] Write tests covering edge cases (negative bounds, out-of-bounds indices, empty arrays).

## Step-by-Step Implementation Plan
1. Define robust Zod schemas in `src/types/domain.ts` that represent `ItemSize`, `BoardDimensions`, and visual permutations. Export TypeScript types inferred from these schemas.
2. Develop pure geometry functions in `src/math/coordinates.ts`:
   - `indexToContinuousPosition`: Translates a flat index into `(x, y)` relative to horizontal pages and columns/rows.
   - `positionToIndex`: The inverse, resolving a drop coordinate back to the logical array index.
   - `getIntersectingIndex`: Determines which item slot has the highest overlapping area during a drag.
   - `reorderArray`: A pure permutation function modeling the underlying state swap.
3. Develop spring physics constants and generators in `src/math/spring-configs.ts` aligned with the 1.1x lift and ±2° continuous wobble requirements.
4. Implement rigorous Jest unit tests covering every pure math function to ensure 100% test coverage before any UI integration.

## Files to Create/Modify
- `src/types/domain.ts`
- `src/math/coordinates.ts`
- `src/math/spring-configs.ts`
- `tests/math/coordinates.test.ts`
- `tests/math/spring-configs.test.ts`

## Validation Plan for Each Major Milestone
- **Milestone 1:** `npx jest tests/math` executes successfully, testing that the geometry functions output expected coordinates and correctly reject invalid inputs (zod validation).
- **Milestone 2:** Test coverage report shows 100% branch and statement coverage for the `src/math` directory.
- **Milestone 3:** Typecheck strictly passes with no "any" types leaking from the math module.

## Decision Log
- Utilizing strictly functional pure math to ensure that the layout remains deterministic regardless of the UI framework.

## Retrospective / Surprises
- Achieved **100% branch and statement coverage** with robust handling of padding, column/row overlaps, and structural edge cases. The isolation between logic and framework has immediately proven to make geometry very easily testable via Jest and standard generic Node operations prior to touching any Reanimated components.
