# AGENTS.md

## Project Overview
Client-side AWS resource dashboard (React + React Router + Tailwind + shadcn/ui-inspired). No backend - browser calls AWS-compatible endpoints directly (e.g., `ministackorg/ministack` on `localhost:4566`). Initial focus: SQS queues.

## Documentation Standards
- All documentation must be written in English
- All flow diagrams must use Mermaid.js

## Architecture
See `docs/architecture.md` for detailed architecture, request flow, and security boundaries.

## SDD Specifications
See `.specs/` for specification documents and templates.

When asked to create a new feature, only create the feature documents in `.specs/NNN-feature_name/` containing:
- `prd.md` - Product Requirements Document (product/usability requirements ONLY, no technical details)
- `spec.md` - Technical Specification (architecture, data structures, APIs, implementation details)
- `tasks.md` - Implementation Tasks

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

## Testing
- Verify connection to configured endpoint
- List SQS queues and perform supported queue operations
- Mutating tests: use local emulator + disposable test queues only

## Current State
No implementation yet. Project structure, package.json, and source files need to be created.
