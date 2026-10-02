# PRD: Lambda Management Feature

## Overview
Add Lambda function management capabilities to the dashboard, allowing users to view, inspect, and control Lambda functions with their event source mappings (particularly SQS triggers).

## User Stories

### US-001: List Lambda Functions
**As a** developer  
**I want to** see a list of all Lambda functions  
**So that** I can quickly find and select a function to inspect

**Acceptance Criteria:**
- Display paginated list of Lambda functions
- Show function name, runtime, last modified, memory size, timeout
- Support filtering by name/runtime
- Support sorting by name, last modified, runtime
- Click to navigate to detail view

### US-002: View Lambda Details
**As a** developer  
**I want to** view detailed information about a Lambda function  
**So that** I can understand its configuration and event sources

**Acceptance Criteria:**
- Display function metadata (ARN, runtime, handler, memory, timeout, env vars)
- Display code configuration (S3 bucket/key, image URI, layers)
- Display event source mappings in a dedicated section
- For SQS event sources: show queue name, batch size, max batching window, filter criteria
- Show function status (Active/Inactive/Failed)

### US-003: Manage Event Source Mappings
**As a** developer  
**I want to** enable/disable/delete event source mappings  
**So that** I can control what triggers my Lambda

**Acceptance Criteria:**
- List all event source mappings for the function
- Show mapping state (Enabled/Disabled/Deleting)
- Enable/Disable toggle for each mapping
- Delete mapping with confirmation
- Create new SQS event source mapping (optional stretch goal)

## Non-Functional Requirements
- Response time < 2s for list/detail views
- Handle 100+ Lambda functions gracefully
- Works with localstack/ministack emulator
- No AWS credentials stored in frontend

## Out of Scope
- Creating new Lambda functions
- Updating function code/configuration
- CloudWatch Logs integration (future)
- Dead letter queue configuration