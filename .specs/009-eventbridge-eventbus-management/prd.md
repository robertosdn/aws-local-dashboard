# Product Requirements Document: EventBridge EventBus Management

## Overview
Enable developers to inspect Amazon EventBridge event buses in the configured AWS-compatible environment, view a bus's policy and its rules and targets, and remove a custom event bus they no longer need.

## Target Users
- Developers using a local AWS emulator to inspect and manage EventBridge event buses

## User Stories

### Page Identification
- The EventBridge event bus list page uses **"Event Buses"** as its main title.
- The service/category label is **"EventBridge"**.

### US-001: List Event Buses
**As a** developer, **I want to** see the event buses available in my environment, **so that** I can select one to inspect.

**Acceptance Criteria:**
- Display event bus name, ARN, and creation date when available
- Support paginated lists
- Show loading, empty, and actionable error states
- Provide a way to refresh the list

### US-002: View Event Bus Details and Rules
**As a** developer, **I want to** open an event bus and inspect its configuration and rules, **so that** I can understand how it routes events.

**Acceptance Criteria:**
- Provide a `View` action that opens a detail view for the selected bus
- Display bus metadata: name, ARN, and description and creation date when available
- Display the event bus policy when present; show the raw text with a warning if it is not valid JSON
- Show the bus's rules with name, state (ENABLED/DISABLED), event pattern, and description
- Show each rule's targets, including target id, ARN, and role ARN when present
- Support pagination when a bus has many rules
- Show loading, empty, and actionable error states
- Provide a way to return to the list

### US-003: Delete an Event Bus
**As a** developer, **I want to** delete a custom event bus, **so that** I can remove a local test resource I no longer need.

**Acceptance Criteria:**
- Provide a delete action for custom event buses
- Do not offer deletion for the `default` event bus
- Require explicit confirmation that identifies the bus and warns that the bus and its rules are permanently removed
- Refresh the list and return to it after successful deletion
- Show success or actionable error feedback and disable the action while deletion is in progress

## Non-Functional Requirements
- Use the active AWS-compatible endpoint and region configured in the dashboard
- Do not require permanent AWS credentials to be stored in the dashboard
- Keep list and detail views usable on mobile and desktop with keyboard-accessible controls
- Bound each request and expose pagination rather than loading unbounded results
- Preserve policy and event-pattern JSON content when displaying it

## Out of Scope
- Creating event buses
- Managing rules or targets (create, update, enable/disable, delete)
- Schedule-based rules (scheduled triggers are handled by EventBridge Scheduler, feature 010)
- EventBridge archives/replay and Pipes
- Cross-account event bus permissions
- EventBridge Scheduler (separate feature)