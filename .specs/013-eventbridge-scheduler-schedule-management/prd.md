# Product Requirements Document: EventBridge Scheduler Schedule Management

## Overview

The dashboard currently lets developers browse EventBridge Scheduler schedule groups and inspect the schedules inside them, but everything is read-only (feature 010). Seeing a schedule is not the same as controlling it: today a developer who wants to add a nightly job, fix a schedule expression, retarget a schedule, or stop a schedule from firing must leave the dashboard and use a CLI.

This feature turns the schedules list of a schedule group into a manageable surface, mirroring what feature 012 did for EventBridge EventBus rules. From the schedules list a developer can create, edit, enable/disable, and delete schedules, and configure or change a schedule's target. Because schedule expressions are the most error-prone part of a schedule, the feature also includes a validator that explains exactly what is wrong with a `rate(...)`, `cron(...)`, or `at(...)` expression — and flags an invalid time zone — before the request is ever sent.

Schedule **groups** remain read-only; this feature manages the schedules inside an existing group, including the `default` group.

## Target Users

- Developers inspecting and managing EventBridge Scheduler schedules in a local AWS-compatible environment
- Developers authoring or debugging schedule expressions and target configuration who need fast, precise feedback

## User Stories

### Page Identification

- The schedules page keeps **"EventBridge Scheduler"** as its category label and **"Schedules"** as its main title.
- Schedules are managed within the existing group → schedules navigation; no new top-level page title is introduced.

### US-001: See Schedule Management Actions

**As a** developer, **I want to** see which schedule operations are available, **so that** I can manage schedules without leaving the dashboard.

**Acceptance Criteria:**

- The schedules list offers a create action and, per schedule, view, edit, enable/disable, and delete actions
- Actions are clearly labelled for assistive technology and reachable by keyboard
- The `default` schedule group remains fully manageable (schedules can be created in and removed from it)
- Actions show a disabled/in-progress state while their request is running
- Schedule groups themselves remain read-only in this iteration

### US-002: Create a Schedule

**As a** developer, **I want to** create a schedule in a group, **so that** I can automate a recurring or one-time task.

**Acceptance Criteria:**

- A create form collects a schedule name, an optional description, a schedule expression, a time zone, an initial enabled/disabled state, and a target
- The form defaults sensible values (time zone `UTC`, flexible time window `OFF`, action after completion `NONE`)
- The schedule name is required and validated for the allowed character set and length before submission
- A target ARN is required (a schedule with no target cannot run)
- Submitting an invalid form shows inline field messages and does not send a request
- On success, the new schedule appears in the list and a success notification is shown
- On failure, the real error is shown and the entered values are preserved

### US-003: Edit a Schedule

**As a** developer, **I want to** change an existing schedule's expression, time zone, state, dates, flexible window, or target, **so that** I can correct or extend what it does.

**Acceptance Criteria:**

- An edit form is pre-filled with the schedule's current values and target, loaded from the service
- The schedule name and group are displayed but not editable, with an explanation that the name identifies the schedule
- Every editable field, including the full target configuration that the detail view already displays, can be changed
- On success, the schedule list and the schedule's detail view reflect the changes and a success notification is shown
- On failure, the real error is shown and the entered values are preserved

### US-004: Enable or Disable a Schedule

**As a** developer, **I want to** enable or disable a schedule, **so that** I can pause it without deleting it.

**Acceptance Criteria:**

- Each schedule offers an enable/disable control that reflects its current state
- The state change is persisted and the schedule's state indicator updates on success
- The control is disabled while the request is in progress
- On failure, the real error is shown and the previous state is kept

### US-005: Delete a Schedule

**As a** developer, **I want to** delete a schedule, **so that** I can remove automation I no longer need.

**Acceptance Criteria:**

- Deletion requires explicit confirmation that names the schedule and warns the action is permanent
- The confirmation cannot be submitted twice while the request is in progress
- On success, the schedule is removed from the list and a success notification is shown
- On failure, the real error is shown and the schedule remains listed

### US-006: Validate a Schedule Expression

**As a** developer, **I want to** get precise feedback on my schedule expression and time zone, **so that** I can fix them before saving instead of debugging a rejected request.

**Acceptance Criteria:**

- The expression field validates as the developer types or on blur, without blocking input
- `rate(...)`, `cron(...)`, and `at(...)` expressions are recognized and validated; any other form is reported as invalid
- A `rate` expression with a non-positive or non-numeric interval, or an unsupported unit, is reported as an error
- A `cron` expression that does not have the required six fields, or that uses invalid values, or that leaves both day-of-month and day-of-week as `*`, is reported as an error
- An `at` expression that is not a valid timestamp is reported as an error; one that is in the past is reported as a warning
- Multiple issues can be shown at once so the developer does not fix them one at a time
- The save action is prevented while an error-level issue is present
- A valid expression gives positive confirmation and a human-readable description
- A time zone that is not a recognized IANA time zone name is reported as an error

### US-007: Configure a Schedule Target

**As a** developer, **I want to** set and change a schedule's target, **so that** the schedule invokes the resource I need.

**Acceptance Criteria:**

- The target editor collects the target ARN, the target role ARN, and an optional input payload
- Retry policy (maximum event age and maximum retry attempts) and a dead-letter queue ARN can be set and cleared
- Target-type-specific parameters are editable for the common target types the dashboard displays (for example an SQS message group ID, EventBridge detail type and source, or a Kinesis partition key), with the relevant group offered based on the target ARN
- The target ARN and role ARN are required; the developer gets feedback on clearly malformed ARNs without the dashboard claiming the destination exists
- The dashboard does not silently drop or silently keep target settings when the save partially fails

## Non-Functional Requirements

- Use the active AWS-compatible endpoint and region configured in the dashboard
- Do not require permanent AWS credentials to be stored in the dashboard
- Keep schedule and target management usable on mobile and desktop with keyboard-accessible controls and visible focus states
- Bound each request and continue to expose pagination for schedule lists rather than loading unbounded results
- Preserve the schedule expression exactly as authored; never reformat the developer's stored expression as a side effect of editing
- Validation feedback must be readable by assistive technology and must not rely on colour alone
- Mutations must not be retried automatically for create, update, or delete operations
- The dashboard must continue to avoid implying that next/last invocation times are available

## Out of Scope

- Creating, updating, or deleting schedule **groups** (groups remain read-only)
- Manually running a schedule ("run now") or invoking a target on demand
- Invocation history, logs, or metrics for schedules
- Cross-account scheduling and resource policies on schedule groups
- Tag management for schedules or groups
- Editing of the complex ECS and SageMaker pipeline target parameters (they remain display-only, as in feature 010)
- Universal/templated targets and assume-role external IDs beyond the role ARN
