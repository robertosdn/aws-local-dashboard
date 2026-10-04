# Implementation Tasks: DynamoDB Management

## Phase 1: Foundation and Types

- [X] Add `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` if they are not already installed
- [X] Define table summary, key schema, item, cursor, query, and scan types
- [X] Add a DynamoDB client factory to the shared AWS service and configure a Document Client for item operations

## Phase 2: API and Data Layer

- [X] Implement paginated table listing
- [X] Implement table description and key-schema mapping
- [X] Implement primary-key Query with supported sort-key conditions
- [X] Implement bounded Scan with continuation-key pagination
- [X] Implement item deletion using the complete primary key
- [X] Implement table deletion and surface table lifecycle/error responses
- [X] Ensure the underlying client is destroyed after every operation
- [X] Add unit tests for request mapping, key validation, pagination, deletion, and API errors

## Phase 3: State Management

- [X] Implement table-list and table-details query hooks
- [X] Implement Query and Scan hooks with distinct query keys and cursors
- [X] Implement item and table deletion mutation hooks
- [X] Include active endpoint, region, table, mode, conditions, and cursors in query keys as applicable
- [X] Invalidate/refetch table or item queries after successful mutations
- [X] Add unit tests for query enablement, pagination, mutation states, and invalidation

## Phase 4: UI Components

- [X] Use `Tables` as the main table-list page title, with `DynamoDB` as the service/category label
- [X] Provide a `View` action for table metadata, including creation date and secondary indexes
- [X] Provide an `Items` action for the records stored in a table, separate from metadata viewing
- [X] Replace the DynamoDB placeholder page with a paginated table list
- [X] Display table metadata and key schema
- [X] Map and display global/local secondary index names and key schemas in the View screen
- [X] Implement explicit Query-by-key and Scan modes with typed key inputs
- [X] Render paginated items as readable structured data
- [X] Display every returned item attribute and complete long/nested values without a clipped results pane
- [X] Provide previous/next item-page navigation using Query/Scan continuation keys
- [X] Add confirmed item deletion using the complete item key
- [X] Add confirmed table deletion with a clear warning that all table items are deleted
- [X] Implement loading, empty, error, retry, and pagination states
- [X] Verify responsive layout, keyboard navigation, and accessible labels
- [X] Add unit tests for table selection, query/scan controls, pagination, and deletion confirmations

## Phase 5: Application Integration

- [X] Confirm the existing DynamoDB route and navigation show the implemented page
- [X] Integrate active endpoint and region settings
- [X] Reuse project-owned UI components and notification patterns

## Phase 6: Validation

- [X] Run relevant lint, typecheck, and build commands
- [X] Run DynamoDB unit tests
- [X] Exercise table listing, key Query, Scan pagination, and deletions in a browser against the local emulator
- [X] Verify empty results, invalid key values, request failures, and deletion failures
- [X] Verify table deletion confirmation communicates that all items will be permanently deleted

## Phase 7: Documentation

- [X] Update directly related architecture or feature documentation if needed

## Phase 8: Local MinStack Resource Provisioning

- [X] Create `scripts/create-dynamodb-test-table.mjs` to create the example DynamoDB table in MinStack, defaulting to the local endpoint and dummy credentials, with `AWS_ENDPOINT`, `AWS_REGION`, and `TABLE_NAME` overrides
- [X] Make the table-creation script wait for the table to become active and safely reuse an existing table without deleting resources
- [X] Create a separate `scripts/put-dynamodb-test-items.mjs` to add deterministic sample items to the table; do not combine item insertion with table creation
- [X] Default the item-insertion script to the local endpoint and dummy credentials, with `AWS_ENDPOINT`, `AWS_REGION`, and `TABLE_NAME` overrides, and safely upsert samples without deleting resources
- [X] Verify the table-creation and item-insertion scripts separately, then confirm the provisioned table and items are visible in the dashboard connected to MinStack

## Dependencies

- `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`, if not already installed
- Existing settings, AWS client, React Query, and project UI infrastructure

## Notes

- `Query` is the key-based lookup path; `Scan` is a separate, explicit operation and is paginated.
- Table deletion permanently deletes all items in that table. Item deletion removes only the selected item.
- Table/item creation, item updates, PartiQL, transactions, and index management are out of scope.
- The table/item creation exclusion applies to dashboard UI functionality; separate local MinStack scripts for table creation and sample item insertion are required to prepare development data.
