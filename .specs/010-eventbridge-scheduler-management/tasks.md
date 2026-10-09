# Implementation Tasks: EventBridge Scheduler Management

## Phase 1: Foundation and Types
- [X] Add `@aws-sdk/client-scheduler` if it is not already installed
- [X] Add a `createSchedulerClient` factory to `src/services/aws.ts` following the existing client factories
- [X] Define schedule group, schedule, target, detail, and pagination types in `src/features/eventbridge/scheduler/types/scheduler.ts`

## Phase 2: API and Data Layer
- [X] Implement bounded `listScheduleGroups` with `NextToken` pagination
- [X] Implement `getScheduleGroupDetails` (metadata only)
- [X] Implement read-only `listSchedules` with `GroupName`, optional `State` filter, and `NextToken` pagination
- [X] Implement `getScheduleDetails` mapping metadata, expression, flexible time window, and target configuration
- [X] Ensure the underlying client is destroyed after every operation
- [X] Do not expose create, update, delete, or run operations in this iteration
- [X] Add unit tests for request mapping, pagination, state filtering, and API errors

## Phase 3: State Management
- [X] Implement `useScheduleGroups` list hook with endpoint, region, and cursor in the query key
- [X] Implement `useScheduleGroupDetails` hook
- [X] Implement `useSchedules` hook with group, state filter, and cursor in the query key
- [X] Implement `useScheduleDetails` hook
- [X] Add unit tests for query keys, pagination, and state filtering

## Phase 4: UI Components
- [X] Add a feature-local schedule expression formatter in `src/features/eventbridge/scheduler/lib/`
- [X] Build `SchedulerGroupsPage` with `Schedule Groups` as the title and `EventBridge Scheduler` as the category label
- [X] Build `ScheduleGroupTable` with `View` (`Info`, opens the group detail) and `Schedules` (`Table`, opens the group schedule list) actions and no delete action
- [X] Build `SchedulerGroupDetailPage` with metadata and an action to open the group's schedule list
- [X] Build `SchedulerSchedulesPage` with a state filter, pagination, and a `View` action per row
- [X] Build `ScheduleTable` with state badge, target ARN, last modification date, and a `View` action
- [X] Build `SchedulerScheduleDetailPage` with metadata, target configuration, and input payload via `CodeBlock`
- [X] Build `ScheduleExpressionDisplay` and `ScheduleTargetDisplay` reusing project primitives
- [X] Implement loading, empty, error, retry, and pagination states for every list view
- [X] Verify responsive layout, keyboard navigation, and accessible action labels
- [X] Add unit tests for table actions, detail rendering, state filtering, and pagination

## Phase 5: Application Integration
- [X] Register `/eventbridge/scheduler/groups`, `/eventbridge/scheduler/groups/:groupName`, `/eventbridge/scheduler/groups/:groupName/schedules`, and `/eventbridge/scheduler/groups/:groupName/schedules/:scheduleName` routes in `src/routes.ts`
- [X] Update the existing `EventBridge (Scheduler)` entry in `src/config/navigation.ts` to `/eventbridge/scheduler/groups` and remove the `comingSoon`/`disabled` flags
- [X] Integrate the active endpoint and region settings
- [X] Reuse project-owned UI components and notification patterns

## Phase 6: Validation
- [X] Run lint, typecheck, and build
- [X] Run the Scheduler and navigation unit tests
- [X] Exercise list → group detail → schedules → schedule detail → back in a browser against the local emulator
- [X] Verify the `View` and `Schedules` actions open different destinations, state filtering, and request failures

## Phase 7: Documentation
- [X] Update directly related README or architecture documentation if needed

## Phase 8: Local MinStack Resource Provisioning
- [X] Create `scripts/create-scheduler-schedule-group.mjs` to create a custom schedule group, defaulting to the local endpoint and dummy credentials, with `AWS_ENDPOINT`, `AWS_REGION`, and `SCHEDULE_GROUP_NAME` overrides
- [X] Make the group-creation script idempotent (reuse an existing group without deleting resources)
- [X] Create a separate `scripts/scheduler-test-data.mjs` to add deterministic sample schedules; do not combine it with group creation
- [X] Include at least one enabled and one disabled schedule, and upsert samples safely without deleting existing resources
- [X] Verify both scripts separately, then confirm the provisioned group and schedules are visible in the dashboard connected to MinStack

## Dependencies
- `@aws-sdk/client-scheduler` (installed)
- Existing settings, AWS client, React Query, and project UI infrastructure

## Notes
- This iteration is read-only: schedule and schedule group creation, editing,
  deletion, enabling/disabling, and manual runs are out of scope.
- Schedule next/last invocation times are not returned by the Scheduler API and are
  not displayed.
- The `default` schedule group always exists and is treated like any other group.
- The group list `View` action opens the group detail while the `Schedules` action
  opens `/eventbridge/scheduler/groups/:groupName/schedules`; the two must not
  target the same route.
- The local MinStack scripts prepare development data and are separate from unit
  tests and browser validation.
