# Implementation Tasks: S3 Bucket Browser

## Phase 1: Foundation and Types
- [ ] Add `@aws-sdk/client-s3` if it is not already installed
- [ ] Create S3 bucket, object, and paginated response types
- [ ] Extend the shared AWS service with an S3 client factory

## Phase 2: API and Data Layer
- [ ] Implement bucket listing with bucket name and creation date
- [ ] Implement paginated object listing using `ListObjectsV2`
- [ ] Implement object deletion using `DeleteObject`
- [ ] Implement empty-bucket deletion using `DeleteBucket`; do not automatically delete bucket contents
- [ ] Ensure S3 clients are destroyed after each operation
- [ ] Surface API errors using existing error-handling patterns
- [ ] Add unit tests for API mapping, pagination, deletion requests, and error behavior

## Phase 3: State Management
- [ ] Implement bucket-list and bucket-object query hooks
- [ ] Implement bucket and object deletion mutation hooks
- [ ] Include endpoint, region, bucket, and pagination state in query keys as applicable
- [ ] Wire refresh, retry, and connection-settings behavior
- [ ] Invalidate/refetch the bucket list or object pages after successful deletion
- [ ] Add unit tests for query enablement, pagination, deletion, and invalidation behavior

## Phase 4: UI Components
- [ ] Replace the S3 placeholder page with a bucket list
- [ ] Implement the selected bucket's object list
- [ ] Display bucket and object metadata, including human-readable object sizes
- [ ] Add confirmed delete actions for individual objects and empty buckets
- [ ] Keep non-empty buckets intact and show the deletion error; never auto-delete their objects
- [ ] Add loading, empty, error, retry, refresh, and pagination states
- [ ] Verify responsive layout, keyboard navigation, and accessible labels
- [ ] Add unit tests for bucket selection, object-list interactions, and deletion confirmations/states

## Phase 5: Application Integration
- [ ] Confirm the existing S3 route and navigation display the implemented page
- [ ] Integrate active endpoint and region settings
- [ ] Reuse existing project-owned UI components and notification patterns

## Phase 6: Validation
- [ ] Run relevant lint, typecheck, and build commands
- [ ] Run S3 unit tests
- [ ] Exercise bucket listing and object pagination in a browser against the local emulator
- [ ] Verify object deletion, empty-bucket deletion, and that deleting a non-empty bucket does not remove its objects
- [ ] Verify empty buckets, request failures, retry, and connection-setting changes

## Phase 7: Documentation
- [ ] Update directly related architecture or feature documentation if needed

## Dependencies
- `@aws-sdk/client-s3`, if not already installed
- Existing settings, AWS client, React Query, and project UI infrastructure

## Notes
- Object upload, download, editing, and content preview are outside this feature's scope.
- Bucket deletion is allowed only when empty; deleting a bucket never recursively deletes its objects.
