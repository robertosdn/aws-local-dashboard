# SDD Specifications

See `.specs/` for specification documents and templates.

When asked to create a new feature, the agent should first ask clarifying questions to confirm design decisions before generating any documents. This includes questions about:
- Action buttons (View, Items, Open, Delete, etc.)
- Pagination and data loading patterns
- Detail view requirements
- Any resource-specific UI conventions from `docs/ui-patterns.md`
- Architectural decisions: API layer patterns, hook patterns, component composition, state management, shared service reuse vs. feature-specific implementations

Only after confirming these decisions, create the feature documents in `.specs/NNN-feature_name/` containing:

- `prd.md` - Product Requirements Document (product/usability requirements ONLY, no technical details)
- `spec.md` - Technical Specification (architecture, data structures, APIs, implementation details)
- `tasks.md` - Implementation Tasks

For every new AWS resource feature, create two dedicated scripts in `scripts/`: one to create the resource and another to add deterministic sample data to it. Keep these scripts specific to that AWS resource type; do not add provisioning for a different resource type to an existing resource's scripts (for example, keep DynamoDB setup separate from SQS setup). The feature `spec.md` must specify both scripts, and `tasks.md` must include separate implementation and verification tasks for creating the resource and adding sample data. This is local data setup for the feature, not a substitute for unit tests, UI/e2e validation, or scripts that exercise resource operations. Require local endpoint defaults, dummy credentials, safe reruns without deleting existing resources, and no use with real AWS credentials or endpoints.

Choose `NNN` as the next sequential number after the highest-numbered directory
already present in `.specs/`. Numbering is global and never restarts for a
different feature context: a new feature for the same service, domain, or
workflow still gets its own new directory with the next sequence number. Never
reuse an existing number or group a new feature into an earlier directory.

- Always create unit tests, and before the task conclusion, make an e2e test on browser.

**Never implement code without explicit request.** SDD flow: specification → implementation → validation → documentation.

### Task Tracking

When implementing a feature from `tasks.md`, track completion item by item as work progresses. Immediately after an individual task is fully completed, mark that specific task `[X]` (for example, `- [X] Task description`) before moving on to the next task; do not wait until the end to update several completed tasks together. Keep incomplete tasks unchecked, and do not mark work complete based only on intent or partial implementation.