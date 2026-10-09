# AGENTS.md

## Project Overview

Client-side AWS resource dashboard (React + React Router + Tailwind with project-owned UI components; shadcn/ui is a reference). No backend - browser calls AWS-compatible endpoints directly (e.g., `ministackorg/ministack` on `localhost:4566`).

## Documentation Standards

- All documentation must be written in English
- All flow diagrams or architecture overview or Request/sequence flows must use Mermaid.js

## Architecture, UI Components & Documentation

See `docs/` for full documentation:

- `docs/architecture.md` — System architecture, request flow, security boundaries
- `docs/ui-patterns.md` — UI conventions: page headers, action buttons (View/Items/Open/Delete), sidebar labels, detail views, design tokens
- `docs/constitution.md` — Project principles
- `docs/product.md` — Product overview

### Implementation Rules

- Reuse or extend project-owned primitives in `src/components/ui/` before creating another UI component.
- Consult shadcn/ui as a reference for established component patterns and accessibility; do not install or generate its components by default.
- Implement and maintain reusable primitives locally to match this project's visual system and dependencies.
- Keep the existing React Router + Vite application; do not scaffold another framework for UI components.
- Follow `docs/ui-patterns.md` for page structure, action buttons, and resource page conventions.

## SDD Specifications

See `.specs/index.md` for specification documents and templates.

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