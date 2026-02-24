# Execution Plan: 004-interactive-components

## Objective
Implement the UI layer: `continuous-board.tsx`, `zone-container.tsx`, and `draggable-card.tsx`. These Shadcn-style components bind to the `useBoardPhysics` and `useDragGestures` hooks to render the animated, interactable grid. Establish the final integration test simulating a user drag interacting with rendered elements.

## Success / Acceptance Criteria (Observable)
- [ ] `ContinuousBoard` accepts a linear data array and config, rendering the scrollable container.
- [ ] `ZoneContainer` maps array elements and renders instances of `DraggableCard`.
- [ ] `DraggableCard` leverages `useAnimatedStyle` to bind its absolute `top`, `left`, `transform: [{scale}, {rotate}]` directly to the physics engine SharedValues.
- [ ] The entire UI is built without React context (to maintain Shadcn-style generic composability).
- [ ] The developer can customize the card's internal visual representation cleanly via a render prop or children.
- [ ] Final integration tests verify the component tree mounts and the hooks connect cleanly.

## Progress
- [x] Implement `DraggableCard` (animated style bindings & gesture wrapper).
- [x] Implement `ZoneContainer` (data mapping and layout context provider). // Merged into ContinuousBoard for simplicity.
- [x] Implement `ContinuousBoard` (root React Native `ScrollView` or abstract container).
- [x] Implement UI test asserting component mount and coordinate bindings.
- [x] Verify `npm run start` correctly launches an example instance without crashing.

## Step-by-Step Implementation Plan
1. **DraggableCard.tsx**: Creates an `Animated.View` wrapped in a `GestureDetector`. It consumes the physics `SharedValues` by key (`itemId`) and projects them into `useAnimatedStyle`.
2. **ZoneContainer.tsx**: Accepts the layout config and raw data array, instantiates `useBoardPhysics`, and maps the array into `DraggableCard`s.
3. **ContinuousBoard.tsx**: The Root. Provides the horizontal paginated constraints (if native `ScrollView` is used) or just a bounding `View`.
4. **App Integration**: Create a temporary dummy entry point in `src/index.ts` or `App.tsx` (if running locally) simulating 20 items to verify actual drag behaviors in visually correct space.
5. **Testing**: Add rendering tests ensuring no framework bugs.

## Files to Create/Modify
- `src/components/draggable-card.tsx`
- `src/components/zone-container.tsx`
- `src/components/continuous-board.tsx`
- `src/index.ts`
- `tests/components/components.test.tsx`

## Validation Plan for Each Major Milestone
- **Milestone 1:** Components typecheck strictly with 0 `any` usage.
- **Milestone 2:** React Native Testing Library confirms the components render without throwing Reanimated bridge errors.
- **Milestone 3:** The visual integration test (running via dummy app) demonstrates 60 FPS lift, wiggle, and position swaps native on the UI thread.

## Decision Log
- Components will remain entirely stateless regarding coordinate math. All logic resides strictly in the `useBoardPhysics` and pure math modules. 

## Retrospective / Surprises
- We merged the `ZoneContainer` concept directly into `ContinuousBoard` because the abstractions felt overly deep for a Shadcn-style copy-paste layout. The `ContinuousBoard` maps the elements into a Paginated ScrollView wrapper, and the pure math dictates absolute positioning perfectly. All tests passed correctly natively mounting the components.
