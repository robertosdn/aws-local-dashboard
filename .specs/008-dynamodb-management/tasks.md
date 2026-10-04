# Implementation Tasks: DynamoDB Management

## Phase 1: Foundation and Types
- [ ] Add `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` if they are not already installed
- [ ] Define table summary, key schema, item, cursor, query, and scan types
- [ ] Add a DynamoDB client factory to the shared AWS service and configure a Document Client for item operations

## Phase 2: API and Data Layer
- [ ] Implement paginated table listing
- [ ] Implement table description and key-schema mapping
- [ ] Implement primary-key Query with supported sort-key conditions
- [ ] Implement bounded Scan with continuation-key pagination
- [ ] Implement item deletion using the complete primary key
- [ ] Implement table deletion and surface table lifecycle/error responses
- [ ] Ensure the underlying client is destroyed after every operation
- [ ] Add unit tests for request mapping, key validation, pagination, deletion, and API errors

## Phase 3: State Management
- [ ] Implement table-list and table-details query hooks
- [ ] Implement Query and Scan hooks with distinct query keys and cursors
- [ ] Implement item and table deletion mutation hooks
- [ ] Include active endpoint, region, table, mode, conditions, and cursors in query keys as applicable
- [ ] Invalidate/refetch table or item queries after successful mutations
- [ ] Add unit tests for query enablement, pagination, mutation states, and invalidation

## Phase 4: UI Components
- [ ] Replace the DynamoDB placeholder page with a paginated table list
- [ ] Display table metadata and key schema
- [ ] Implement explicit Query-by-key and Scan modes with typed key inputs
- [ ] Render paginated items as readable structured data
- [ ] Add confirmed item deletion using the complete item key
- [ ] Add confirmed table deletion with a clear warning that all table items are deleted
- [ ] Implement loading, empty, error, retry, and pagination states
- [ ] Verify responsive layout, keyboard navigation, and accessible labels
- [ ] Add unit tests for table selection, query/scan controls, pagination, and deletion confirmations

## Phase 5: Application Integration
- [ ] Confirm the existing DynamoDB route and navigation show the implemented page
- [ ] Integrate active endpoint and region settings
- [ ] Reuse project-owned UI components and notification patterns

## Phase 6: Validation
- [ ] Run relevant lint, typecheck, and build commands
- [ ] Run DynamoDB unit tests
- [ ] Exercise table listing, key Query, Scan pagination, and deletions in a browser against the local emulator
- [ ] Verify empty results, invalid key values, request failures, and deletion failures
- [ ] Verify table deletion confirmation communicates that all items will be permanently deleted

## Phase 7: Documentation
- [ ] Update directly related architecture or feature documentation if needed

## Dependencies
- `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`, if not already installed
- Existing settings, AWS client, React Query, and project UI infrastructure

## Notes
- `Query` is the key-based lookup path; `Scan` is a separate, explicit operation and is paginated.
- Table deletion permanently deletes all items in that table. Item deletion removes only the selected item.
- Table/item creation, item updates, PartiQL, transactions, and index management are out of scope.
