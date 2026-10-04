# Product Requirements Document: S3 Bucket Browser

## Overview
Enable developers to inspect S3 buckets in their local AWS-compatible environment and browse the files stored in each bucket from the dashboard.

## Target Users
- Developers using a local AWS emulator to test S3 resources

## User Stories

### US-001: List S3 Buckets
**As a** developer  
**I want to** see the buckets available in my environment  
**So that** I can find and select a bucket to inspect

**Acceptance Criteria:**
- Display each bucket's name and creation date when available
- Show a loading state while the bucket list is being retrieved
- Show a clear empty state when no buckets exist
- Show an actionable error state when the bucket list cannot be loaded
- Provide a way to refresh the list

### US-002: Browse Bucket Contents
**As a** developer  
**I want to** open a bucket and see its files  
**So that** I can inspect the objects stored in it

**Acceptance Criteria:**
- Selecting a bucket displays its objects
- For each object, display its name, size, and last-modified date when available
- Support browsing buckets with more objects than can be shown at once
- Show a clear empty state when a bucket contains no objects
- Provide a way to return to the bucket list

### US-003: Delete an Object
**As a** developer, **I want to** delete an object from a bucket, **so that** I can remove test files I no longer need.

**Acceptance Criteria:**
- Provide a delete action for each object
- Require confirmation before deleting an object
- Show success or actionable error feedback after the operation
- Refresh the current object list after successful deletion
- Disable the delete action while the operation is in progress

### US-004: Delete a Bucket
**As a** developer, **I want to** delete a bucket, **so that** I can remove test resources I no longer need.

**Acceptance Criteria:**
- Provide a delete action for each bucket
- Require confirmation that identifies the bucket before deletion
- Only delete the bucket when it is empty; do not automatically delete its objects
- If the bucket is not empty or deletion fails, explain the error and keep the bucket visible
- Refresh the bucket list after successful deletion
- Disable the delete action while the operation is in progress

## Non-Functional Requirements
- Work with the configured AWS-compatible endpoint and region
- Do not require users to store permanent AWS credentials in the dashboard
- Keep the bucket and object views usable on mobile and desktop
- Support keyboard navigation and accessible labels for interactive controls

## Out of Scope
- Uploading, downloading, or editing objects
- Creating buckets
- Editing bucket policies, permissions, or configuration
- Previewing object contents
