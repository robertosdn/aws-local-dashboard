# Product Requirements Document: EventBridge Scheduler Management

## Overview
Enable users to view and manage Amazon EventBridge Scheduler schedule groups and schedules in the local AWS dashboard. Users can list all schedule groups, view schedules within each group, and see detailed information.

## User Stories

### US-001: List Schedule Groups
As a developer using local AWS services
I want to see a list of all EventBridge Scheduler schedule groups
So that I can organize and navigate schedules by group

**Acceptance Criteria:**
- Display a table/list of all schedule groups with name, ARN, and creation date
- Show schedule count per group
- Support pagination for large numbers of schedule groups
- Show loading state while fetching data
- Handle empty state (no schedule groups)
- Refresh button to reload the list

### US-002: View Schedule Group Details
As a developer using local AWS services
I want to view all schedules within a specific schedule group
So that I can manage and monitor scheduled tasks

**Acceptance Criteria:**
- Navigate to detail view by clicking on a schedule group in the list
- Display schedule group metadata: name, ARN, creation date
- List all schedules in the group with: name, schedule expression, target, state, next invocation
- Support filtering by schedule state (enabled/disabled)
- Back navigation to list view

### US-003: View Schedule Details
As a developer using local AWS services
I want to view detailed information about a specific schedule
So that I can understand its configuration and target

**Acceptance Criteria:**
- Navigate to schedule detail from schedule group view
- Display schedule metadata: name, ARN, description, schedule expression, timezone
- Show target configuration: ARN, role ARN, input, retry policy, dead letter queue
- Display state (enabled/disabled) and last/next invocation times
- Back navigation to schedule group view

### US-004: Create Schedule Group (Future)
As a developer using local AWS services
I want to create new schedule groups
So that I can organize schedules by application or environment

**Acceptance Criteria:**
- Button to create new schedule group
- Form with name input and optional tags
- Validation for naming rules
- Success/error feedback

## Non-Functional Requirements
- Page load time < 2 seconds for list views
- Responsive design for desktop and tablet
- Consistent with existing dashboard UI patterns
- Accessible (WCAG 2.1 AA)

## Out of Scope
- Creating/editing schedules (read-only for now)
- Schedule execution history
- Cross-account scheduling
- Schedule tagging management