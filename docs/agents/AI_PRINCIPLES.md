# AI Principles & Harness Engineering Philosophy

This project adheres to a strict "AI-First Harness Engineering" philosophy to allow advanced AI agents to build and evolve the codebase reliably with minimal human intervention.

## The 7 Unbreakable Rules

### 1. Repository Hygiene & Security (Context & Guardrails)
- Always ignore: dependency folders, build artifacts, logs, `.env`, any local config.
- Always create `.env.example` with clear placeholders.
- **Goal:** keep the repo tiny and safe so LLM context windows stay efficient and secrets never leak.

### 2. Living Documentation System
Create and maintain a `docs/` folder with this exact structure:
- `docs/plans/` — all execution plans (living documents)
- `docs/architecture/` — ARCHITECTURE.md and diagrams
- `docs/agents/` — AI_PRINCIPLES.md and AGENTS.md
- `docs/decisions/` — ADRs for major choices (created only when needed)

### 3. Explicit Architecture (ARCHITECTURE.md)
Reference `ARCHITECTURE.md` from the root. It must contain:
- High-level overview and data flow (e.g., how the flat data array translates to coordinate logic).
- Codemap (directory structure emphasizing the separation of the continuous-board, zone-container, draggable-card, and the hooks/math libraries).
- Strict layer boundaries and dependency rules.
- Key architectural invariants (especially "X never depends on Y").
- Cross-cutting concerns.
- Update it only when we introduce a new convention (keep it stable).

### 4. Parse, Don’t Validate (Type-Driven Design)
At every boundary (API input, DB read, external call, config):
- Immediately parse raw data into strict domain types using Zod.
- Internal business logic may ONLY accept these parsed types.
- Make illegal states unrepresentable.

### 5. Harness Engineering & Verifiability
- Scaffold the full testing harness (unit + integration) on day one.
- Write tests for core domain logic before or alongside implementation.
- Aim for **100% coverage** on business logic (like the index-to-coordinate flat array math).
- Set up linting, formatting, and type-checking that run automatically.
- All code must be deterministic and observable.

### 6. AI-Optimized Code Structure
- Functions are small, pure, and single-responsibility.
- Separate pure business logic from framework/I/O glue.
- Prefer many small, well-named files and semantic domain types (`UserId`, `DragCoordinates`, etc.) over primitives.
- Every public function has a clear docstring explaining the **why** (business rule/invariant/decision), not the **how**.
- Naming and filesystem structure act as documentation for agents.

### 7. Execution Plans (Mandatory Gate)
Before any significant feature, change, or refactoring:
- Create a living execution plan in `docs/plans/XXX-descriptive-name.md`.
- Wait for explicit "APPROVED" before writing any code.
