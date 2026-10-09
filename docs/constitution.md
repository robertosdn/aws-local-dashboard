# Constitution

## Technology

- React
- TypeScript
- Tailwind CSS
- Radix UI primitives where needed for accessible interactions

## Core Principles

### Reuse Before Creating

Reuse existing components, utilities, hooks, and patterns before creating
new ones.

### Simplicity

Prefer the simplest implementation that satisfies the specification.

### Separation of Concerns

Business logic must remain separated from presentation concerns.

### Accessibility

Interactive UI must follow accessible patterns and use semantic HTML
where appropriate.

### Consistency

New features must follow the established architecture and UI patterns.

## UI Rules

- Project-owned components in `src/components/ui/` are the reusable UI source of truth.
- Consult shadcn/ui only as a reference for common component patterns, composition, and accessibility.
- Reuse or extend an existing project component when it meets the need.
- Implement new reusable components locally to fit the project's visual system and dependencies; do not download, install, or generate shadcn/ui components by default.
- Tailwind CSS is the styling system.
- Do not introduce another UI component library without explicit approval.

## Dependencies

Do not add a dependency when the existing stack can reasonably solve
the requirement.

## Scope

Changes should remain within the scope of the requested feature unless
a dependency or architectural issue makes another change necessary.
