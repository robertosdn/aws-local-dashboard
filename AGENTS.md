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

Choose `NNN` as the next sequential number after the highest-numbered directory
already present in `.specs/`. Numbering is global and never restarts for a
different feature context: a new feature for the same service, domain, or
workflow still gets its own new directory with the next sequence number. Never
reuse an existing number or group a new feature into an earlier directory.


- Always create unit tests, and before the task conclusion, make an e2e test on browser.


**Never implement code without explicit request.** SDD flow: specification → implementation → validation → documentation.

### Task Tracking
When implementing tasks from `tasks.md`, mark completed tasks with `[X]` prefix (e.g., `- [X] Task description`). This provides visibility into progress.

## Local Development
- Run `ministackorg/ministack` Docker container on port `4566`
- Configure dashboard to use `http://localhost:4566`
- React dev server serves frontend; container emulates AWS APIs separately

## Security Constraints
- **Never** bundle permanent AWS credentials in frontend source, build-time env vars, or browser storage
- Use local emulator for development
- For real AWS: use short-lived credential flows with minimal permissions

## Current State
The project is a working React + TypeScript + Vite dashboard with AWS-compatible endpoint settings, Amazon SQS queue workflows, and AWS Lambda inspection/invocation. S3 and DynamoDB pages are placeholders for future features.
