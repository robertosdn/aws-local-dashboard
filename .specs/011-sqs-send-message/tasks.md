# Implementation Tasks: SQS Queue Messaging and Details

## Phase 1: Foundation and Types
- [X] Add `SendMessageOptions` and `SendMessageResult` types to `src/features/sqs/types/sqs.ts`
- [X] Confirm no new dependencies are required (reuse `@aws-sdk/client-sqs`, existing UI primitives, `lucide-react`)

## Phase 2: API and Data Layer
- [X] Add `sendMessage(queueUrl, body, config?, options?)` to `src/features/sqs/api/sqs.ts` using `SendMessageCommand`
- [X] Map `MessageId`, `MD5OfMessageBody`, and `MD5OfMessageAttributes`; destroy the client in a `finally` block
- [X] Map string message attributes to `MessageAttributes` with `DataType: 'String'` and `StringValue`
- [X] Add a unit test for `sendMessage` in `tests/features/sqs/api/sqs.test.ts` (assert request body/headers and result mapping)

## Phase 3: State Management
- [X] Create `src/features/sqs/hooks/useSendMessage.ts` with `useMutation`, `useSettings`, and `['sqs']` invalidation on success
- [X] Export `useSendMessage` from `src/features/sqs/hooks/index.ts`
- [X] Add a unit test for `useSendMessage` (success invalidation and error propagation)

## Phase 4: UI Components
- [X] Create `src/features/sqs/components/SendMessageDialog.tsx` (body textarea + optional attribute rows, validation, pending state)
- [X] Export `SendMessageDialog` from `src/features/sqs/components/index.ts`
- [X] Add the Send Message action to `src/features/sqs/components/QueueRow.tsx` with a `Send` icon and accessible label
- [X] Forward `onSendMessage` through `src/features/sqs/components/QueueTable.tsx`
- [X] Verify loading/empty states are unchanged and the dialog is keyboard accessible and responsive
- [X] Add component tests in `tests/features/sqs/components/sqs-components.test.tsx` (row action callback, empty-body validation, attribute validation, successful submit payload)

## Phase 5: Application Integration
- [X] Wire dialog state and handlers into `src/pages/QueuesPage.tsx` (open on row action, success toast with message ID, keep dialog open, refresh counts)
- [X] Reuse the existing `toast` helper for success and error notifications

## Phase 6: Validation
- [X] Run lint and typecheck
- [X] Run unit tests for the SQS feature
- [X] Exercise the end-to-end flow in a browser against MinStack on `localhost:4566` (send a message, verify counts and message viewer)
- [X] Verify acceptance criteria and error cases (empty body, invalid attributes, AWS error)

## Phase 7: Documentation
- [X] Update `docs/architecture.md` SQS feature description to mention sending messages
- [X] Update `docs/ui-patterns.md` SQS queue row mapping to include the Send Message action

## Phase 8: Queue Details
- [X] Add `SQSQueueDetails` type to `src/features/sqs/types/sqs.ts`
- [X] Add `getQueueDetails(queueUrl, config?)` to `src/features/sqs/api/sqs.ts` using `GetQueueAttributesCommand` with `AttributeNames: ['All']`
- [X] Add a unit test for `getQueueDetails` in `tests/features/sqs/api/sqs.test.ts`
- [X] Create `src/features/sqs/hooks/useQueueDetails.ts` (query keyed by endpoint/region/queue URL, enabled by `open`) and export it from the hooks barrel
- [X] Add a unit test for `useQueueDetails` (disabled without a URL, returns attributes, surfaces errors)
- [X] Create `src/features/sqs/components/QueueDetailsDialog.tsx` (name/URL header, attribute list with timestamp and JSON formatting, loading/error/retry states)
- [X] Export `QueueDetailsDialog` from the components barrel
- [X] Add the View details action (`Info` icon, first in the row) to `QueueRow` and forward `onViewDetails` through `QueueTable`
- [X] Add component tests in `tests/features/sqs/components/sqs-components.test.tsx` (row action callback, attribute rendering, error state)
- [X] Wire details dialog state and handlers into `src/pages/QueuesPage.tsx` and cover them in `tests/pages/queues-page.test.tsx`
- [X] Update `docs/ui-patterns.md` so SQS queues document the `View` action and the row order View → View Messages → Send Message → Purge
- [X] Run lint, typecheck, and the full unit test suite
- [X] Verify the details dialog end-to-end in a browser against MinStack

## Dependencies
- MinStack (`ministackorg/ministack`) running on `localhost:4566` for browser validation
- Existing `scripts/create-sqs-lambda.mjs` to provision a queue (unchanged)

## Notes
- The target queue is selected from the table row; the dialog has no queue selector.
- FIFO fields (`MessageGroupId`, `MessageDeduplicationId`) and `DelaySeconds` are out of scope.
- After a successful send the dialog stays open and clears its fields to support multiple sends.
- The details dialog fetches attributes on demand (fresh data) rather than reusing the list payload.
- Queue tags (`ListQueueTags`) are out of scope; only `GetQueueAttributes` output is shown.
- Existing `scripts/` helpers are not modified.
