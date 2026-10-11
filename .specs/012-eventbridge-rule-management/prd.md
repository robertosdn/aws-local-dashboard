# Product Requirements Document: EventBridge Rule Management

## Overview

The EventBridge Event Bus detail view currently shows a bus's rules and targets as read-only information. Developers who use the dashboard against a local AWS emulator can see what routes events, but they cannot change it: they must leave the dashboard and use a CLI to create a rule, tweak its event pattern, attach a target, or remove a rule they no longer need.

This feature turns the rules area of the event bus detail view into a manageable surface. From there, a developer can create, edit, enable/disable, and delete rules, manage their targets, and get immediate feedback while authoring the event filter pattern that decides which events a rule matches. The biggest source of trial-and-error today is a malformed filter pattern, so the feature includes a pattern validator that explains exactly what is wrong with a pattern — both JSON syntax and EventBridge matching semantics — before the request is ever sent.

## Target Users

- Developers inspecting and managing EventBridge event buses in a local AWS-compatible environment
- Developers authoring or debugging event filter patterns who need fast, precise feedback

## User Stories

### Page Identification

- The EventBridge event bus detail page keeps **"EventBridge"** as its category label.
- Rules are managed within the event bus detail view; no new top-level page title is introduced.

### US-001: See Rule Management Actions

**As a** developer, **I want to** see which rule operations are available on an event bus, **so that** I can manage rules without leaving the detail view.

**Acceptance Criteria:**

- The rules section offers a create action and, per rule, edit, enable/disable, and delete actions
- Actions are clearly labelled for assistive technology and reachable by keyboard
- The document `default` event bus remains fully manageable (rules can be added to and removed from it)
- Actions show a disabled/in-progress state while their request is running

### US-002: Create a Rule

**As a** developer, **I want to** create a rule on an event bus, **so that** I can route matching events to a target.

**Acceptance Criteria:**

- A create form collects a rule name, an optional description, an optional event pattern (blank means match all events), an initial enabled/disabled state, and one or more targets
- The rule name is required and validated for the allowed character set and length before submission
- At least one target is required (a rule with no target never routes an event)
- Submitting an invalid form shows inline field messages and does not send a request
- On success, the new rule appears in the rules list and a success notification is shown
- On failure, the real error is shown and the entered values are preserved

### US-003: Edit a Rule

**As a** developer, **I want to** change an existing rule's description, event pattern, or targets, **so that** I can correct or extend how it matches and routes events.

**Acceptance Criteria:**

- An edit form is pre-filled with the rule's current values and existing targets
- The rule name is displayed but not editable, with an explanation that the name identifies the rule
- Targets can be added, updated, and removed as part of the same edit
- On success, the rules list reflects the changes and a success notification is shown
- On failure, the real error is shown and the entered values are preserved

### US-004: Enable or Disable a Rule

**As a** developer, **I want to** enable or disable a rule, **so that** I can pause event routing without deleting the rule.

**Acceptance Criteria:**

- Each rule offers an enable/disable control that reflects its current state
- The action is applied through a dedicated operation and the rule's state indicator updates on success
- The control is disabled while the request is in progress
- On failure, the real error is shown and the previous state is kept

### US-005: Delete a Rule

**As a** developer, **I want to** delete a rule, **so that** I can remove routing I no longer need.

**Acceptance Criteria:**

- Deletion requires explicit confirmation that names the rule and warns the action is permanent and removes its targets
- The confirmation cannot be submitted twice while the request is in progress
- On success, the rule is removed from the list and a success notification is shown
- On failure, the real error is shown and the rule remains listed

### US-006: Validate an Event Pattern

**As a** developer, **I want to** get precise feedback on my event filter pattern, **so that** I can fix it before saving instead of debugging a rejected request.

**Acceptance Criteria:**

- The pattern field validates as the developer types or on blur, without blocking input
- JSON syntax problems are reported with a clear message and the location of the problem
- Semantically invalid patterns are reported with a message describing the offending location (for example an empty match array, a nested array, a `null` value, an unsupported matching operator, a malformed `numeric` or `anything-but` expression, or a value that is not an object at the top level); blank patterns are allowed to match all events
- Multiple issues can be shown at once so the developer does not fix them one at a time
- The save action is prevented while an error-level issue is present, and a summary of the problem is visible next to the action
- Valid patterns give positive confirmation and can be previewed as formatted JSON
- A pattern that exceeds the supported event-pattern size is reported as an error

### US-007: Manage Rule Targets

**As a** developer, **I want to** add, change, and remove a rule's targets, **so that** a rule routes to the destinations I need.

**Acceptance Criteria:**

- Target rows collect a target id, a target ARN, an optional role ARN, and optional input or input path, matching what the dashboard already displays
- Target ids are required and must be unique within the rule
- Target ARNs are required; the developer gets feedback on clearly malformed ARNs without the dashboard claiming to validate destination existence
- Removing a target in the form removes it from the rule when the rule is saved
- The dashboard does not silently drop or silently keep targets when the save partially fails

## Non-Functional Requirements

- Use the active AWS-compatible endpoint and region configured in the dashboard
- Do not require permanent AWS credentials to be stored in the dashboard
- Keep rules and target management usable on mobile and desktop with keyboard-accessible controls and visible focus states
- Bound each request and continue to expose pagination for rule lists rather than loading unbounded results
- Preserve event-pattern content exactly as authored; never reformat the developer's stored pattern as a side effect of editing
- Validation feedback must be readable by assistive technology and must not rely on colour alone
- Mutations must not be retried automatically for create/delete operations

## Out of Scope

- Creating, updating, or deleting event buses themselves
- Cross-account event bus permissions and resource policies
- Schedule-based rules (scheduled triggers are handled by EventBridge Scheduler, feature 010)
- EventBridge archives/replay and Pipes
- Advanced target configuration such as input transformers, dead-letter queues, retry policy, and service-specific target parameters
- Renaming an existing rule
- Sending test events to a rule or replaying matched events
