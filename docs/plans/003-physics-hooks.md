# Execution Plan: 003-physics-hooks

## Objective
Implement `use-board-physics.ts` and `use-drag-gestures.ts` to bridge the pure math module (`src/math`) with the React Native UI thread via Reanimated 3 Worklets. This layer manages state permutations and interpolates continuous spring animations without crossing the JavaScript bridge.

## Success / Acceptance Criteria (Observable)
- [ ] `useBoardPhysics` hook manages an array of shared values representing exact {x, y} coordinates for each item.
- [ ] When the data array changes, `useBoardPhysics` automatically triggers continuous re-layouts via `withSpring` and the configurations defined in `src/math/spring-configs.ts`.
- [ ] `useDragGestures` integrates `react-native-gesture-handler` (Pan, LongPress) to manipulate individual item coordinates.
- [ ] Gestures trigger the 1.1x lift and ±2° wiggle oscillations on active items.
- [ ] Cross-zone intersection logic calls the math module to determine the `targetIndex` and updates the `OrderMap` shared value to visually swap surrounding items in real-time.
- [ ] All coordinates update strictly at 60 FPS on the UI thread.
- [ ] Integration tests verify that gesture events successfully update the shared continuous values.

## Progress
- [x] Setup `useBoardPhysics` core state (SharedValues for coordinates, wiggle angles, and scale).
- [x] Implement `syncArrayToCoordinates` Worklet to map the flat data array to absolute {x,y} targets.
- [x] Implement `useDragGestures` with Pan and LongPress gesture composition.
- [x] Integrate lift/wiggle spring triggers inside the gesture lifecycle.
- [x] Write Worklet-safe array permutation logic tracking the active drag target slot.
- [x] Write integration test assertions using `@testing-library/react-native`.

## Step-by-Step Implementation Plan
1. **Core State Engine:** In `use-board-physics.ts`, define the core `SharedValue` structures. We need a map of `itemId -> { x, y }`, `itemId -> scale`, and `itemId -> rotation`.
2. **Layout Sync:** Write a function that takes the current array order, calculates target coordinates using `indexToContinuousPosition`, and animates the shared values using `createPositionSpringConfig`.
3. **Gesture Harness:** In `use-drag-gestures.ts`, compose a `Gesture.LongPress()` to activate drag mode (triggering `createLiftSpringConfig` and `createWiggleSpringConfig`), followed sequentially by `Gesture.Pan()` to handle continuous translation.
4. **Collision Detection:** Inside the Pan gesture `onUpdate` Worklet, call `positionToIndex`. If the target index differs from the current index, perform a pure order swap and trigger a reactive layout sync for the resting items.
5. **Testing:** Set up mocked Reanimated integration tests mapping simulated gesture events to verified bounds changes.

## Files to Create/Modify
- `src/hooks/use-board-physics.ts`
- `src/hooks/use-drag-gestures.ts`
- `tests/hooks/use-board-physics.test.ts`
- `tests/hooks/use-drag-gestures.test.ts`

## Validation Plan for Each Major Milestone
- **Milestone 1:** The hook correctly interpolates mock array data into animated `{x, y}` shared values.
- **Milestone 2:** Simulating a Pan gesture updates the active item's `{x, y}` offsets natively without crashing the mock bridge.
- **Milestone 3:** `npx jest tests/hooks` passes cleanly.

## Decision Log
- To ensure optimal performance, the layout sequence state (`OrderMap`) will be maintained as a Reanimated Shared Value `Record<string, number>` to prevent unnecessary React re-renders during high-velocity drag permutations. React will only sync the final state `onEnd`.

## Retrospective / Surprises
- We discovered a minor typing inconsistency with RNGH v2 regarding frame deltas inside the `onUpdate` event object natively. We circumvented it by explicitly opting into the `changeX/Y` properties to keep the accumulation logic completely pure frame-to-frame without relying on React external cache. Tests assert that the physics engine maps mock touches strictly into the SharedValues array without crossing the bridge.
