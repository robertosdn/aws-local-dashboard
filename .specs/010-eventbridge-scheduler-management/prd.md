# Product Requirements Document: EventBridge Scheduler Management

## Overview

Enable users to inspect Amazon EventBridge Scheduler schedule groups and the
schedules they contain in the local AWS dashboard. Users can browse schedule
groups, open a group to see its schedules, and review an individual schedule's
configuration and target. This iteration is read-only.

## Scope

Read-only inspection of schedule groups and schedules. Creating, editing,
deleting, enabling, disabling, or manually running schedules is not part of this
iteration.

## User Stories

### US-001: List schedule groups

As a developer using local AWS services
I want to see the schedule groups available on the configured endpoint
So that I can find and navigate the group that holds my schedules

**Acceptance Criteria:**
- The page lists schedule groups with name, ARN, and creation date
- A `View` action opens the schedule group details
- A `Schedules` action opens the schedules contained in the group
- Loading and empty states are shown, and the list can be refreshed
- Additional pages can be loaded when more schedule groups exist
- A failed request shows an error state with a retry action, distinct from an empty list

### US-002: View schedule group details

As a developer using local AWS services
I want to review a schedule group's metadata
So that I can confirm which group I am working with

**Acceptance Criteria:**
- Display schedule group name, ARN, creation date, and last modification date
- Provide navigation back to the schedule group list
- Provide a way to continue to the schedules contained in the group

### US-003: View schedules in a group

As a developer using local AWS services
I want to see the schedules inside a schedule group
So that I can monitor the scheduled tasks it defines

**Acceptance Criteria:**
- List the group's schedules with name, state (enabled/disabled), target ARN, and last modification date
- Support filtering the list by schedule state (all, enabled, disabled)
- Provide navigation back to the schedule group detail
- Loading and empty states are shown, and the list can be refreshed
- Additional pages can be loaded when more schedules exist

### US-004: View schedule details

As a developer using local AWS services
I want to review a schedule's configuration and target
So that I can understand what the schedule does

**Acceptance Criteria:**
- Display schedule metadata: name, ARN, group name, description (when present), schedule expression with timezone, state, start and end dates (when present), flexible time window, and action after completion
- Display the target configuration: target ARN, role ARN, input payload (when present), retry policy, dead-letter queue, and target-specific parameters (when present)
- Provide navigation back to the schedule group's schedule list

## Non-Functional Requirements

- Consistent with the existing dashboard page structure, action buttons, and visual tokens
- Accessible: keyboard navigation, accessible action labels, and visible focus states
- Responsive layout for desktop and tablet
- Clear loading, empty, and error feedback for every view

## Out of Scope

- Creating, editing, deleting, enabling, or disabling schedules or schedule groups
- Invocation history or manual "run now" actions
- Cross-account scheduling
- Schedule or schedule group tag management

## Notes

- Schedule **next** and **last** invocation times are not returned by the
  EventBridge Scheduler API and are therefore not shown anywhere in the product.
  The dashboard must not imply that this information is available.
