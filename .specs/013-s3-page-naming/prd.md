# Product Requirements Document: S3 Page Naming

## Overview
This document defines the naming conventions for the S3 page, correcting labels to match AWS service naming and clarify bucket actions.

## Requirements

### Page Header
- Category label (uppercase small text): **"S3"** (not "Storage")
- Main title: **"aws local S3"** (not "S3 Buckets")

### Bucket List View
- The list displays **"Buckets"** (plural, lowercase in context) - this is the collection of buckets
- Each bucket row has three actions:
  1. **View** - View bucket metadata: creation date, region, versioning, encryption, etc.
  2. **Open** - Browse bucket contents (objects/files)
  3. **Delete** - Remove the bucket permanently (requires empty bucket)

### Bucket Contents View
- When a bucket is opened, shows object listing with pagination
- Objects have "Delete" action

## User Experience
- Consistent AWS service naming: "S3" in header (like SQS, Lambda, DynamoDB)
- Clear page identification: "aws local S3"
- Action buttons use descriptive labels: "View", "Open", "Delete"
- Distinction between bucket metadata (View) and bucket contents (Open)