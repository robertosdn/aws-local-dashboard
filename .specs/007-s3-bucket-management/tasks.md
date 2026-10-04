# Implementation Tasks: S3 Bucket Browser

## Phase 1: Foundation and Types
- [X] Add `@aws-sdk/client-s3` if it is not already installed
- [X] Create S3 bucket, object, and paginated response types
- [X] Extend the shared AWS service with an S3 client factory

## Phase 2: API and Data Layer
- [X] Implement bucket listing with bucket name and creation date
- [X] Implement paginated object listing using `ListObjectsV2`
- [X] Implement object deletion using `DeleteObject`
- [X] Implement empty-bucket deletion using `DeleteBucket`; do not automatically delete bucket contents
- [X] Ensure S3 clients are destroyed after each operation
- [X] Surface API errors using existing error-handling patterns
- [X] Add unit tests for API mapping, pagination, deletion requests, and error behavior

## Phase 3: State Management
- [X] Implement bucket-list and bucket-object query hooks
- [X] Implement bucket and object deletion mutation hooks
- [X] Include endpoint, region, bucket, and pagination state in query keys as applicable
- [X] Wire refresh, retry, and connection-settings behavior
- [X] Invalidate/refetch the bucket list or object pages after successful deletion
- [X] Add unit tests for query enablement, pagination, deletion, and invalidation behavior

## Phase 4: UI Components
- [X] Replace the S3 placeholder page with a bucket list
- [X] Implement the selected bucket's object list
- [X] Display bucket and object metadata, including human-readable object sizes
- [X] Add confirmed delete actions for individual objects and empty buckets
- [X] Keep non-empty buckets intact and show the deletion error; never auto-delete their objects
- [X] Add loading, empty, error, retry, refresh, and pagination states
- [X] Verify responsive layout, keyboard navigation, and accessible labels
- [X] Add unit tests for bucket selection, object-list interactions, and deletion confirmations/states
- [X] Implement a separate read-only `View` screen for creation date, region, versioning, encryption, and public-access-block settings
- [X] Keep `Open` dedicated to browsing objects and add loading, retry, and explicit unconfigured states for bucket configuration
- [X] Add unit tests for bucket configuration display, optional absent configurations, and request errors

## Phase 5: Application Integration
- [X] Confirm the existing S3 route and navigation display the implemented page
- [X] Integrate active endpoint and region settings
- [X] Reuse existing project-owned UI components and notification patterns

## Phase 6: Validation
- [X] Run relevant lint, typecheck, and build commands
- [X] Run S3 unit tests
- [X] Exercise bucket listing and object pagination in a browser against the local emulator
- [X] Verify object deletion, empty-bucket deletion, and that deleting a non-empty bucket does not remove its objects
- [X] Verify empty buckets, request failures, retry, and connection-setting changes
- [X] Verify that `View` shows bucket metadata/configuration without opening objects, while `Open` still shows objects
- [X] Verify configuration API errors remain visible and absent optional configurations are labeled as not configured

## Phase 7: Documentation
- [X] Update directly related architecture or feature documentation if needed

## Dependencies
- `@aws-sdk/client-s3`, if not already installed
- Existing settings, AWS client, React Query, and project UI infrastructure

## Phase 8: Local MinStack Resource Provisioning
- [X] Create `scripts/create-s3-test-bucket.mjs` to create or safely reuse the example S3 bucket in MinStack, defaulting to the local endpoint and dummy credentials, with `AWS_ENDPOINT`, `AWS_REGION`, and `BUCKET_NAME` overrides
- [X] Make the bucket-creation script safe for repeat use without deleting buckets or objects
- [X] Create a separate `scripts/upload-s3-test-objects.mjs` to upload deterministic sample objects; do not combine object upload with bucket creation
- [X] Default the sample-object script to the local endpoint and dummy credentials with the same overrides, without deleting existing data
- [X] Verify the bucket-creation and sample-object scripts separately, then confirm the provisioned bucket and objects are visible in the dashboard connected to MinStack

## Notes
- Object upload, download, editing, and content preview are outside this feature's scope.
- Bucket deletion is allowed only when empty; deleting a bucket never recursively deletes its objects.
