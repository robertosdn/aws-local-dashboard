# Product Requirements Document: Sidebar Navigation Naming

## Overview

This document defines the naming conventions for the sidebar navigation and page titles related to AWS SQS (Simple Queue Service) resources.

## Requirements

### Sidebar Navigation

- The sidebar navigation item for SQS queues must display **"SQS"** (not "Queues")
- Path: `/queues` (unchanged)
- Icon: MessageSquare (unchanged)

### Page Title

- When navigating to the SQS page, the page header must display **"Queues"** as the main title
- The subtitle/category label remains "SQS" (already implemented)

### Queue List

- The list of queues displayed on the SQS page is referred to as **"queues"** (lowercase)
- This is the data listing, not a navigation label

## User Experience

- Consistent AWS service naming in sidebar (SQS, Lambda, DynamoDB, S3, etc.)
- Clear page identification with the "Queues" title
- Distinction between service name (SQS) and resource collection (queues)
