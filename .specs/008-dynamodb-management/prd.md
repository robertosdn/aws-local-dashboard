# Product Requirements Document: DynamoDB Management

## Overview

Enable developers to inspect DynamoDB tables and their items in the configured AWS-compatible environment, find items by their primary keys, scan table contents, and remove items or tables during local development.

## Target Users

- Developers using a local AWS emulator to inspect and manage DynamoDB resources

## User Stories

### Page Identification

- The DynamoDB table-list page uses **"Tables"** as its main title.
- The service/category label remains **"DynamoDB"**.

### US-001: List DynamoDB Tables

**As a** developer, **I want to** see the tables available in my environment, **so that** I can select a table to inspect.

**Acceptance Criteria:**

- Display table names and available basic metadata, including status and item count when provided
- Support paginated table lists
- Show loading, empty, and actionable error states
- Provide a way to refresh the list

### US-002: View Table Details and Items

**As a** developer, **I want to** open a table and inspect its key schema and items, **so that** I can understand the table structure and its data.

**Acceptance Criteria:**
- Provide a `View` action for table metadata and a separate `Items` action for the records stored in the table
- In the `View` screen, display the table creation date and its global and local secondary indexes when present
- In the `Items` screen, show the table's records with Query and Scan controls
- Display the table's partition key and optional sort key, including their DynamoDB types
- Display returned items as readable structured data
- Support pagination for item results
- Show loading, empty, and actionable error states
- Provide a way to return to the table list

### US-003: Find Items by Primary Key

**As a** developer, **I want to** query items using a table's primary key, **so that** I can find matching records without scanning the entire table.

**Acceptance Criteria:**

- Provide a key-based query mode using the partition key and, when present, optional sort-key conditions
- Validate required key values and their DynamoDB types before submitting
- Support pagination through matching results
- Clearly distinguish a query with no matches from a failed request

### US-004: Scan a Table

**As a** developer, **I want to** scan a table's items, **so that** I can browse records when I do not know their partition key.

**Acceptance Criteria:**

- Provide an explicit scan mode separate from primary-key query
- Retrieve items in bounded pages and allow loading subsequent pages
- Clearly indicate that scan reads table items and may require multiple requests
- Show loading, empty, and actionable error states

### US-005: Delete an Item

**As a** developer, **I want to** delete an item from a table, **so that** I can remove test data I no longer need.

**Acceptance Criteria:**

- Provide a delete action for each returned item
- Require confirmation that identifies the table and item key before deletion
- Delete using the complete primary key, including the sort key when present
- Refresh the current result set after successful deletion
- Show success or actionable error feedback and disable the action while deletion is in progress

### US-006: Delete a Table

**As a** developer, **I want to** delete a table, **so that** I can remove a local test resource I no longer need.

**Acceptance Criteria:**

- Provide a delete action for a table
- Require explicit confirmation that identifies the table and warns that deleting it also permanently deletes all its items
- Show success or actionable error feedback
- Refresh the table list after successful deletion
- Disable the action while deletion is in progress

## Non-Functional Requirements

- Use the active AWS-compatible endpoint and region configured in the dashboard
- Do not require permanent AWS credentials to be stored in the dashboard
- Keep table and item views usable on mobile and desktop with keyboard-accessible controls
- Bound each table and item request and expose pagination rather than loading unbounded results
- Preserve DynamoDB value types and nested document values when displaying and deleting items

## Out of Scope

- Creating tables or items
- Updating item attributes or table configuration
- PartiQL queries, transactions, index creation/modification/deletion, and CloudWatch metrics
- Exporting complete tables or automatically scanning all pages in the background
