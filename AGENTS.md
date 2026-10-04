# AGENTS.md

## Project Overview

Client-side AWS resource dashboard (React + React Router + Tailwind with project-owned UI components; shadcn/ui is a reference). No backend - browser calls AWS-compatible endpoints directly (e.g., `ministackorg/ministack` on `localhost:4566`).

## Documentation Standards

- All documentation must be written in English
- All flow diagrams or architecture overview or Request/sequence flows must use Mermaid.js

## Architecture and UI Components

See `docs/architecture.md` for the current architecture, request flow, security boundaries, and UI component rules.

- Reuse or extend project-owned primitives in `src/components/ui/` before creating another UI component.
- Consult shadcn/ui as a reference for established component patterns and accessibility; do not install or generate its components by default.
- Implement and maintain reusable primitives locally to match this project's visual system and dependencies.
- Keep the existing React Router + Vite application; do not scaffold another framework for UI components.

## SDD Specifications

See `.specs/` for specification documents and templates.

When asked to create a new feature, only create the feature documents in `.specs/NNN-feature_name/` containing:

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

## Local Development

- Run `ministackorg/ministack` Docker container on port `4566`
- Configure dashboard to use `http://localhost:4566`
- React dev server serves frontend; container emulates AWS APIs separately

## Test Resource Helpers

- When adding support for a new AWS resource type, create two dedicated new helpers in `scripts/` for that resource type: one to create the resource and another to add deterministic sample data in MinStack so the dashboard has data to display. Do not put one resource type's setup in another resource type's helpers; for example, DynamoDB table creation and item insertion belong in separate DynamoDB scripts, not in the SQS helpers. These setup helpers are distinct from scripts that exercise or validate dashboard operations.
- The `scripts/` directory contains Node.js helpers that provision and exercise local AWS test resources.
- `scripts/create-sqs-lambda.mjs` creates the example SQS queue, Lambda function, and event source mapping.
- `scripts/send-sqs-test-message.mjs` sends a test message to that queue. Keep its default queue name aligned with the provisioning helper; both can be configured with `QUEUE_NAME`.
- Provisioning helpers must target the local emulator by default, use dummy credentials, and be safe to rerun without deleting existing resources. Do not use them with real AWS credentials or endpoints.

## Security Constraints

- **Never** bundle permanent AWS credentials in frontend source, build-time env vars, or browser storage
- Use local emulator for development
- For real AWS: use short-lived credential flows with minimal permissions

## Current State
