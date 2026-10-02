# Product Requirements Document: SQS Queue Management

## Overview
Enable users to list SQS queues, view messages in a queue, and purge queues from the dashboard.

## User Stories

### US-001: List SQS Queues
**As a** developer using local AWS emulator  
**I want to** see all SQS queues in a table  
**So that** I can quickly identify and select queues to inspect

**Acceptance Criteria:**
- Display queue name, URL, and message count
- Show approximate number of messages (visible + delayed + not visible)
- Refresh button to reload queue list
- Loading state while fetching queues
- Error state if connection fails

### US-002: View Queue Messages
**As a** developer  
**I want to** click a queue and see its messages  
**So that** I can inspect message contents without consuming them

**Acceptance Criteria:**
- Click queue row to open message viewer (modal or page)
- Display message ID, body, attributes, and receipt handle
- Support pagination for queues with many messages
- "Peek" mode - messages remain in queue (ReceiveMessage with WaitTimeSeconds=0, MaxNumberOfMessages=10)
- Close viewer to return to queue list

### US-003: Purge Queue
**As a** developer  
**I want to** purge all messages from a queue  
**So that** I can reset queue state during development

**Acceptance Criteria:**
- Purge button in queue row and/or message viewer
- Queue row actions include viewing messages and purging only; do not show an "Open in AWS console" action
- Represent the purge action with a cleaning/brush icon instead of a trash icon
- Confirmation dialog before purge (destructive action)
- Show success/error toast after operation
- Auto-refresh queue list after purge
- Disable purge while operation in progress

## Non-Functional Requirements
- All operations against local emulator (localhost:4566)
- No permanent AWS credentials in frontend
- Responsive table design for mobile/desktop
- Accessible UI (keyboard navigation, ARIA labels)