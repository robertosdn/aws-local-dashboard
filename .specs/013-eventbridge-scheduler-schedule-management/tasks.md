# Implementation Tasks: EventBridge Scheduler Schedule Management

## Phase 1: Foundation and Types

- [x] Define schedule-management types (`ScheduleTargetInput`, `ScheduleFormValues`, `SaveScheduleInput`, `DeleteScheduleInput`, `SetScheduleStateInput`, `SavedSchedule`, `ActionAfterCompletion`) in `src/features/eventbridge/scheduler/types/scheduler.ts`
- [x] Define validation types (`ScheduleValidationSeverity`, `ScheduleValidationIssue`, `ScheduleExpressionKind`, `ScheduleExpressionValidationResult`) and `SCHEDULE_EXPRESSION_MAX_LENGTH`
- [x] Confirm no new dependency is required (`@aws-sdk/client-scheduler` already provides create, update, and delete commands)

## Phase 2: Schedule Expression and Timezone Validator

- [x] Extend `src/features/eventbridge/scheduler/lib/scheduleExpression.ts` with `validateScheduleExpression`
- [x] Implement shape detection for `at(...)`, `rate(...)`, and `cron(...)`, plus the length and empty checks
- [x] Implement `rate` validation (positive integer value, supported unit)
- [x] Implement `cron` validation (six fields, per-field ranges, and the day-of-month/day-of-week `?` rule)
- [x] Implement `at` validation (timestamp parse, with a past-time warning)
- [x] Implement `validateScheduleTimezone` (IANA membership with a graceful fallback)
- [x] Reuse `describeScheduleExpression` to populate the validation result's `description`
- [x] Add unit tests in `tests/features/eventbridge/scheduler/lib/scheduleExpression.test.ts` covering valid forms, each error case, warnings, multiple simultaneous issues, and the size limit

## Phase 3: API and Data Layer

- [x] Import `CreateScheduleCommand`, `UpdateScheduleCommand`, and `DeleteScheduleCommand` from `@aws-sdk/client-scheduler`
- [x] Implement `createSchedule`, `updateSchedule`, and `deleteSchedule` in `src/features/eventbridge/scheduler/api/scheduler.ts`
- [x] Implement `saveSchedule` orchestration (create vs update, omitting blank optional fields, always sending `FlexibleTimeWindow` and `ScheduleExpressionTimezone`)
- [x] Implement `setScheduleState` as `GetSchedule` → rebuild the full configuration → `UpdateSchedule` with only `State` changed
- [x] Map `ScheduleTargetInput` to the SDK `Target` shape (retry policy, dead-letter config, SQS/EventBridge/Kinesis parameters)
- [x] Destroy the client in every `finally` block and avoid converting errors into success-shaped results
- [x] Parse `StartDate`/`EndDate` as UTC rather than the browser's local zone
- [x] Extend `tests/features/eventbridge/scheduler/api/scheduler.test.ts` for request mapping, create-vs-update, state preservation, and API errors

## Phase 4: State Management

- [x] Implement `useSaveSchedule` (create/update) with schedules-list and schedule-detail invalidation and `retry: false`
- [x] Implement `useDeleteSchedule` with the same invalidation and `retry: false`
- [x] Implement `useSetScheduleState` with the same invalidation and `retry: false`
- [x] Export the hooks from `src/features/eventbridge/scheduler/hooks/index.ts`
- [x] Extend `tests/features/eventbridge/scheduler/hooks/scheduler-hooks.test.tsx` for query keys, invalidation, pending, and error behavior

## Phase 5: UI Components

- [x] Build `ScheduleExpressionField` with live validation, `aria-invalid`, live-region feedback, and the human-readable description
- [x] Add the time-zone input with inline validation to `ScheduleExpressionField`
- [x] Build `ScheduleTargetEditor` with ARN/role/input validation, retry policy, dead-letter queue, and ARN-driven target-specific parameters
- [x] Move target validation into `lib/scheduleTarget.ts` so the dialog and editor share it without breaking fast refresh
- [x] Build `ScheduleFormDialog` for create and edit (name read-only on edit) with defaults, prefill loading state, inline validation, and pending/saving states
- [x] Build `DeleteScheduleDialog` with a permanence warning and duplicate-submit protection
- [x] Extend `ScheduleTable` with the `Create schedule` action and per-row view, enable/disable, edit, and delete actions
- [x] Export new components from `src/features/eventbridge/scheduler/components/index.ts`
- [x] Extend `tests/features/eventbridge/scheduler/components/scheduler-components.test.tsx` for validator feedback, target editor behavior, dialog validation/blocking, and action callbacks

## Phase 6: Application Integration

- [x] Own schedule dialog state, mutation wiring, and toast handling in `src/pages/SchedulerSchedulesPage.tsx`
- [x] Add edit, enable/disable, and delete actions to `src/pages/SchedulerScheduleDetailPage.tsx` using the shared hooks
- [x] Replace the read-only empty-state copy now that schedules are manageable
- [x] Reuse the active endpoint/region settings and existing toast and UI primitives
- [x] Verify no route or sidebar change is required and that schedule groups remain read-only
- [x] Update the scheduler page-title test mock for the new hooks

## Phase 7: Validation

- [x] Run lint, typecheck, and build
- [x] Run the Scheduler unit tests (validator, API, hooks, components) and the full suite
- [x] Exercise create → edit → enable/disable → delete in a browser against the local emulator, from the list
- [x] Exercise the detail page edit action and confirm the form is pre-filled from the service
- [x] Verify expression validation behavior: invalid form, valid `rate`, valid `cron`, and the human-readable description
- [x] Verify target validation in the browser (target ARN and role ARN required) and the malformed ARN/JSON/retry cases in unit tests
- [x] Verify the service error path: a rejected request keeps the dialog open and shows the real message
- [x] Verify accessibility: accessible action labels, focus states, `aria-invalid`, and live-region validation feedback

## Phase 8: Local MinStack Resource Provisioning

- [x] Keep `scripts/create-scheduler-schedule-group.mjs` group-only, idempotent, and local-endpoint/dummy-credential by default
- [x] Extend `scripts/scheduler-test-data.mjs` to keep an ENABLED and a DISABLED schedule, add a schedule with a retry policy and dead-letter queue, and add one with target-specific parameters
- [x] Keep the sample-data script using create/update upsert semantics without deleting unrelated resources
- [x] Verify the seeded schedules and targets render and round-trip correctly in the dashboard connected to MinStack

## Phase 9: Documentation

- [x] Update `docs/ui-patterns.md` EventBridge Scheduler row to reflect schedule management actions (create/edit/enable-disable/delete)
- [x] Update README feature list to mention schedule management and local expression validation
- [x] Correct the PRD and spec so the target role ARN is documented as required, matching the Scheduler API

## Dependencies

- Feature 010 (EventBridge Scheduler Management) must be in place: the schedules list, schedule detail, `useSchedules`, `useScheduleDetails`, `describeScheduleExpression`, and `createSchedulerClient` are reused.
- `@aws-sdk/client-scheduler` (already installed).
- Existing React Query, settings, toast, and project UI infrastructure.

## Notes

- Schedule names are immutable by design; editing never renames a schedule (delete + create is required to rename).
- `UpdateSchedule` is a full replacement, so the edit form sends the complete configuration and the enable/disable action reads the schedule before writing it back.
- The target role ARN is required by the Scheduler API; browser verification surfaced this, so the form now requires it instead of allowing a confusing server rejection.
- Schedule groups remain read-only; only schedules inside a group are managed.
- Complex ECS and SageMaker pipeline target parameters remain display-only, matching feature 010.
- Schedule next/last invocation times are not returned by the Scheduler API and must not be displayed.
- The expression and time-zone validators are pure, browser-only modules and must not call external services.
- The local MinStack helpers are setup data only and are distinct from unit tests and browser validation.
