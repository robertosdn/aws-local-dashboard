# Implementation Tasks: EventBridge Rule Management

## Phase 1: Foundation and Types

- [x] Define rule-management types (`RuleState`, `RuleTargetInput`, `RuleFormValues`, `SaveRuleInput`, `DeleteRuleInput`, `SetRuleStateInput`, `SavedRule`) in `src/features/eventbridge/types/eventbridge.ts`
- [x] Define pattern validation types (`EventPatternSeverity`, `EventPatternIssue`, `EventPatternValidationResult`) and `EVENT_PATTERN_MAX_LENGTH`
- [x] Confirm no new dependency is required (`@aws-sdk/client-eventbridge` already provides the rule and target commands)

## Phase 2: Event Pattern Validator

- [x] Implement `validateEventPattern()` in `src/features/eventbridge/lib/eventPattern.ts`: JSON syntax parsing with a located error message
- [x] Implement top-level shape validation (root must be an object; empty object is a warning)
- [x] Implement recursive semantic checks (empty arrays, nested arrays, `null` values, reserved `$` keys, `$or` shape)
- [x] Implement matching-operator validation (`prefix`, `suffix`, `equals-ignore-case`, `wildcard`, `exists`, `cidr`, `anything-but`, `numeric`)
- [x] Implement `formatEventPattern()` returning pretty-printed JSON or `null`, without normalizing the stored value
- [x] Enforce `EVENT_PATTERN_MAX_LENGTH` and skip semantic checks when it is exceeded
- [x] Add unit tests in `tests/features/eventbridge/lib/eventPattern.test.ts` covering valid patterns, each error case, multiple simultaneous issues, ordering, and the size limit

## Phase 3: API and Data Layer

- [x] Implement `putRule`, `deleteRule`, `setRuleState`, `putTargets`, and `removeTargets` in `src/features/eventbridge/api/eventbridge.ts`
- [x] Implement `saveRule` orchestration (`PutRule` → `PutTargets` → conditional `RemoveTargets`) with no silent partial-write success
- [x] Map SDK responses to camelCase domain types and destroy the client in every `finally` block
- [x] Extend `tests/features/eventbridge/api/eventbridge.test.ts` for request mapping, target reconciliation, partial-failure reporting, and API errors

## Phase 4: State Management

- [x] Implement `useSaveRule` (create/update + target reconciliation) with rules and targets invalidation and `retry: false` for create
- [x] Implement `useDeleteRule` with rules invalidation and `retry: false`
- [x] Implement `useSetRuleState` (enable/disable) with rules invalidation
- [x] Export the hooks from `src/features/eventbridge/hooks/index.ts`
- [x] Extend `tests/features/eventbridge/hooks/eventbridge-hooks.test.tsx` for query keys, invalidation, pending, and error behavior

## Phase 5: UI Components

- [x] Build `EventPatternField` with immediate validation, `aria-invalid`, live-region feedback, and formatted preview
- [x] Build `RuleTargetsEditor` with add/remove rows, uniqueness, and ARN-shape validation
- [x] Build `RuleFormDialog` for create and edit (name read-only on edit) with inline validation and pending/saving states
- [x] Build `DeleteRuleDialog` with a permanence + targets warning and duplicate-submit protection
- [x] Extend `RuleList` with the `Create rule` action and per-rule enable/disable, edit, and delete actions
- [x] Export new components from `src/features/eventbridge/components/index.ts`
- [x] Extend `tests/features/eventbridge/components/eventbridge-components.test.tsx` for validator feedback, target editor behavior, dialog validation/blocking, and action callbacks

## Phase 6: Application Integration

- [x] Own rule dialog state, mutation wiring, and toast handling in `src/pages/EventBusDetailPage.tsx`
- [x] Replace the read-only empty-state copy now that rules are manageable
- [x] Reuse the active endpoint/region settings and existing toast and UI primitives
- [x] Verify no route or sidebar change is required

## Phase 7: Validation

- [x] Run lint, typecheck, and build
- [x] Run the EventBridge unit tests (validator, API, hooks, components)
- [ ] Exercise create → edit → enable/disable → delete and target add/remove in a browser against the local emulator
- [ ] Verify pattern validation behavior: syntax error, semantic error, multiple issues, valid pattern, and oversized pattern
- [ ] Verify error cases: duplicate rule name, missing rule on delete, and partial target-reconciliation failure
- [ ] Verify accessibility: keyboard-only flow, focus states, and screen-reader-readable validation feedback

## Phase 8: Local MinStack Resource Provisioning

- [x] Keep `scripts/create-eventbridge-eventbus.mjs` bus-only, idempotent, and local-endpoint/dummy-credential by default
- [x] Extend `scripts/eventbridge-test-data.mjs` to seed an ENABLED and a DISABLED rule, a multi-target rule (SQS + Lambda), and a rule using a matching operator
- [x] Keep both scripts rerun-safe without deleting unrelated resources and without schedule-based rules
- [ ] Verify the seeded rules and targets render correctly in the dashboard connected to MinStack

## Phase 9: Documentation

- [x] Update `docs/ui-patterns.md` EventBridge EventBus row to reflect rule management actions (create/edit/enable-disable/delete)
- [x] Update README feature list to mention rule management and local pattern validation

## Dependencies

- Feature 009 (EventBridge EventBus Management) must be in place: the event bus detail page, rules query, targets query, and `createEventBridgeClient` are reused.
- `@aws-sdk/client-eventbridge` (already installed).
- Existing React Query, settings, toast, and project UI infrastructure.

## Notes

- Rule names are immutable by design; editing never renames a rule (delete + create is required to rename).
- Targets are written as part of the rule save (upsert + explicit removal of dropped ids); there is no separate target-save surface.
- The pattern validator is a pure, browser-only module and must not call external services.
- Advanced target configuration (input transformers, DLQ, retry policy, service-specific parameters) and sending test events are out of scope.
- Schedule-based rules remain out of scope; scheduled triggers belong to EventBridge Scheduler (feature 010).
- The local MinStack helpers are setup data only and are distinct from unit tests and browser validation.
