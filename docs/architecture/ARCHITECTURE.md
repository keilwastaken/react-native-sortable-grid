# Architecture: react-native-sortable-board

## High-Level Overview & Data Flow
`react-native-sortable-board` implements a continuous surface architecture where a flat array of items is rendered across an infinitely paginated horizontal surface. 

**Data Flow Sequence:**
1. **Input Boundary:** Array of raw data items is injected and parsed via strict domain types using Zod.
2. **Pure Math Engine:** A pure functional layer calculates optimal row/column coordinates, spring offsets, index permutations, and cross-zone intersection boundaries based on the flat array and surface dimensions.
3. **Physics & Gestures:** Reanimated 3 Worklets and React Native Gesture Handler intercept user input (pan, long-press) and apply calculated spring physics (including the iOS-style ±2° wiggle and 1.1x scale lift) natively on the UI thread without crossing the JS bridge.
4. **View Rendering:** React components read shared Reanimated values to render the visual layout.

## Codemap
- `src/components/`: The Shadcn-style primitives. Zero vendor lock-in; designed to be copied/pasted.
  - `continuous-board.tsx`: The root container managing horizontal pagination and overall bounds.
  - `zone-container.tsx`: Defines standard drop zones and horizontal/vertical intersection thresholds.
  - `draggable-card.tsx`: The individual item container handling the 1.1x scale lift, continuous rotation, and coordinate updates.
- `src/hooks/`: The framework glue connecting pure math to Reanimated/React. Contains `use-board-physics` and `use-drag-gestures`.
- `src/math/`: 100% pure, unit-testable TypeScript functions for coordinate geometry, array reordering, and boundary detection.
- `src/types/`: Strict domain types implementing "Parse, Don't Validate".

## Strict Layer Boundaries and Dependency Rules
1. **Math has No Dependencies:** Modules in `src/math/` must NEVER import `react`, `react-native`, `react-native-reanimated`, or `react-native-gesture-handler`. They operate strictly on data-in, data-out principles.
2. **Components are Dumb:** `src/components/` dictate rendering and Reanimated styles, but NEVER contain complex array-sorting algorithms. They delegate business logic to `src/hooks/`.
3. **Types act as Guards:** Business logic exclusively consumes parsed domain types from `src/types/`, never raw `any` or unbounded inputs. Every boundary requires validation.

## Key Architectural Invariants
- **"Math never depends on Frameworks"**
- **"Gesture updates run exclusively on the UI thread (60 FPS Worklets)"**
- **"Invalid states are unrepresentable in the type system"** (e.g., negative coordinates, out-of-bounds indices).

## Cross-Cutting Concerns
- **Performance:** Reanimated Shared Values act as the single source of truth for all geometry and movement. State changes in React are restricted to non-continuous events (e.g., end of drag).
- **Testing:** The pure math module requires 100% test coverage. Components require integration tests enforcing expected gesture sequences and visual updates.
