# Implementation Tasks: EventBridge EventBus Management

## Phase 1: Foundation and Types
- [X] Add `@aws-sdk/client-eventbridge` if it is not already installed
- [X] Add a `createEventBridgeClient` factory to `src/services/aws.ts` following the existing client factories
- [X] Define event bus summary/details, rule, target, and pagination types in `src/features/eventbridge/types/eventbridge.ts`

## Phase 2: API and Data Layer
- [X] Implement bounded `listEventBuses` with `NextToken` pagination
- [X] Implement `getEventBusDetails` (describe and merge list metadata)
- [X] Implement read-only `listRules` with `NextToken` pagination
- [X] Implement read-only `listTargetsByRule`
- [X] Implement `deleteEventBus`, rejecting the `default` bus
- [X] Ensure the underlying client is destroyed after every operation
- [X] Add unit tests for request mapping, pagination, default-bus rejection, and API errors

## Phase 3: State Management
- [X] Implement `useEventBuses` list hook with endpoint, region, and cursor in the query key
- [X] Implement `useEventBusDetails` and `useEventBusRules` hooks
- [X] Implement the `useDeleteEventBus` mutation with list invalidation and navigation back to the list
- [X] Add unit tests for query keys, pagination, and mutation invalidation

## Phase 4: UI Components
- [X] Build `EventBusesPage` with `Event Buses` as the title and `EventBridge` as the category label
- [X] Build `EventBusTable` with `View` and `Delete` actions (no delete for the `default` bus)
- [X] Build `EventBusDetailPage` with metadata, policy, and read-only rules
- [X] Build `RuleList` and target display with ENABLED/DISABLED state badges
- [X] Build `DeleteEventBusDialog` with a clear permanence warning
- [X] Add a project-owned `CodeBlock` primitive for policy/pattern JSON if no existing primitive suffices
- [X] Implement loading, empty, error, retry, and pagination states
- [X] Verify responsive layout, keyboard navigation, and accessible labels
- [X] Add unit tests for table actions, detail rendering, pagination, and delete confirmation

## Phase 5: Application Integration
- [X] Register `/eventbridge/eventbuses` and `/eventbridge/eventbuses/:name` routes in `src/routes.ts`
- [X] Enable the EventBridge EventBus sidebar entry in `src/config/navigation.ts` (`/eventbridge/eventbuses`), removing the `comingSoon`/`disabled` flags
- [X] Integrate the active endpoint and region settings
- [X] Reuse project-owned UI components and notification patterns

## Phase 6: Validation
- [X] Run lint, typecheck, and build
- [X] Run EventBridge unit tests
- [X] Exercise list → detail → rules → back and delete flows in a browser against the local emulator
- [X] Verify empty results, missing bus, invalid policy JSON, and request/deletion failures
- [X] Verify the `default` bus cannot be deleted from the UI

## Phase 7: Documentation
- [X] Update directly related README or architecture documentation if needed

## Phase 8: Local MinStack Resource Provisioning
- [X] Create `scripts/create-eventbridge-eventbus.mjs` to create a custom event bus, defaulting to the local endpoint and dummy credentials, with `AWS_ENDPOINT`, `AWS_REGION`, and `EVENT_BUS_NAME` overrides
- [X] Make the bus-creation script idempotent (reuse an existing bus without deleting resources)
- [X] Create a separate `scripts/eventbridge-test-data.mjs` to add deterministic sample rules and targets; do not combine it with bus creation
- [X] Default the sample-data script to the local endpoint and dummy credentials with the same overrides, and safely upsert samples without deleting resources
- [X] Verify both scripts separately, then confirm the provisioned bus and rules are visible in the dashboard connected to MinStack

## Dependencies
- `@aws-sdk/client-eventbridge` (not currently installed)
- Existing settings, AWS client, React Query, and project UI infrastructure

## Notes
- Event bus creation and rule/target management are out of scope; the UI is list, detail, and delete only.
- The `default` event bus is read-only and cannot be deleted.
- Rules and targets are displayed read-only within the event bus detail view.
- Schedule-based rules are out of scope: scheduled triggers are handled by EventBridge Scheduler (feature 010), so event bus rules are event-pattern only.
- Archives/replay, Pipes, and cross-account permissions are out of scope.
- The local MinStack scripts prepare development data and are separate from unit tests and browser validation.