# Product Requirements Document: SQS Queue Messaging and Details

## Overview

The SQS queue management feature lets users list queues, inspect messages, and purge queues, but it cannot produce messages and does not surface how a queue was created or configured. Developers testing local workflows must leave the dashboard to seed a queue or to inspect its attributes. This feature adds two capabilities: publishing a message to a queue directly from the dashboard (so a queue can be populated and downstream consumers, for example a Lambda function triggered by an SQS event source mapping, can be exercised), and viewing a queue's creation details and configuration.

## Target Users

- Developers running the dashboard against a local AWS-compatible emulator (MinStack on `localhost:4566`).
- Developers validating event-driven flows that consume SQS messages.

## User Stories

### Page Identification

- The queue collection page keeps **"Queues"** as its main title and **"SQS"** as the service/category label.
- Sending a message and viewing queue details are actions on a specific queue; they do not add a new page or route.

### US-001: Send a Message to a Queue

**As a** developer using the local AWS emulator  
**I want to** send a message to a queue from the dashboard  
**So that** I can populate a queue and exercise consumers without switching to the AWS CLI

**Acceptance Criteria:**

- Each row in the queue table exposes a **Send Message** action represented by a send/paper-plane icon button.
- Activating the action opens a dialog bound to that specific queue; the target queue name is shown and cannot be changed inside the dialog (the queue is chosen by selecting its row).
- The dialog provides a required message body field (multi-line text).
- The dialog allows adding zero or more **message attributes** as string key/value pairs, including the ability to add and remove attribute rows.
- Submitting with an empty body is rejected with an inline validation message and no request is sent.
- An attribute row that is partially filled (a key without a value, or a value without a key) is rejected with an inline validation message; fully blank rows are ignored.
- Duplicate attribute keys are rejected with an inline validation message.
- On success the dialog **stays open** so the user can send additional messages, the body and attributes are cleared, and a success toast is shown including the returned message ID.
- On failure the dialog stays open, the entered content is preserved, and an error toast surfaces the failure reason.
- The queue list message counts are refreshed after a successful send.

### US-002: Consistent Queue Row Actions

**As a** developer  
**I want to** find the send action alongside the existing queue actions  
**So that** queue operations remain predictable

**Acceptance Criteria:**

- The queue row action order is **View → View Messages → Send Message → Purge**.
- The send action uses a send/paper-plane icon (not a trash or cleaning icon).
- Each action exposes an accessible label that names the queue, for example "Send message to {queue name}".
- Existing View Messages and Purge behavior is unchanged.

### US-003: View Queue Details

**As a** developer using the local AWS emulator  
**I want to** view the creation details and configuration of a queue  
**So that** I can confirm how a queue was created and configured without leaving the dashboard

**Acceptance Criteria:**

- Each queue row exposes a **View** action represented by an info icon button, placed as the first action.
- Activating the action opens a dialog bound to that specific queue, showing the queue name and URL.
- The dialog lists all attributes returned by `GetQueueAttributes` (`AttributeNames: All`), including ARN, creation and last-modified timestamps, visibility timeout, message retention period, maximum message size, delay seconds, receive message wait time, FIFO flags, redrive policy (dead-letter queue), and encryption settings.
- Attributes are fetched on demand when the dialog opens; they are not reused from the queue list.
- Timestamp attributes are shown as human-readable local dates, and JSON-valued attributes are shown formatted.
- A loading state is shown while fetching, and an error state with a retry action is shown if the fetch fails.
- Closing the dialog returns to the queue list without changing other page state.

## Non-Functional Requirements

- All operations target the configured endpoint (local emulator by default) with dummy credentials.
- No permanent AWS credentials are stored in the frontend, build-time environment variables, or browser storage.
- The dialog is keyboard accessible: focus is trapped while open, `Escape` closes it, and controls have associated labels.
- The dialog remains usable on narrow viewports (no horizontal overflow).
- The send operation disables its submit control while in progress to prevent duplicate submissions.

## Out of Scope

- Choosing the target queue from inside the send dialog (the queue is selected by the table row).
- Editing queue attributes or creating/deleting queues from the dashboard.
- Queue tags (`ListQueueTags`); only attributes returned by `GetQueueAttributes` are shown.
- FIFO-specific fields (`MessageGroupId`, `MessageDeduplicationId`) and `DelaySeconds` when sending.
- Binary message attributes.
- Batch sends and message scheduling.
- Modifying the existing `scripts/` provisioning or data-seeding helpers.
