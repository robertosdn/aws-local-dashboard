# Product Requirements Document: DynamoDB Page Naming

## Overview

This document defines the naming conventions for the DynamoDB page, correcting labels to match AWS service naming and clarify the distinction between tables list and table actions.

## Requirements

### Page Header

- Category label (uppercase small text): **"DynamoDB"** (not "Database")
- Main title: **"Tables"** (not "aws local DynamoDB")

### Table List View
- The main page title is **"Tables"**.
- Each table row has three actions:
  1. **View** - View table metadata: creation date, key schema, and secondary indexes
  2. **Items** - View/query the records stored in the table (Query by Key / Scan Table tabs)
  3. **Delete** - Remove the table permanently

### View: Table Metadata
- Shows table metadata with:
  - Creation date
  - Key Schema (Partition Key, Sort Key)
  - Global and local secondary indexes, including their names and key schemas
  - Item Count and Size when available

### Items: Table Records
- Tabs for item operations:
  - **Query by Key** - Query items using partition/sort key
  - **Scan Table** - Full table scan

## User Experience

- Consistent AWS service naming: "DynamoDB" in header (like SQS, Lambda, S3)
- Clear page identification with the "Tables" title and "DynamoDB" service label
- Action buttons use descriptive labels: "View", "Items", "Delete"
- Distinction between table metadata (View) and table records (Items)
